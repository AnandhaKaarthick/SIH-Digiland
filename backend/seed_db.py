import os
import json
from sqlalchemy.orm import Session
from backend.models.database import engine, SessionLocal, Base, LandRecord, User, AuditTrail, CadastralParcel

CLEAN_8_RECORDS = [
  # 1. RECORD OF RIGHTS (RoR Sample 1)
  {
    "id": "DL-ROR-001",
    "doc_type": "RECORD_OF_RIGHTS",
    "document_id": "DOC-ROR-489",
    "khata_no": "489",
    "khasra_no": "142/3B",
    "ulpin": "14BW89201L9842",
    "village": "Nemili",
    "tehsil": "Sriperumbudur",
    "district": "Kanchipuram",
    "state": "Tamil Nadu",
    "plot_area": 1821.08,
    "plot_area_legacy": "0.45 Acre (1821.08 sqm)",
    "land_classification": "Agricultural (Wet / Nanja)",
    "owner_names": ["K. Raman"],
    "owner_shares": [1.0],
    "confidence_score": 95.0,
    "status_flag": "VALID",
    "routing": "AUTO_APPROVED",
    "raw_payload": {
      "khata_number": "489",
      "parcels": [
        {
          "khasra_survey_number": "142/3B",
          "base_survey_no": "142",
          "sub_division": "3B",
          "bhu_aadhaar_ulpin": "14BW89201L9842",
          "plot_area": { "raw_recorded": "0.45 Acre", "metric_sqm": 1821.08, "metric_hectares": 0.1821 },
          "land_classification": "Agricultural",
          "soil_type": "Wet / Nanja",
          "irrigation_source": "Government Canal"
        }
      ],
      "ownership_details": [
        { "owner_name": "K. Raman", "relationship_type": "Son of", "relative_name": "M. Murugan", "share_fraction": 1.0, "is_primary_owner": True }
      ],
      "revenue_taxation": { "annual_assessment_inr": 85.50, "cess_amount_inr": 12.00, "tax_status": "PAID" },
      "remarks_kaifiyat": "Bank loan lien active under SBI branch ref 2022/441"
    }
  },

  # 1. RECORD OF RIGHTS (RoR Sample 2)
  {
    "id": "DL-ROR-002",
    "doc_type": "RECORD_OF_RIGHTS",
    "document_id": "DOC-ROR-00229",
    "khata_no": "00229",
    "khasra_no": "117/2",
    "ulpin": "75QA02657Q4428",
    "village": "Kondhali",
    "tehsil": "Fatehpur",
    "district": "Kanchipuram",
    "state": "Tamil Nadu",
    "plot_area": 19091.0,
    "plot_area_legacy": "4.72 Acre (1.9091 Hectare)",
    "land_classification": "Agricultural (Irrigated)",
    "owner_names": ["Kavita Naidu", "Arumugam Kumar"],
    "owner_shares": [0.5, 0.5],
    "confidence_score": 83.0,
    "status_flag": "FLAGGED_WARNING",
    "routing": "REQUIRES_REVIEW",
    "raw_payload": {
      "khata_number": "00229",
      "parcels": [
        {
          "khasra_survey_number": "117/2",
          "base_survey_no": "117",
          "sub_division": "2",
          "bhu_aadhaar_ulpin": "75QA02657Q4428",
          "plot_area": { "raw_recorded": "4.72 Acre", "metric_sqm": 19091.0, "metric_hectares": 1.9091 },
          "land_classification": "Agricultural (Irrigated)",
          "soil_type": "Black Cotton Soil",
          "irrigation_source": "Tube Well & River Lift"
        }
      ],
      "ownership_details": [
        { "owner_name": "Kavita Naidu", "relationship_type": "Daughter of", "relative_name": "Raman Naidu", "share_fraction": 0.5, "is_primary_owner": True },
        { "owner_name": "Arumugam Kumar", "relationship_type": "Son of", "relative_name": "Raman Naidu", "share_fraction": 0.5, "is_primary_owner": False }
      ],
      "revenue_taxation": { "annual_assessment_inr": 164.92, "cess_amount_inr": 25.00, "tax_status": "PAID" },
      "remarks_kaifiyat": "Joint khata record. Encumbrance clearance pending."
    }
  },

  # 2. CONVEYANCE DEED (Deed Sample 1)
  {
    "id": "DL-DEED-001",
    "doc_type": "CONVEYANCE_DEED",
    "document_id": "DOC-DEED-984",
    "registration_number": "984/2021",
    "khasra_no": "142/3B",
    "khata_no": "489",
    "ulpin": "14BW89201L9842",
    "village": "Nemili",
    "tehsil": "Sriperumbudur",
    "district": "Kanchipuram",
    "state": "Tamil Nadu",
    "seller_name": "M. Murugan",
    "buyer_name": "K. Raman",
    "sale_value_inr": 1500000.0,
    "plot_area": 1821.08,
    "owner_names": ["K. Raman"],
    "owner_shares": [1.0],
    "confidence_score": 98.0,
    "status_flag": "VALID",
    "routing": "AUTO_APPROVED",
    "raw_payload": {
      "registration_details": {
        "deed_type": "SALE_DEED",
        "registration_number": "984/2021",
        "book_volume": "1",
        "page_range": "105-112",
        "sro_office": "Sriperumbudur SRO",
        "execution_date": "2021-04-12",
        "registration_date": "2021-04-14"
      },
      "parties": {
        "executants_sellers": [
          { "name": "M. Murugan", "relationship_type": "Son of", "relative_name": "K. Munusamy", "address": "No 12, Car Street, Nemili", "identifier_ref": "[Redacted]" }
        ],
        "claimants_buyers": [
          { "name": "K. Raman", "relationship_type": "Son of", "relative_name": "M. Murugan", "address": "No 14, East Mada Street, Nemili", "identifier_ref": "[Redacted]" }
        ]
      },
      "financial_consideration": {
        "sale_value_inr": 1500000.0,
        "guideline_value_inr": 1420000.0,
        "stamp_duty_paid_inr": 105000.0,
        "registration_fee_inr": 60000.0
      },
      "property_schedule": {
        "survey_number": "142/3B",
        "transacted_area_sqm": 1821.08,
        "four_boundaries_chauhaddi": {
          "north": "Survey No 141 (Public Canal)",
          "south": "Village Panchayat Road",
          "east": "Survey No 142/3A (P. Sundaram Land)",
          "west": "Survey No 143 (Village Commons)"
        }
      },
      "prior_title_recitals": "Vendor acquired rights via registered Settlement Deed No. 312/1998."
    }
  },

  # 2. CONVEYANCE DEED (Deed Sample 2)
  {
    "id": "DL-DEED-002",
    "doc_type": "CONVEYANCE_DEED",
    "document_id": "DOC-DEED-204",
    "registration_number": "204 of 2018",
    "khasra_no": "117/2",
    "khata_no": "00229",
    "ulpin": "75QA02657Q4428",
    "village": "Kondhali",
    "tehsil": "Fatehpur",
    "district": "Kanchipuram",
    "state": "Tamil Nadu",
    "seller_name": "Kavita Naidu",
    "buyer_name": "Arumugam Kumar",
    "sale_value_inr": 6860408.0,
    "plot_area": 19091.0,
    "owner_names": ["Arumugam Kumar"],
    "owner_shares": [1.0],
    "confidence_score": 96.0,
    "status_flag": "VALID",
    "routing": "AUTO_APPROVED",
    "raw_payload": {
      "registration_details": {
        "deed_type": "SALE_DEED",
        "registration_number": "204 of 2018",
        "book_volume": "4",
        "page_range": "45-52",
        "sro_office": "Sub-Registrar Office, Fatehpur",
        "execution_date": "2018-11-18",
        "registration_date": "2018-11-20"
      },
      "parties": {
        "executants_sellers": [
          { "name": "Kavita Naidu", "relationship_type": "Daughter of", "relative_name": "Raman Naidu", "address": "Village Kondhali, Fatehpur", "identifier_ref": "PAN-XXXX-8812" }
        ],
        "claimants_buyers": [
          { "name": "Arumugam Kumar", "relationship_type": "Son of", "relative_name": "Raman Naidu", "address": "Village Kondhali, Fatehpur", "identifier_ref": "PAN-XXXX-9914" }
        ]
      },
      "financial_consideration": {
        "sale_value_inr": 6860408.0,
        "guideline_value_inr": 6500000.0,
        "stamp_duty_paid_inr": 480200.0,
        "registration_fee_inr": 137200.0
      },
      "property_schedule": {
        "survey_number": "117/2",
        "transacted_area_sqm": 19091.0,
        "four_boundaries_chauhaddi": {
          "north": "Survey No. 146 (Canal)",
          "south": "Village Panchayat Road",
          "east": "Survey No. 117/4A",
          "west": "Survey No. 190 (Village Commons)"
        }
      },
      "prior_title_recitals": "Transfer of undivided share via family partition agreement executed on 2015-06-10."
    }
  },

  # 3. MUTATION REGISTER (Mutation Sample 1)
  {
    "id": "DL-MUT-001",
    "doc_type": "MUTATION_REGISTER",
    "document_id": "DOC-MUT-0012",
    "mutation_serial_number": "MUT-2024-0012",
    "khasra_no": "142/3B",
    "khata_no": "489",
    "ulpin": "14BW89201L9842",
    "village": "Nemili",
    "tehsil": "Sriperumbudur",
    "district": "Kanchipuram",
    "state": "Tamil Nadu",
    "transferor_prior_owner": "M. Murugan",
    "transferee_new_owner": "K. Raman",
    "plot_area": 1821.08,
    "owner_names": ["K. Raman"],
    "owner_shares": [1.0],
    "confidence_score": 97.0,
    "status_flag": "VALID",
    "routing": "AUTO_APPROVED",
    "raw_payload": {
      "mutation_serial_number": "MUT-2024-0012",
      "case_reference_no": "REV/TEH/2024/782",
      "nature_of_mutation": "SUCCESSION_INHERITANCE",
      "applied_date": "2024-01-10",
      "sanctioned_date": "2024-02-18",
      "survey_numbers_affected": ["142/3B"],
      "transferor_prior_owner": { "name": "M. Murugan", "prior_khata_no": "310" },
      "transferee_new_owner": { "name": "K. Raman", "new_khata_no": "489", "share_acquired": 1.0 },
      "sanctioning_authority": { "officer_designation": "Tehsildar", "subdivision": "Sriperumbudur", "digital_signature_verified": True }
    }
  },

  # 3. MUTATION REGISTER (Mutation Sample 2)
  {
    "id": "DL-MUT-002",
    "doc_type": "MUTATION_REGISTER",
    "document_id": "DOC-MUT-2584",
    "mutation_serial_number": "MUT-2018-2584",
    "khasra_no": "117/2",
    "khata_no": "00229",
    "ulpin": "75QA02657Q4428",
    "village": "Kondhali",
    "tehsil": "Fatehpur",
    "district": "Kanchipuram",
    "state": "Tamil Nadu",
    "transferor_prior_owner": "Kavita Naidu",
    "transferee_new_owner": "Arumugam Kumar",
    "plot_area": 19091.0,
    "owner_names": ["Arumugam Kumar"],
    "owner_shares": [0.5],
    "confidence_score": 92.0,
    "status_flag": "VALID",
    "routing": "AUTO_APPROVED",
    "raw_payload": {
      "mutation_serial_number": "MUT-2018-2584",
      "case_reference_no": "REV/FAT/2018/2584",
      "nature_of_mutation": "TRANSFER_BY_SALE",
      "applied_date": "2018-01-22",
      "sanctioned_date": "2018-05-03",
      "survey_numbers_affected": ["117/2"],
      "transferor_prior_owner": { "name": "Kavita Naidu", "prior_khata_no": "00888" },
      "transferee_new_owner": { "name": "Arumugam Kumar", "new_khata_no": "00229", "share_acquired": 0.5 },
      "sanctioning_authority": { "officer_designation": "Tehsildar", "subdivision": "Fatehpur", "digital_signature_verified": True }
    }
  },

  # 4. CADASTRAL MAP (Cadastral Map Sample 1)
  {
    "id": "DL-MAP-001",
    "doc_type": "CADASTRAL_MAP",
    "document_id": "DOC-MAP-S04",
    "map_sheet_number": "Sheet-04",
    "projection_system": "EPSG:4326",
    "khasra_no": "142/3B",
    "khata_no": "489",
    "ulpin": "14BW89201L9842",
    "village": "Nemili",
    "tehsil": "Sriperumbudur",
    "district": "Kanchipuram",
    "state": "Tamil Nadu",
    "plot_area": 1821.50,
    "owner_names": ["K. Raman"],
    "owner_shares": [1.0],
    "confidence_score": 99.0,
    "status_flag": "VALID",
    "routing": "AUTO_APPROVED",
    "raw_payload": {
      "map_sheet_number": "Sheet-04",
      "projection_system": "EPSG:4326",
      "extracted_features": [
        {
          "khasra_survey_number": "142/3B",
          "geometry_type": "Polygon",
          "coordinates": [
            [
              [79.94125, 12.98142],
              [79.94189, 12.98145],
              [79.94185, 12.98082],
              [79.94121, 12.98080],
              [79.94125, 12.98142]
            ]
          ],
          "calculated_gis_area_sqm": 1821.50,
          "centroid": { "latitude": 12.98112, "longitude": 79.94155 }
        }
      ],
      "tie_line_measurements": [
        { "from_marker": "G1", "to_marker": "G2", "field_distance_meters": 45.2 }
      ]
    }
  },

  # 4. CADASTRAL MAP (Cadastral Map Sample 2)
  {
    "id": "DL-MAP-002",
    "doc_type": "CADASTRAL_MAP",
    "document_id": "DOC-MAP-S08",
    "map_sheet_number": "Sheet-08",
    "projection_system": "EPSG:4326",
    "khasra_no": "185/5",
    "khata_no": "00215",
    "ulpin": "96QE71396Q2370",
    "village": "Baideswar",
    "tehsil": "Danapur",
    "district": "Cuttack",
    "state": "Odisha",
    "plot_area": 20634.0,
    "owner_names": ["Mahesh Singh"],
    "owner_shares": [1.0],
    "confidence_score": 97.0,
    "status_flag": "VALID",
    "routing": "AUTO_APPROVED",
    "raw_payload": {
      "map_sheet_number": "Sheet-08",
      "projection_system": "EPSG:4326",
      "extracted_features": [
        {
          "khasra_survey_number": "185/5",
          "geometry_type": "Polygon",
          "coordinates": [
            [
              [77.11704, 13.28595],
              [77.11750, 13.28620],
              [77.11780, 13.28550],
              [77.11710, 13.28520],
              [77.11704, 13.28595]
            ]
          ],
          "calculated_gis_area_sqm": 20634.0,
          "centroid": { "latitude": 13.28595, "longitude": 77.11704 }
        }
      ],
      "tie_line_measurements": [
        { "from_marker": "M1", "to_marker": "M2", "field_distance_meters": 112.5 }
      ]
    }
  }
]

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Clear existing records to ensure clean dataset
        db.query(LandRecord).delete()
        db.commit()

        for r_data in CLEAN_8_RECORDS:
            rec = LandRecord(
                id=r_data["id"],
                doc_type=r_data["doc_type"],
                document_id=r_data["document_id"],
                khasra_no=r_data.get("khasra_no"),
                khata_no=r_data.get("khata_no"),
                ulpin=r_data.get("ulpin"),
                village=r_data.get("village"),
                tehsil=r_data.get("tehsil"),
                district=r_data.get("district"),
                state=r_data.get("state"),
                land_classification=r_data.get("land_classification"),
                plot_area=r_data.get("plot_area"),
                plot_area_legacy=r_data.get("plot_area_legacy"),
                owner_names=r_data.get("owner_names"),
                owner_shares=r_data.get("owner_shares"),
                registration_number=r_data.get("registration_number"),
                seller_name=r_data.get("seller_name"),
                buyer_name=r_data.get("buyer_name"),
                sale_value_inr=r_data.get("sale_value_inr"),
                mutation_serial_number=r_data.get("mutation_serial_number"),
                transferor_prior_owner=r_data.get("transferor_prior_owner"),
                transferee_new_owner=r_data.get("transferee_new_owner"),
                map_sheet_number=r_data.get("map_sheet_number"),
                projection_system=r_data.get("projection_system"),
                confidence_score=r_data.get("confidence_score", 95.0),
                status_flag=r_data.get("status_flag", "VALID"),
                routing=r_data.get("routing", "AUTO_APPROVED"),
                raw_payload=r_data.get("raw_payload")
            )
            db.add(rec)
        db.commit()
        print(f"Successfully seeded SQLite digiland.db with {len(CLEAN_8_RECORDS)} clean 4-schema records.")
    except Exception as e:
        print("Error seeding database:", e)
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
