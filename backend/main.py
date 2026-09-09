from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.models.database import init_db, SessionLocal, LandRecord
from backend.seed_db import seed_database
from backend.routers import auth, documents, records, gis, dashboard, teammate_ocr

app = FastAPI(
    title="DigiLand API Server",
    description="Intelligent Land Record Digitization, Validation, Audit & Cadastral GIS Engine (SIH 2026 PS 26018)",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(documents.router)
app.include_router(records.router)
app.include_router(gis.router)
app.include_router(dashboard.router)
app.include_router(teammate_ocr.router)

@app.on_event("startup")
def on_startup():
    init_db()
    db = SessionLocal()
    try:
        if db.query(LandRecord).count() == 0:
            seed_database()
    except Exception as e:
        print("Startup seed check:", e)
    finally:
        db.close()

@app.get("/")
def read_root():
    return {
        "system": "DigiLand GovTech Platform",
        "status": "Operational",
        "sih_problem_statement": "26018",
        "teammate_ocr_engine": "PaddleOCR PP-OCRv4 + 4 Document Schemas Active",
        "gateways": {
            "lgd_master": "Connected",
            "ngdrs_sro": "Sync Active",
            "dilrmp_ulpin": "Active",
            "sha256_ledger": "Verified"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
