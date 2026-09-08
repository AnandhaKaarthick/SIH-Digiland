from backend.models.database import SessionLocal, LandRecord as DBLandRecord, init_db
from backend.services.audit_chain import AuditChainService
from backend.models.database import AuditTrail as DBAuditTrail

SEED_RECORDS = [
  {
    "id": "DL-0001",
    "doc_type": "RECORD_OF_RIGHTS",
    "khasra_no": "117/2",
    "khata_no": "00229",
    "ulpin": "75QA02657Q4428",
    "village": "Kondhali",
    "tehsil": "Fatehpur",
    "district": "Kanchipuram",
    "state": "Tamil Nadu",
    "owner_names": ["Kavita Naidu", "Arumugam Kumar"],
    "owner_shares": [0.5, 0.5],
    "plot_area": 19091.0,
    "confidence_score": 83.0,
    "status_flag": "FLAGGED_WARNING",
    "routing": "REQUIRES_REVIEW",
    "registration_number": "204 of 2018",
    "seller_name": "Kavita Naidu",
    "buyer_name": "Arumugam Kumar",
    "sale_value_inr": 6860408.0,
    "mutation_serial_number": "MUT-2018-2584"
  },
  {
    "id": "DL-0002",
    "doc_type": "RECORD_OF_RIGHTS",
    "khasra_no": "185/5",
    "khata_no": "00215",
    "ulpin": "96QE71396Q2370",
    "village": "Baideswar",
    "tehsil": "Danapur",
    "district": "Cuttack",
    "state": "Odisha",
    "owner_names": ["Sunita Reddy", "Mahesh Singh"],
    "owner_shares": [0.5, 0.5],
    "plot_area": 20634.0,
    "confidence_score": 98.0,
    "status_flag": "VALID",
    "routing": "AUTO_APPROVED",
    "registration_number": "771 of 2021",
    "seller_name": "Sunita Reddy",
    "buyer_name": "Mahesh Singh",
    "sale_value_inr": 7550805.0,
    "mutation_serial_number": "MUT-2021-8517"
  },
  {
    "id": "DL-0003",
    "doc_type": "RECORD_OF_RIGHTS",
    "khasra_no": "137/7A",
    "khata_no": "00115",
    "ulpin": "49XG51982Q6175",
    "village": "Baideswar",
    "tehsil": "Sriperumbudur",
    "district": "Barabanki",
    "state": "Uttar Pradesh",
    "owner_names": ["Ramesh Nair", "Vinod Sharma"],
    "owner_shares": [0.5, 0.5],
    "plot_area": 19576.0,
    "confidence_score": 95.0,
    "status_flag": "VALID",
    "routing": "AUTO_APPROVED",
    "registration_number": "471 of 2024",
    "seller_name": "Ramesh Nair",
    "buyer_name": "Vinod Sharma",
    "sale_value_inr": 10539440.0,
    "mutation_serial_number": "MUT-2024-6038"
  },
  {
    "id": "DL-0004",
    "doc_type": "RECORD_OF_RIGHTS",
    "khasra_no": "143/1",
    "khata_no": "00066",
    "ulpin": "55AS00035N6219",
    "village": "Kondhali",
    "tehsil": "Sriperumbudur",
    "district": "Hooghly",
    "state": "West Bengal",
    "owner_names": ["Meena Verma", "Raman Lal"],
    "owner_shares": [0.5, 0.5],
    "plot_area": 14491.0,
    "confidence_score": 99.0,
    "status_flag": "VALID",
    "routing": "AUTO_APPROVED",
    "registration_number": "541 of 2020",
    "seller_name": "Meena Verma",
    "buyer_name": "Raman Lal",
    "sale_value_inr": 5472695.0,
    "mutation_serial_number": "MUT-2020-7735"
  },
  {
    "id": "DL-0005",
    "doc_type": "RECORD_OF_RIGHTS",
    "khasra_no": "162/8A",
    "khata_no": "00417",
    "ulpin": "89DA39726Q6412",
    "village": "Rampur",
    "tehsil": "Sriperumbudur",
    "district": "Barabanki",
    "state": "Uttar Pradesh",
    "owner_names": ["Suresh Rao", "Vinod Chand"],
    "owner_shares": [0.5, 0.5],
    "plot_area": 1933.0,
    "confidence_score": 83.0,
    "status_flag": "FLAGGED_WARNING",
    "routing": "REQUIRES_REVIEW",
    "registration_number": "588 of 2022",
    "seller_name": "Suresh Rao",
    "buyer_name": "Vinod Chand",
    "sale_value_inr": 1132001.0,
    "mutation_serial_number": "MUT-2022-9701"
  }
]

def seed_database():
    init_db()
    db = SessionLocal()
    try:
        count = db.query(DBLandRecord).count()
        if count == 0:
            prev_hash = "0000000000000000000000000000000000000000000000000000000000000000"
            for item in SEED_RECORDS:
                rec = DBLandRecord(**item)
                db.add(rec)
                
                # Create audit hash block
                payload = {"record_id": rec.id, "action": "INITIAL_SEED_INGESTION", "new_value": f"Khasra {rec.khasra_no}"}
                current_hash = AuditChainService.calculate_block_hash(prev_hash, payload)
                sig = AuditChainService.generate_digital_signature("system", current_hash)
                
                audit = DBAuditTrail(
                    record_id=rec.id,
                    action="INITIAL_SEED_INGESTION",
                    field_changed="Initial Intake",
                    new_value=f"Land Record {rec.id} ingested",
                    previous_hash=prev_hash,
                    current_hash=current_hash,
                    actor_name="System Ingestion Gateway",
                    actor_role="system",
                    digital_signature=sig
                )
                db.add(audit)
                prev_hash = current_hash
            db.commit()
            print(f"Successfully seeded {len(SEED_RECORDS)} land records into SQLite database.")
        else:
            print(f"Database already contains {count} records.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
