import datetime
from sqlalchemy import create_engine, Column, String, Integer, Float, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = "sqlite:///./digiland.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False) # clerk, patwari, tehsildar, admin, citizen
    district = Column(String, nullable=True)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Document(Base):
    __tablename__ = "documents"
    id = Column(String, primary_key=True)
    uploader_id = Column(String, ForeignKey("users.id"), nullable=True)
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=True)
    doc_type = Column(String, default="RECORD_OF_RIGHTS")
    sha256_hash = Column(String, nullable=False)
    p_hash = Column(String, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)

class LandRecord(Base):
    __tablename__ = "land_records"
    id = Column(String, primary_key=True)
    document_id = Column(String, ForeignKey("documents.id"), nullable=True)
    doc_type = Column(String, default="RECORD_OF_RIGHTS")
    khasra_no = Column(String, nullable=True)
    khata_no = Column(String, nullable=True)
    ulpin = Column(String, nullable=True)
    village = Column(String, nullable=True)
    tehsil = Column(String, nullable=True)
    district = Column(String, nullable=True)
    state = Column(String, default="Uttar Pradesh")
    land_classification = Column(String, nullable=True)
    plot_area = Column(Float, nullable=True)
    plot_area_unit = Column(String, default="sqm")
    plot_area_legacy = Column(String, nullable=True)
    owner_names = Column(JSON, nullable=True) # list of strings
    owner_shares = Column(JSON, nullable=True) # list of floats/strings
    mutation_details = Column(Text, nullable=True)
    
    # Deed specific
    registration_number = Column(String, nullable=True)
    seller_name = Column(String, nullable=True)
    buyer_name = Column(String, nullable=True)
    sale_value_inr = Column(Float, nullable=True)
    
    # Mutation specific
    mutation_serial_number = Column(String, nullable=True)
    transferor_prior_owner = Column(String, nullable=True)
    transferee_new_owner = Column(String, nullable=True)
    
    # Cadastral specific
    map_sheet_number = Column(String, nullable=True)
    projection_system = Column(String, nullable=True)
    
    confidence_score = Column(Float, nullable=False, default=95.0)
    status_flag = Column(String, nullable=False, default="VALID") # VALID, FLAGGED_WARNING, FAILED_CRITICAL
    routing = Column(String, nullable=False, default="AUTO_APPROVED") # AUTO_APPROVED, REQUIRES_REVIEW, REJECTED_CRITICAL
    warning_reason = Column(Text, nullable=True)
    
    bounding_boxes = Column(JSON, nullable=True)
    field_confidence = Column(JSON, nullable=True)
    scanned_image_url = Column(Text, nullable=True)
    raw_payload = Column(JSON, nullable=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class ExtractedToken(Base):
    __tablename__ = "extracted_tokens"
    id = Column(Integer, primary_key=True, autoincrement=True)
    document_id = Column(String, ForeignKey("documents.id"))
    token_text = Column(String, nullable=False)
    field_name = Column(String, nullable=False)
    bbox_x = Column(Integer, nullable=False)
    bbox_y = Column(Integer, nullable=False)
    bbox_w = Column(Integer, nullable=False)
    bbox_h = Column(Integer, nullable=False)
    engine_confidence = Column(Float, nullable=False)

class CadastralParcel(Base):
    __tablename__ = "cadastral_parcels"
    id = Column(String, primary_key=True) # Record ID
    khasra_no = Column(String, nullable=False)
    ulpin = Column(String, nullable=False)
    village = Column(String, nullable=False)
    geojson_geom = Column(JSON, nullable=False)
    recorded_area_sqm = Column(Float, nullable=False)
    gis_computed_area_sqm = Column(Float, nullable=False)
    status = Column(String, nullable=False)

class AuditTrail(Base):
    __tablename__ = "audit_trails"
    history_id = Column(Integer, primary_key=True, autoincrement=True)
    record_id = Column(String, ForeignKey("land_records.id"))
    action = Column(String, nullable=False)
    field_changed = Column(String, nullable=False)
    old_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=False)
    previous_hash = Column(String, nullable=False)
    current_hash = Column(String, nullable=False)
    actor_name = Column(String, nullable=False)
    actor_role = Column(String, nullable=False)
    digital_signature = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

def init_db():
    Base.metadata.create_all(bind=engine)
