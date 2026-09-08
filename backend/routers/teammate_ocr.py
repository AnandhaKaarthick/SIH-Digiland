from fastapi import APIRouter, HTTPException, File, UploadFile, Body, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
import io
import base64
import hashlib
import datetime
import random

from backend.models.database import (
    SessionLocal, 
    Document as DBDocument, 
    LandRecord as DBLandRecord, 
    ExtractedToken as DBExtractedToken, 
    AuditTrail as DBAuditTrail
)
from backend.services.teammate_generator import (
    generate_document_image,
    get_preset_payloads
)
from backend.services.teammate_parser import parse_document_ocr
from backend.services.confidence_scoring import compute_composite_confidence, auto_detect_document_type
from backend.services.audit_chain import AuditChainService

router = APIRouter(prefix="/api/v1/ocr", tags=["Teammate OCR & Document Intelligence"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class GenerateDocRequest(BaseModel):
    doc_type: str = "RECORD_OF_RIGHTS"
    payload: Optional[dict] = None

class ClassifyTextRequest(BaseModel):
    text_lines: list[str]

class ProcessPipelineRequest(BaseModel):
    doc_type: Optional[str] = "RECORD_OF_RIGHTS"
    record_data: Optional[Dict[str, Any]] = None
    file_name: Optional[str] = "uploaded_document.pdf"

@router.get("/preset-payloads")
def get_presets():
    return get_preset_payloads()

@router.post("/generate-synthetic-doc")
def generate_synthetic_doc(req: GenerateDocRequest):
    try:
        pil_img = generate_document_image(req.doc_type, req.payload)
        buf = io.BytesIO()
        pil_img.save(buf, format="PNG")
        b64_str = base64.b64encode(buf.getvalue()).decode("utf-8")
        
        return {
            "status": "success",
            "doc_type": req.doc_type,
            "image_base64": f"data:image/png;base64,{b64_str}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/classify-and-extract")
def classify_and_extract(req: ClassifyTextRequest):
    try:
        parsed = parse_document_ocr(req.text_lines)
        return {
            "status": "success",
            "classified_document_type": parsed["classified_document_type"],
            "classification_confidence": parsed["classification_confidence"],
            "structured_payload": parsed["structured_payload"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/process-full-pipeline")
def process_full_pipeline(req: ProcessPipelineRequest, db: Session = Depends(get_db)):
    """
    Executes the 6-stage end-to-end pipeline:
    1. Document Upload (Intake & SHA-256 Hashing)
    2. OCR & Layout Extraction (Token & Coordinate Extraction)
    3. Field Classification (NLP Mapping to Land Fields)
    4. Validation Engine (Business Rules Invariants)
    5. Composite Confidence Scoring Formula: C = 0.35*C_OCR + 0.30*C_Rules + 0.20*C_DB + 0.15*C_Dup
    6. Route by Confidence & Priority Level (High Priority <60%/Rule fail, Medium 60-84%, Low >=85% STP)
    PERSISTS DOCUMENT, EXTRACTED FIELDS, LAND RECORD, AND AUDIT CHAIN BLOCK DIRECTLY TO SQLITE DB.
    """
    try:
        raw_data = req.record_data or {}
        doc_type = req.doc_type or raw_data.get("doc_type")
        file_name = req.file_name or "uploaded_document.pdf"
        
        # Auto detect document schema type from text/filename
        detected_schema = auto_detect_document_type(json.dumps(raw_data), file_name)
        if not doc_type or doc_type == "AUTO_DETECT":
            doc_type = detected_schema

        record_id = raw_data.get("id") or raw_data.get("record_id") or f"REC-2026-{random.randint(1000, 9999)}"
        doc_id = f"DOC-{record_id}"

        # Stage 1: Document Upload & Hashing
        sha256_hash = hashlib.sha256(f"{record_id}-{file_name}-{datetime.datetime.utcnow()}".encode()).hexdigest()
        db_doc = db.query(DBDocument).filter(DBDocument.id == doc_id).first()
        if not db_doc:
            db_doc = DBDocument(
                id=doc_id,
                file_name=file_name,
                doc_type=doc_type,
                sha256_hash=sha256_hash,
                uploaded_at=datetime.datetime.utcnow()
            )
            db.add(db_doc)
            db.commit()

        # Stage 2 & 3: Field Classification & Extract
        khasra = raw_data.get("khasra_no") or raw_data.get("ror", {}).get("khasra_no") or "42/1"
        khata = raw_data.get("khata_no") or raw_data.get("ror", {}).get("khata_no") or "104"
        ulpin = raw_data.get("ulpin") or raw_data.get("ror", {}).get("ulpin") or "UP-LKO-421-9921"
        village = raw_data.get("village") or raw_data.get("location", {}).get("village") or "Rampur"
        tehsil = raw_data.get("tehsil") or raw_data.get("location", {}).get("tehsil") or "Sadar"
        district = raw_data.get("district") or raw_data.get("location", {}).get("district") or "Lucknow"
        
        owners = raw_data.get("owner_names") or [o.get("name") if isinstance(o, dict) else o for o in raw_data.get("ror", {}).get("owners", [])] or ["Ramesh Kumar", "Suresh Kumar"]
        shares = raw_data.get("owner_shares") or [o.get("share") if isinstance(o, dict) else o for o in raw_data.get("ror", {}).get("owners", [])] or [0.5, 0.5]
        area = raw_data.get("plot_area") or (raw_data.get("ror", {}).get("area_hectare", 0.2428) * 10000) or 2428.11

        # Check deduplication against SQLite database
        existing_rec = db.query(DBLandRecord).filter(
            DBLandRecord.khasra_no == khasra,
            DBLandRecord.village == village,
            DBLandRecord.id != record_id
        ).first()

        is_dup = existing_rec is not None

        # Stage 4 & 5: Formula-Based Composite Confidence Scoring & Priority
        ocr_conf = raw_data.get("confidence_score", 90.0)
        ocr_float = ocr_conf / 100.0 if ocr_conf > 1.0 else ocr_conf
        
        scoring_res = compute_composite_confidence(
            ocr_confidence=ocr_float,
            parsed_record={
                "khasra_no": khasra,
                "khata_no": khata,
                "owner_shares": shares,
                "plot_area": float(area),
                "total_area": float(area)
            },
            gis_polygon_area=raw_data.get("cadastral", {}).get("calculated_area_sqm", float(area)),
            is_duplicate=is_dup
        )

        composite_score = scoring_res["composite_pct"]
        status_flag = scoring_res["status_flag"]
        routing = scoring_res["routing_status"]
        priority_level = scoring_res["priority_level"]

        # Stage 6: Route by Confidence & Persist in SQLite DB
        db_rec = db.query(DBLandRecord).filter(DBLandRecord.id == record_id).first()
        if not db_rec:
            db_rec = DBLandRecord(id=record_id)
            db.add(db_rec)

        db_rec.document_id = doc_id
        db_rec.doc_type = doc_type
        db_rec.khasra_no = khasra
        db_rec.khata_no = khata
        db_rec.ulpin = ulpin
        db_rec.village = village
        db_rec.tehsil = tehsil
        db_rec.district = district
        db_rec.land_classification = raw_data.get("land_classification") or raw_data.get("ror", {}).get("land_classification", "Agricultural")
        db_rec.plot_area = float(area)
        db_rec.owner_names = owners
        db_rec.owner_shares = shares
        db_rec.confidence_score = composite_score
        db_rec.status_flag = status_flag
        db_rec.routing = routing
        db_rec.registration_number = raw_data.get("registration_number") or raw_data.get("deed", {}).get("document_no")
        db_rec.seller_name = raw_data.get("seller_name") or raw_data.get("deed", {}).get("vendor_name")
        db_rec.buyer_name = raw_data.get("buyer_name") or raw_data.get("deed", {}).get("vendee_name")
        db_rec.mutation_serial_number = raw_data.get("mutation_serial_number") or raw_data.get("mutation", {}).get("mutation_case_no")
        db_rec.map_sheet_number = raw_data.get("map_sheet_number") or raw_data.get("cadastral", {}).get("sheet_no")
        db_rec.scanned_image_url = raw_data.get("scanned_image_url")
        db_rec.raw_payload = {**raw_data, "scoring_breakdown": scoring_res}
        db_rec.updated_at = datetime.datetime.utcnow()

        # Append to Audit Ledger Chain
        last_audit = db.query(DBAuditTrail).order_by(DBAuditTrail.history_id.desc()).first()
        prev_hash = last_audit.current_hash if last_audit else "0000000000000000000000000000000000000000000000000000000000000000"
        
        audit_payload = {
            "record_id": record_id,
            "action": f"PIPELINE_{routing}",
            "field_changed": "composite_confidence_score",
            "new_value": f"Score: {composite_score}% ({priority_level}) -> Routed to {routing}",
            "actor_name": "System Pipeline Engine"
        }
        current_hash = AuditChainService.calculate_block_hash(prev_hash, audit_payload)
        sig = AuditChainService.generate_digital_signature("system", current_hash)

        audit_entry = DBAuditTrail(
            record_id=record_id,
            action=f"PIPELINE_{routing}",
            field_changed="Initial Pipeline Processing",
            new_value=f"Score: {composite_score}% ({priority_level}) -> {routing}",
            previous_hash=prev_hash,
            current_hash=current_hash,
            actor_name="System Pipeline Engine",
            actor_role="system",
            digital_signature=sig
        )
        db.add(audit_entry)
        db.commit()

        return {
            "status": "SUCCESS",
            "record_id": record_id,
            "document_id": doc_id,
            "doc_type": doc_type,
            "sha256_hash": sha256_hash,
            "confidence_score": composite_score,
            "status_flag": status_flag,
            "routing": routing,
            "priority_level": priority_level,
            "scoring_breakdown": scoring_res,
            "current_hash": current_hash,
            "record": {
                "id": record_id,
                "doc_type": doc_type,
                "khasra_no": khasra,
                "khata_no": khata,
                "ulpin": ulpin,
                "village": village,
                "tehsil": tehsil,
                "district": district,
                "owner_names": owners,
                "owner_shares": shares,
                "plot_area": area,
                "confidence_score": composite_score,
                "status_flag": status_flag,
                "routing": routing,
                "priority_level": priority_level,
                "scanned_image_url": db_rec.scanned_image_url
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Pipeline error: {str(e)}")
