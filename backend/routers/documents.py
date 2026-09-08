from fastapi import APIRouter, HTTPException, File, UploadFile
from pydantic import BaseModel
import hashlib
from backend.services.confidence_scoring import ConfidenceScoringService

router = APIRouter(prefix="/api/v1/documents", tags=["Document Ingestion"])

class UpstreamIngestionPayload(BaseModel):
    doc_id: str
    source_document_sha256: str
    extracted_fields: dict
    field_confidence: dict
    bounding_boxes: dict

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    content = await file.read()
    file_hash = hashlib.sha256(content).hexdigest()
    return {
        "doc_id": f"DOC-{file_hash[:8].upper()}",
        "file_name": file.filename,
        "size_bytes": len(content),
        "sha256_hash": file_hash,
        "status": "QUEUED_FOR_CV_OCR"
    }

@router.post("/process-document")
def process_upstream_json(payload: UpstreamIngestionPayload):
    """
    Entry point consuming structured JSON from upstream CV/OCR teammate module.
    Runs validation engine, computes composite confidence score, and determines routing.
    """
    evaluation = ConfidenceScoringService.evaluate_record(
        record_data=payload.extracted_fields,
        field_confidence=payload.field_confidence
    )
    
    return {
        "status": "PROCESSED",
        "doc_id": payload.doc_id,
        "source_hash": payload.source_document_sha256,
        "confidence_score": evaluation["composite_score"],
        "status_flag": evaluation["status_flag"],
        "routing": evaluation["routing"],
        "field_confidence": payload.field_confidence,
        "bounding_boxes": payload.bounding_boxes,
        "rules_breakdown": evaluation["rules_evaluation"]
    }
