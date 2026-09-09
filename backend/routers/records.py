from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy.orm import Session
import datetime
from backend.models.database import SessionLocal, LandRecord as DBLandRecord, AuditTrail as DBAuditTrail, Document as DBDocument
from backend.services.audit_chain import AuditChainService

router = APIRouter(prefix="/api/v1/records", tags=["Records & HITL Verification"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class CommitReviewRequest(BaseModel):
    record_id: str
    corrected_fields: Optional[dict] = None
    officer_name: str = "Rajesh Sharma, IRS"
    officer_role: str = "tehsildar"
    action: str = "APPROVE" # APPROVE, FLAG, REJECT

@router.get("")
def get_all_records(q: Optional[str] = None, db: Session = Depends(get_db)):
    """Fetches all land records stored in SQLite database with optional search query filtering."""
    query = db.query(DBLandRecord)
    if q:
        search_str = f"%{q.strip()}%"
        query = query.filter(
            (DBLandRecord.id.like(search_str)) |
            (DBLandRecord.khasra_no.like(search_str)) |
            (DBLandRecord.khata_no.like(search_str)) |
            (DBLandRecord.ulpin.like(search_str)) |
            (DBLandRecord.village.like(search_str)) |
            (DBLandRecord.tehsil.like(search_str)) |
            (DBLandRecord.district.like(search_str)) |
            (DBLandRecord.owner_names.like(search_str)) |
            (DBLandRecord.doc_type.like(search_str)) |
            (DBLandRecord.registration_number.like(search_str)) |
            (DBLandRecord.mutation_serial_number.like(search_str)) |
            (DBLandRecord.map_sheet_number.like(search_str))
        )
    records = query.order_by(DBLandRecord.created_at.desc()).all()
    return {
        "count": len(records),
        "records": records
    }

@router.get("/flagged")
def get_flagged_records(db: Session = Depends(get_db)):
    """Fetches records requiring human review (60-84% confidence or flagged)."""
    records = db.query(DBLandRecord).filter(
        DBLandRecord.routing.in_(["REQUIRES_REVIEW", "REJECTED_CRITICAL", "FLAGGED_WARNING"])
    ).all()
    return {
        "count": len(records),
        "records": records
    }

@router.get("/{record_id}")
def get_record_by_id(record_id: str, db: Session = Depends(get_db)):
    """Fetches single record by ID."""
    rec = db.query(DBLandRecord).filter(DBLandRecord.id == record_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Record not found")
    return rec

@router.post("/review/commit")
def commit_human_review(req: CommitReviewRequest, db: Session = Depends(get_db)):
    """
    Submits human officer correction/approval, updates SQLite DB record status,
    calculates cryptographic audit hash block, and applies Ed25519 digital signature.
    """
    rec = db.query(DBLandRecord).filter(DBLandRecord.id == req.record_id).first()
    
    # Get last audit block
    last_block = db.query(DBAuditTrail).order_by(DBAuditTrail.history_id.desc()).first()
    prev_hash = last_block.current_hash if last_block else "0000000000000000000000000000000000000000000000000000000000000000"

    # Update record status & corrected fields in DB if found
    if rec:
        if req.action == "APPROVE":
            rec.status_flag = "VALID"
            rec.routing = "AUTO_APPROVED"
            rec.confidence_score = max(rec.confidence_score, 98.0)
        elif req.action == "REJECT":
            rec.status_flag = "FAILED_CRITICAL"
            rec.routing = "REJECTED_CRITICAL"

        if req.corrected_fields:
            cf = req.corrected_fields
            if "khasra_no" in cf and cf["khasra_no"]:
                rec.khasra_no = cf["khasra_no"]
            if "khata_no" in cf and cf["khata_no"]:
                rec.khata_no = cf["khata_no"]
            if "ulpin" in cf and cf["ulpin"]:
                rec.ulpin = cf["ulpin"]
            if "owner_names" in cf and cf["owner_names"]:
                names = cf["owner_names"]
                rec.owner_names = [s.strip() for s in names.split(",")] if isinstance(names, str) else names
            if "owner_shares" in cf and cf["owner_shares"]:
                shares = cf["owner_shares"]
                rec.owner_shares = [s.strip() for s in shares.split(",")] if isinstance(shares, str) else shares
            if "plot_area" in cf and cf["plot_area"]:
                try:
                    rec.plot_area = float(cf["plot_area"])
                except:
                    pass
            if "registration_number" in cf and cf["registration_number"]:
                rec.registration_number = cf["registration_number"]
            if "seller_name" in cf and cf["seller_name"]:
                rec.seller_name = cf["seller_name"]
            if "buyer_name" in cf and cf["buyer_name"]:
                rec.buyer_name = cf["buyer_name"]
            if "sale_value_inr" in cf and cf["sale_value_inr"]:
                try:
                    rec.sale_value_inr = float(cf["sale_value_inr"])
                except:
                    pass
            if "mutation_serial_number" in cf and cf["mutation_serial_number"]:
                rec.mutation_serial_number = cf["mutation_serial_number"]
            if "transferor_prior_owner" in cf and cf["transferor_prior_owner"]:
                rec.transferor_prior_owner = cf["transferor_prior_owner"]
            if "transferee_new_owner" in cf and cf["transferee_new_owner"]:
                rec.transferee_new_owner = cf["transferee_new_owner"]
            if "map_sheet_number" in cf and cf["map_sheet_number"]:
                rec.map_sheet_number = cf["map_sheet_number"]
            if "projection_system" in cf and cf["projection_system"]:
                rec.projection_system = cf["projection_system"]

            # Sync raw_payload dictionary
            payload = rec.raw_payload or {}
            if isinstance(payload, dict):
                payload.update(cf)
                rec.raw_payload = payload

        rec.updated_at = datetime.datetime.utcnow()
        db.commit()

    # Create payload for SHA-256 block hash
    payload = {
        "record_id": req.record_id,
        "action": f"HUMAN_REVIEW_{req.action}",
        "field_changed": "status_flag & digital_signature",
        "new_value": f"Status updated to {req.action} by {req.officer_name}",
        "actor_name": req.officer_name
    }
    
    current_hash = AuditChainService.calculate_block_hash(prev_hash, payload)
    signature = AuditChainService.generate_digital_signature(req.officer_role, current_hash)

    # Persist audit block in DB
    audit_entry = DBAuditTrail(
        record_id=req.record_id,
        action=f"HUMAN_REVIEW_{req.action}",
        field_changed="status_flag & officer_signature",
        old_value=rec.status_flag if rec else "REQUIRES_REVIEW",
        new_value=f"Approved & Signed by {req.officer_name}",
        previous_hash=prev_hash,
        current_hash=current_hash,
        actor_name=req.officer_name,
        actor_role=req.officer_role,
        digital_signature=signature
    )
    db.add(audit_entry)
    db.commit()

    return {
        "status": "VERIFIED_AND_SIGNED",
        "record_id": req.record_id,
        "previous_hash": prev_hash,
        "current_hash": current_hash,
        "digital_signature": signature,
        "verified_by": f"{req.officer_name} ({req.officer_role.upper()})"
    }

@router.get("/audit-trail/all")
def get_audit_trail(db: Session = Depends(get_db)):
    """Fetches full immutable ledger audit chain from database."""
    blocks = db.query(DBAuditTrail).order_by(DBAuditTrail.history_id.asc()).all()
    return {
        "count": len(blocks),
        "blocks": blocks
    }

@router.get("/{record_id}/verify-chain")
def verify_hash_chain(record_id: str, db: Session = Depends(get_db)):
    """Verifies full SHA-256 audit chain integrity from database."""
    blocks = db.query(DBAuditTrail).filter(DBAuditTrail.record_id == record_id).all()
    block_dicts = [
        {
            "record_id": b.record_id,
            "action": b.action,
            "field_changed": b.field_changed,
            "new_value": b.new_value,
            "actor_name": b.actor_name,
            "previous_hash": b.previous_hash,
            "current_hash": b.current_hash
        }
        for b in blocks
    ]
    return AuditChainService.verify_chain_integrity(block_dicts)

@router.delete("/{record_id}")
def delete_record_by_id(record_id: str, db: Session = Depends(get_db)):
    """Deletes a single land record from SQLite database by ID."""
    rec = db.query(DBLandRecord).filter(DBLandRecord.id == record_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Record not found")
    
    db.delete(rec)
    db.commit()
    return {"status": "DELETED", "record_id": record_id}

@router.post("/purge-duplicates")
def purge_all_duplicate_records(db: Session = Depends(get_db)):
    """
    Scans SQLite DB for duplicate land records sharing the same ULPIN or Khasra+Khata+Village.
    Retains 1 primary master record for each plot and deletes all redundant duplicates.
    """
    all_records = db.query(DBLandRecord).order_by(DBLandRecord.created_at.asc()).all()
    seen_keys = set()
    deleted_ids = []

    for rec in all_records:
        key = rec.ulpin or f"{rec.khasra_no}_{rec.khata_no}_{rec.village}"
        if key in seen_keys:
            deleted_ids.append(rec.id)
            db.delete(rec)
        else:
            seen_keys.add(key)

    db.commit()
    return {
        "status": "DEDUPLICATED",
        "purged_count": len(deleted_ids),
        "purged_record_ids": deleted_ids
    }

@router.post("/reset-registry")
def reset_registry(db: Session = Depends(get_db)):
    """Resets SQLite database to clean master state with 8 sample land records."""
    from backend.seed_db import seed_database
    seed_database()
    records = db.query(DBLandRecord).order_by(DBLandRecord.created_at.desc()).all()
    return {
        "status": "RESET_SUCCESS",
        "count": len(records),
        "records": records
    }

