# DigiLand — Intelligent Land Record Digitization & Validation System

**SIH 2026 | Problem Statement 26018 | Software – Smart Automation**

---

## 1. Overview

DigiLand is an AI-powered platform that digitizes legacy land records (handwritten registers, scanned Jamabandis, 7/12 extracts, Khataunis, cadastral maps) into structured, validated, government-integration-ready data. It combines Computer Vision, OCR, NLP, a deterministic validation engine, confidence scoring, human-in-the-loop review, and cryptographic audit trails.

**Core promise to judges:** not just extraction — a governance-grade validation, verification, and audit layer that a real revenue department could trust.

| | |
|---|---|
| Product name | DigiLand |
| Category | Software – Smart Automation |
| Primary users | Data-entry clerks, Patwari, Tehsildar/Admin, Citizens (read-only) |
| Core differentiators | Validation/reconciliation engine, HITL verification, confidence scoring, cryptographic audit trail, RBAC |

---

## 2. Problem Statement Summary

**Background:** Land records across India exist largely as handwritten registers, scanned documents, maps, cadastral records, and legacy PDFs. Digitizing them accurately is critical for taxation, dispute resolution, and infrastructure planning.

**Required capabilities:**
- Multilingual OCR (printed + handwritten, major Indian languages)
- Structured extraction: landowner details, survey number, khasra number, khata number, plot area, village, tehsil, district, land classification, ownership details, mutation records, registration information
- Automated validation (business rules, cross-database, duplicate detection)
- Confidence scoring with automatic flagging of uncertain fields
- Human-assisted verification workflow
- AI-driven learning mechanism (active learning / feedback loop)
- Integration with LRMS, DILRMP, GIS platforms, cadastral maps
- Secure repository with metadata + audit trails
- Interactive dashboards (documents processed, accuracy, validation status, pending cases, error stats, district-wise progress)
- APIs for government integration
- Role-based access control

**Reviewer-added inputs (must explicitly address):**
- Integration of **cryptography** for secure processing
- **Backtracking** — tracing a digitized value back to its source document/location

---

## 3. Product Identity: UI/UX

### 3.1 Design language
Deep green (land, trust, verified data) + ochre (earth/secondary accent) + blue (government/trust touchpoints). Status colors map directly onto the confidence-score tiers used by the validation engine, so the same palette that brands the app also communicates system state.

### 3.2 Color palette

| Role | Light mode | Dark mode |
|---|---|---|
| Background | `#F7F5F0` | `#12181A` |
| Surface / card | `#FFFFFF` | `#1B2224` |
| Primary brand | `#1B5E3A` | `#5FBE8A` |
| Secondary accent | `#C17817` | `#E0A94D` |
| Text primary | `#1F2A24` | `#EDEFEC` |
| Text secondary | `#5B6B62` | `#A9B3AC` |
| Border | `#E0DED5` | `#2D3A34` |
| Success (VALID) | `#2E7D32` | `#6FCF97` |
| Warning (FLAGGED) | `#ED8936` | `#F0B860` |
| Error (FAILED_CRITICAL) | `#C0392B` | `#E57373` |
| Info / link | `#1B6FA8` | `#6FB1E0` |

### 3.3 Typography

| Use | Font | Notes |
|---|---|---|
| Headings, nav, buttons | **Poppins** (Medium/SemiBold) | Geometric, confident, "official but modern" |
| Body, tables, forms | **Inter** | High legibility at small sizes for dense record fields |
| Regional-language content | **Noto Sans [Script]** (Devanagari, Tamil, Bengali, etc.) | Designed to pair visually with Inter/Poppins |
| IDs, hashes, ULPIN codes | **JetBrains Mono** / **IBM Plex Mono** | Easy visual comparison of alphanumeric codes |

### 3.4 Structural UI/UX principles

1. **Status-first visual language** — every record card/row carries a colored left-border/badge (green/amber/red) matching its confidence tier, so a clerk can triage a queue without opening each record.
2. **Split-view verification screen** (the flagship demo screen) — left pane: original scanned document with the OCR bounding box highlighted; right pane: extracted fields, editable, with a confidence flag next to each field.
3. **Dashboard as the landing screen** — metric cards (documents processed, accuracy %, pending verification, district-wise progress) using muted tint fills rather than solid colors, to stay calm and scannable.
4. **Role-based navigation shells**, all sharing the same design tokens:
   - **Clerk/Patwari view** — upload + verify queue
   - **Tehsildar/Admin view** — audit trail, override, reports, RBAC management
   - **Citizen view** — read-only record lookup
5. **Dark mode is functional, not cosmetic** — long verification sessions benefit from a low-glare dark surface; the same green/ochre/status hues carry over so meaning stays consistent across modes.

### 3.5 Key screens

| Screen | Purpose | Key elements |
|---|---|---|
| Login | Role-based auth | Email/ID + password, role badge, JWT session |
| Dashboard | Landing / monitoring | Metric cards, district-wise progress map, pending-queue widget |
| Document upload | Ingest documents | Drag-drop, camera capture, batch upload, live processing status |
| Processing status | Live pipeline feedback | Stepper (upload → CV cleanup → OCR → NLP → validation → scoring) |
| Verification (split-view) | HITL correction | Source scan + bounding box ↔ editable structured fields + confidence chips |
| Record detail | Single record view | All extracted fields, validation flags, audit history, map preview |
| Audit trail | Compliance / traceability | Immutable timeline of every change, actor, timestamp, hash |
| GIS map view | Spatial validation | Leaflet map, color-coded parcels (green = validated, red = mismatch) |
| Admin / RBAC | Access control | User-role management, permission matrix |

---

## 4. App Flow (End-to-End)

```
Document upload (citizen/clerk)
        │
        ▼
OCR & layout extraction   — EasyOCR, TrOCR, LayoutLM
        │
        ▼
Field classification      — NLP mapping to land-record fields
        │
        ▼
Validation engine          — business rules, cross-DB, duplicate detection
        │
        ▼
Confidence scoring         — composite score 0–100%
        │
        ▼
Route by confidence
   ┌────────────┼─────────────┐
   ▼            ▼             ▼
Auto-accept   Human        Escalate &
(STP)         verification reject
≥85%          60–84%       <60% or rule fail
   └────────────┼─────────────┘
                ▼
     Audit trail & sync — push to LRMS / DILRMP / GIS
```

**Step-by-step:**

1. **Document upload** — clerk or citizen submits a scan/photo/PDF. File is hashed (SHA-256) and stored in object storage; metadata written to the database.
2. **CV preprocessing** — deskewing, adaptive binarization, denoising, table/gridline detection, ROI segmentation (header / ledger table / margin notes / stamps).
3. **OCR extraction** — multilingual printed + handwritten recognition; every token tagged with its bounding box for later backtracking.
4. **NLP field classification** — raw tokens mapped into structured fields (khasra no., khata no., owner names, plot area, village/tehsil/district, land classification, mutation details).
5. **Validation engine** — deterministic business rules + cross-database checks + duplicate detection (see §6).
6. **Confidence scoring** — composite score combining OCR confidence, rule pass rate, cross-DB match, duplicate risk.
7. **Routing decision:**
   - **≥85%** → straight-through processing (auto-accepted)
   - **60–84%** → routed to human-in-the-loop verification queue
   - **<60%** or critical rule failure → escalated/rejected, flagged for Tehsildar review
8. **Human verification (if routed)** — clerk sees split-screen: source document crop ↔ editable fields; corrects and digitally signs.
9. **Audit trail & sync** — every change appended to an immutable hash-chained log; verified record pushed to LRMS/DILRMP/GIS via secure API.

---

## 5. Technical Architecture

### 5.1 Layered view

| Layer | Responsibility | Key technologies |
|---|---|---|
| Computer Vision | Deskew, binarize, denoise, table/layout segmentation, stamp/signature detection, map vectorization | OpenCV, Pillow, YOLOv8/Detectron2 |
| OCR | Printed + handwritten multilingual text recognition | EasyOCR, TrOCR |
| NLP / classification | Map recognized tokens to structured schema fields | spaCy, IndicNLP, LayoutLM, Hugging Face Transformers |
| Validation engine | Business rules, cross-database checks, duplicate detection | Python rules engine (Pydantic), PostGIS spatial queries |
| Confidence scoring | Composite scoring + routing | Custom weighted-score service |
| Storage | Structured data + spatial data + raw files | PostgreSQL + PostGIS, Object storage (MinIO/S3) |
| Backend / API | Orchestration, auth, integration | FastAPI |
| GIS | Map rendering, spatial validation | GeoServer, Leaflet/OpenLayers |
| Frontend | UI/UX | React.js |
| Security | Encryption, signatures, audit | AES-256-GCM, ECDSA/Ed25519, SHA-256, mTLS, HMAC |

### 5.2 Where Computer Vision specifically applies

- **Preprocessing:** Hough/Radon-based deskewing, Sauvola/Otsu binarization, morphological denoising.
- **Layout analysis:** gridline/table-cell detection (OpenCV kernels or YOLOv8/Detectron2), ROI partitioning (header / ledger table / margin notes / stamps), reading-order reconstruction.
- **Authenticity detection:** seal/stamp localization, signature detection and cropping.
- **Cadastral map vectorization:** contour detection + Douglas-Peucker polygon approximation to convert scanned *Bhu-Naksha*/FMB sketches into GeoJSON/Shapefile for PostGIS ingestion; survey-label association.
- **Backtracking support:** every token/cell gets normalized bounding-box coordinates `[xmin, ymin, xmax, ymax]` on the source scan, enabling the verification UI to generate an interactive zoom crop of the original ink mark next to any flagged field. Perceptual hashing (pHash/dHash) also runs here for duplicate-scan detection.

### 5.3 Database design (consolidated)

A single **PostgreSQL + PostGIS** instance is sufficient — no need for separate databases per pipeline stage.

```
┌────────────────────────────────────────────────────────┐
│           SINGLE POSTGRESQL + POSTGIS DATABASE          │
├───────────────────────┬──────────────────────────────────┤
│ users                 │ Auth, roles (Clerk/Patwari/       │
│                       │ Tehsildar/Admin), password hashes │
│ documents             │ Object-store path, sha256_hash,   │
│                       │ p_hash, uploader, timestamp       │
│ land_records          │ Structured extracted fields, JSON │
│ extracted_tokens      │ Raw OCR tokens + bounding boxes,   │
│                       │ engine confidence scores          │
│ cadastral_parcels     │ PostGIS geometries for spatial     │
│                       │ validation                         │
│ validation_logs       │ Pass/fail flags per rule, per field│
│ audit_trails          │ Immutable, hash-chained change log │
└───────────────────────┴──────────────────────────────────┘
```

### 5.4 Consolidated API surface

Rather than one endpoint per pipeline step, the system exposes a lean set of endpoints; each internally orchestrates multiple stages:

| Endpoint | What it does |
|---|---|
| `POST /api/v1/auth/login` | Authenticates user, issues role-scoped JWT |
| `POST /api/v1/documents/upload` | Multipart upload, SHA-256 hash, object storage write, initial DB record |
| `POST /api/v1/process-document` | Runs CV cleanup → OCR → NLP mapping → validation → confidence scoring → saves structured record, all in one pipeline call |
| `GET /api/v1/pipeline/status/{job_id}` | Polling/WebSocket endpoint for live processing progress |
| `GET /api/v1/records/flagged` | Fetches records needing review, filterable by district/tehsil/error type |
| `GET /api/v1/review/{record_id}` | Returns structured data + bounding-box crops for split-screen verification |
| `POST /api/v1/review/{record_id}/commit` | Submits human corrections, recalculates audit hash, marks VERIFIED |
| `POST /api/v1/lrms/sync` | Pushes the verified record to the state LRMS/DILRMP endpoint (mTLS + HMAC-signed) |

External government APIs consumed (in production): LGD (village/tehsil master codes), NGDRS/SRO (deed verification), LRMS mutation-status. For the hackathon, these are served by a **local mock gateway** behind the same interface (see §7.3).

---

## 6. Validation Engine — Complete Business Rules

### 6.1 Mathematical & area integrity
- **Sub-division area partition balance** — sum of sub-plot areas must equal the parent parcel's area within a small tolerance.
- **Unit standardization** — convert legacy units (Bigha, Biswa, Guntha, Acre, Hectare, Cent) to a common metric base before comparison.
- **Ownership share fraction sum** — all owner shares in a Khata must sum to exactly 1.0 (100%); flag over- or under-allocation.

### 6.2 Syntax, schema, and identifier rules
- Survey/khasra numbers must match state-specific regex patterns.
- ULPIN/Bhu-Aadhaar must be a valid 14-character alphanumeric code.
- Land-classification values must use official categories (e.g., *Chahi, Nehri, Barani, Abadi, Commercial*) rather than free text.

### 6.3 Legal & classification checks
- Flag prohibited transfers (communal/Gram Sabha land, forest reserve, water bodies, ceiling-surplus land shown under individual ownership).

### 6.4 Cross-database verification
- **LGD (Local Government Directory):** state/district/tehsil/village codes match official master data.
- **NGDRS/SRO:** deed number, registration date, buyer/seller names match Sub-Registrar records.
- **GIS/Cadastral (Bhu-Naksha/DILRMP):** textual plot area vs. GIS polygon area; khasra number exists on the village map layer.
- **RCCMS (revenue courts):** check for active stay orders, disputes, or registered mortgages.

### 6.5 Duplicate detection
- **Entity resolution / fuzzy matching** — Levenshtein/Jaro-Winkler/Soundex to catch phonetic name variants.
- **Perceptual + cryptographic hashing** — pHash/dHash + SHA-256 to catch the same physical document scanned twice.
- **Double registration / spatial overlap** — PostGIS `ST_Intersects`/`ST_Overlaps` to detect two records claiming overlapping boundaries.

### 6.6 Validation status flags
| Flag | Meaning |
|---|---|
| `VALID` | Passed all rules |
| `FLAGGED_WARNING` | Minor spelling variation / low-confidence match |
| `FAILED_CRITICAL` | Area mismatch, duplicate survey number, unregistered owner |

### 6.7 Confidence scoring model

Composite score (0–100%), weighted:

| Component | Weight |
|---|---|
| OCR/CV extraction confidence | 30% |
| Business-rule pass rate | 35% |
| Cross-database match | 25% |
| Duplicate-check clearance | 10% |

**Routing:** ≥85% → auto-approve (STP) · 60–84% → human-in-the-loop review · <60% or any `FAILED_CRITICAL` → escalate/reject.

---

## 7. Security & Cryptography

Cryptography is applied at four layers: ingestion, storage, verification, and audit/backtracking.

```
1. Ingestion:   Document hashing (SHA-256 + perceptual pHash)
2. Storage:     Field-level AES-256-GCM encryption + PII redaction
3. Verification: ECDSA / Ed25519 digital signatures by revenue officers
4. Audit:       SHA-256 hash-chained, tamper-evident ledger
```

### 7.1 Document integrity at ingestion
- **SHA-256** hash of the raw file bytes — deterministic fingerprint; any pixel change alters the hash. Stored as a unique constraint to block duplicate uploads.
- **Perceptual hash (pHash/dHash)** — detects the same physical page rescanned under different lighting/compression/resolution.

### 7.2 Tamper-evident audit chain (cryptographic backtracking)
Historical mutations are stored as an append-only hash chain inside PostgreSQL — no external blockchain needed:

```
H_n = SHA-256(H_(n-1) + Payload_n)
```

```sql
CREATE TABLE land_record_history (
  history_id SERIAL PRIMARY KEY,
  record_id UUID REFERENCES land_records(id),
  khasra_no VARCHAR(50),
  owner_name VARCHAR(255),
  plot_area NUMERIC,
  previous_hash VARCHAR(64) NOT NULL,
  current_hash VARCHAR(64) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  verified_by VARCHAR(100)
);
```

If any historical row is altered directly in the database, recomputing the chain immediately reveals the exact row where tampering occurred.

```python
import hashlib, json

def generate_record_hash(prev_hash: str, record_data: dict) -> str:
    serialized = json.dumps(record_data, sort_keys=True)
    block = f"{prev_hash}{serialized}".encode("utf-8")
    return hashlib.sha256(block).hexdigest()

def verify_chain_integrity(records: list) -> bool:
    for i in range(1, len(records)):
        current, previous = records[i], records[i - 1]
        if current["previous_hash"] != previous["current_hash"]:
            return False
        expected_hash = generate_record_hash(current["previous_hash"], current["data"])
        if current["current_hash"] != expected_hash:
            return False
    return True
```

### 7.3 Non-repudiation for revenue officers
When a Patwari/Tehsildar approves a low-confidence record, they sign the verified JSON payload with their private key (**ECDSA/Ed25519**, mirroring India's e-Sign/DSC infrastructure) instead of storing a plain boolean flag. Stored alongside the record: `signed_payload_hash`, `digital_signature`, `officer_public_key_id` — anyone can verify who approved it, and they cannot later deny it.

### 7.4 Data at rest
- **Envelope encryption (AES-256-GCM)** on sensitive owner-identity fields; spatial/geometry fields stay in plaintext to keep PostGIS queries fast. Decryption keys are held in a KMS/secret manager, gated by RBAC.
- **Strict redaction** of national ID numbers (e.g., masked as `XXXX-XXXX-1234`) to meet data-privacy requirements.

### 7.5 Secure gateway communications
- **HMAC-SHA256** payload signing on all outbound government API calls: `Signature = HMAC-SHA256(SecretKey, Payload)` — the receiving server recomputes and rejects on mismatch.
- **mTLS (mutual TLS, TLS 1.3)** — dual-sided certificate handshake so only authenticated nodes can call the API endpoints.
- **Role-based access control (RBAC)** on every internal endpoint (Clerk / Patwari / Tehsildar / Admin scopes).

---

## 8. Government Integration (DILRMP / LRMS / GIS)

### 8.1 Bhu-Aadhaar / ULPIN
- 14-character parcel identifier derived from the cadastral polygon's centroid/bounding box.
- Queried against the central ULPIN registry to prevent unrecorded parcel splits.

### 8.2 Administrative normalization (LGD)
- Every record's `State → District → Tehsil → Village` chain is validated against the Local Government Directory before pushing to DILRMP, eliminating ambiguity from phonetic/colloquial names.

### 8.3 State LRMS & SRO (NGDRS)
- Standardized RESTful JSON payload contract (transaction ID, LGD village code, khasra/khata numbers, owner shares, plot area, source-document hash).
- **Inbound check:** query the LRMS mutation ledger before accepting a record, to rule out pending disputes (*Dakhil-Kharij*).
- **Outbound commit:** push the verified record via mTLS + HMAC to the LRMS intake endpoint.

### 8.4 Adapter pattern (mock vs. real gateway)
To stay demo-ready without live government credentials, the backend uses an abstraction layer toggled by an environment variable:

```python
class LandGovGateway(ABC):
    @abstractmethod
    def verify_deed(self, deed_no: str, year: int) -> dict: ...
    @abstractmethod
    def validate_village_lgd(self, state_code: str, village_code: str) -> bool: ...

class RealGovApiAdapter(LandGovGateway):
    """Connects to API Setu / State LRMS with HMAC-signed requests."""

class MockGovApiAdapter(LandGovGateway):
    """Local PostgreSQL-backed simulation for demo & testing."""

gov_service: LandGovGateway = (
    MockGovApiAdapter() if USE_MOCK_GOV_APIS else RealGovApiAdapter()
)
```

Switching `USE_MOCK_GOV_APIS=False` moves the pipeline from local PostGIS/mock data straight to live API Setu endpoints — a strong point to show judges, along with fault-tolerance (circuit-breaking, exponential backoff, local fallback validation) so processing never halts if a state server drops connection.

### 8.5 Hackathon demo strategy
1. Deploy a local PostGIS instance seeded with sample village GeoJSON.
2. Build mock `/api/dilrmp/verify-ulpin` and `/api/lrms/check-mutation` endpoints with FastAPI.
3. Live demo: upload a scanned Jamabandi/RoR → show extraction of khasra number and area → trigger mock validation → show the Leaflet map highlighting the matched (or mismatched) cadastral polygon.

---

## 9. Dashboard & Monitoring

Interactive dashboard surfaces:
- Number of documents processed
- Extraction accuracy (overall and by field)
- Validation status breakdown (VALID / FLAGGED / FAILED)
- Pending verification queue size
- Error statistics by category
- State-wise and district-wise digitization progress (choropleth map)

---

## 10. Recommended Tech Stack (Summary)

| Component | Technology |
|---|---|
| OCR | EasyOCR, TrOCR |
| Layout/field understanding | LayoutLM |
| NLP | spaCy, IndicNLP Library, Hugging Face Transformers |
| Computer Vision | OpenCV, Pillow, YOLOv8 / Detectron2 |
| Database | PostgreSQL with PostGIS |
| Object storage | MinIO / S3-compatible |
| Backend framework | FastAPI |
| GIS platform | GeoServer, Leaflet / OpenLayers, QGIS |
| Frontend | React.js |
| APIs | RESTful (JSON), GraphQL optional |
| Cryptography | SHA-256, AES-256-GCM, ECDSA/Ed25519, HMAC-SHA256, mTLS (TLS 1.3) |
| Data visualization | Power BI / Apache Superset / Plotly / Grafana |
| Cloud infrastructure | NIC Cloud (MeghRaj) / AWS / Azure Government Cloud |

---

## 11. Prioritized 36-Hour Build Order

1. **Extraction** — CV preprocessing + OCR pipeline working end-to-end on sample documents
2. **Classification** — NLP mapping into structured schema fields
3. **Validation & confidence scoring** — rules engine + composite score + routing logic
4. **Verification dashboard** — split-view HITL screen (highest demo impact)
5. **Audit trail** — hash-chained history table + backtracking UI
6. **Integration APIs / architecture mockup** — mock DILRMP/LRMS gateway + Leaflet map overlay

---

## 12. Suggested Team Role Split

| Role | Focus |
|---|---|
| CV/OCR engineer | Preprocessing, OCR integration, bounding-box pipeline |
| NLP engineer | Field classification, schema mapping, multilingual handling |
| Backend engineer | FastAPI orchestration, database schema, validation engine, auth |
| Security-focused dev | Hashing, encryption, digital signatures, HMAC/mTLS gateway |
| Frontend/UI-UX dev | React app, split-view verification screen, dashboard, design system |
| GIS/integration dev | PostGIS spatial queries, Leaflet map, mock DILRMP/LRMS adapters |

---

*Prepared for Smart India Hackathon 2026 — Problem Statement 26018.*
