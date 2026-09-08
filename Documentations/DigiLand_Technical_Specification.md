# DigiLand — Technical Specification

**SIH 2026 | Problem Statement 26018**

This document specifies exactly what the **frontend**, **backend**, **database**, and **supporting tech stack** must contain to build DigiLand. It is a build spec, not a UI mockup — no frontend code is included here.

> **Scope reminder:** CV / OCR / Field-classification is a separate teammate's module. Everything below (frontend, backend, database) is written from the point where their structured JSON output enters our system, at `POST /api/v1/process-document`.

---

## 1. Frontend — What It Should Contain

### 1.1 Framework & core libraries
| Purpose | Library |
|---|---|
| Framework | React.js (Vite or Next.js) |
| Styling | Tailwind CSS (utility classes, matches design tokens in §3) |
| State management | React Context + hooks, or Zustand for larger shared state (auth, active record, queue) |
| Routing | React Router (or Next.js file-based routing) |
| Map rendering | Leaflet or OpenLayers (for GIS/cadastral views) |
| Charts / dashboard | Recharts, Chart.js, or Plotly |
| Forms | React Hook Form + Zod/Yup validation |
| HTTP client | Axios or native fetch with an API wrapper |
| Auth/session | JWT stored in memory + httpOnly refresh cookie |
| i18n / multilingual UI | react-i18next (labels only — extraction language handling is the teammate's module) |

### 1.2 Screens/pages required

| Screen | Must contain |
|---|---|
| **Login** | Email/ID + password fields, role indicator, error states, "forgot password" stub |
| **Dashboard (landing)** | Metric cards (docs processed, accuracy %, pending count, error stats), district-wise progress map/chart, recent-activity feed |
| **Document upload** | Drag-and-drop + file picker, upload progress bar, list of recently uploaded docs with status chips |
| **Processing status** | Stepper/progress UI showing pipeline stage (received → validating → scoring → routed), polling or WebSocket-driven |
| **Verification queue** | Table/list of records needing review, filterable by district/tehsil/confidence band/error type, sortable, pagination |
| **Verification detail (split-view)** | Left: source document image with bounding-box overlay (from teammate's JSON); right: editable structured fields, each with a confidence badge and validation-flag color; save/approve/reject actions; digital-signature capture on approve |
| **Record detail (read view)** | All structured fields, validation flags, linked cadastral parcel preview, full change history for that record |
| **Audit trail** | Chronological, immutable list of all changes to a record: field, old value, new value, actor, timestamp, hash; chain-integrity indicator |
| **GIS map view** | Leaflet/OpenLayers map, color-coded parcel polygons (green=validated, amber=flagged, red=mismatch), click-to-inspect popup |
| **Admin / RBAC** | User list, role assignment, permission matrix, activity log |
| **Citizen lookup (read-only)** | Search by khasra/khata number, minimal public-safe record view (PII redacted) |

### 1.3 Shared UI components to build
- Status badge (VALID / FLAGGED_WARNING / FAILED_CRITICAL)
- Confidence chip (percentage + color from the scoring tiers)
- Bounding-box image viewer with zoom/crop
- Metric card (dashboard)
- Data table with filter/sort/pagination
- Role-gated route wrapper (redirects if user lacks permission)
- Toast/notification system for save/error states

### 1.4 What frontend does **not** need to include
- No document image preprocessing (handled upstream by teammate's CV module)
- No OCR/handwriting rendering logic — just displays what the JSON gives it
- No offline-first/PWA requirement unless time allows
- No payment, billing, or public registration flows

---

## 2. Backend — What It Should Contain

### 2.1 Framework & core libraries
| Purpose | Library |
|---|---|
| API framework | FastAPI (Python) |
| ORM | SQLAlchemy or SQLModel |
| Data validation | Pydantic |
| Auth | JWT (PyJWT or fastapi-users), password hashing via bcrypt/Argon2 |
| Background jobs | Celery + Redis, or FastAPI `BackgroundTasks` for hackathon scope |
| Spatial queries | GeoAlchemy2 (PostGIS bindings) |
| Object storage client | boto3 (S3-compatible) or MinIO SDK |
| Crypto | `hashlib` (SHA-256), `cryptography` library (AES-256-GCM, ECDSA/Ed25519), `hmac` |
| HTTP client (outbound gov APIs) | `httpx` or `requests` |
| Testing | Pytest |

### 2.2 Backend modules/services required

| Module | Responsibility |
|---|---|
| **Auth service** | Login, JWT issuance, role claims, password hashing |
| **Document intake service** | Accepts uploads, computes SHA-256, writes to object storage, creates `documents` row |
| **Ingestion adapter** | Receives the teammate's CV/OCR/NLP JSON output and normalizes it into the internal schema (§5.3 of the previous doc) |
| **Validation engine** | Runs all business rules (area balance, unit conversion, share-sum, regex/ID checks, prohibited-transfer checks), cross-DB checks, duplicate detection |
| **Confidence scoring service** | Computes the composite weighted score, assigns status flag, decides routing (STP / HITL / reject) |
| **Verification service** | Serves record + bounding boxes to the frontend, accepts human corrections, applies digital signature, recalculates audit hash |
| **Audit trail service** | Appends every change to the hash-chained `audit_trails`/`land_record_history` table; exposes chain-verification endpoint |
| **Gov integration gateway** | Adapter pattern with `MockGovApiAdapter` and `RealGovApiAdapter` implementations (LGD, NGDRS, LRMS mutation checks); HMAC-signed, mTLS in production |
| **GIS service** | PostGIS spatial queries (`ST_Intersects`, `ST_Area`, `ST_Overlaps`) for boundary validation and duplicate/overlap detection |
| **Dashboard/metrics service** | Aggregates counts (processed, accuracy, pending, errors) for the dashboard endpoints |
| **RBAC middleware** | Enforces role-based access on every route |

### 2.3 API endpoints (consolidated)

| Endpoint | Method | Description |
|---|---|---|
| `/api/v1/auth/login` | POST | Authenticate, issue JWT |
| `/api/v1/documents/upload` | POST | Upload file, hash, store metadata |
| `/api/v1/process-document` | POST | Accept teammate's JSON, run validation + scoring, persist record |
| `/api/v1/pipeline/status/{job_id}` | GET | Poll processing status |
| `/api/v1/records/flagged` | GET | List records needing review (filterable) |
| `/api/v1/review/{record_id}` | GET | Fetch record + bounding boxes for split-view |
| `/api/v1/review/{record_id}/commit` | POST | Submit human correction, sign, mark VERIFIED |
| `/api/v1/records/{record_id}/history` | GET | Full audit trail for a record |
| `/api/v1/records/{record_id}/verify-chain` | GET | Verify hash-chain integrity for that record |
| `/api/v1/lrms/sync` | POST | Push verified record to (mock/real) LRMS/DILRMP |
| `/api/v1/dashboard/metrics` | GET | Aggregated dashboard stats |
| `/api/v1/gis/parcels` | GET | Cadastral parcel geometries for map rendering |
| `/api/v1/admin/users` | GET/POST/PATCH | RBAC user management |

### 2.4 What backend does **not** need to include
- No CV/OCR/NLP model hosting (that's the teammate's separate service — backend only consumes its output via the ingestion adapter)
- No real government API credentials — mock adapter is sufficient for the demo
- No payment/billing logic

---

## 3. Database — What It Should Contain

**Single PostgreSQL instance with the PostGIS extension enabled.**

| Table | Purpose | Key columns |
|---|---|---|
| `users` | Auth & roles | id, name, email, password_hash, role (`clerk`/`patwari`/`tehsildar`/`admin`), created_at |
| `documents` | Uploaded file metadata | id, uploader_id, file_path, sha256_hash, p_hash, uploaded_at |
| `land_records` | Structured extracted/validated data | id, document_id, khasra_no, khata_no, owner_names (jsonb), owner_shares (jsonb), plot_area, plot_area_unit, village, tehsil, district, land_classification, mutation_details, confidence_score, status_flag, created_at, updated_at |
| `extracted_tokens` | Raw tokens + bounding boxes (from teammate's output) | id, document_id, token_text, bbox (xmin, ymin, xmax, ymax), field_name, engine_confidence |
| `validation_logs` | Per-rule pass/fail results | id, record_id, rule_name, result (`VALID`/`FLAGGED_WARNING`/`FAILED_CRITICAL`), details, checked_at |
| `cadastral_parcels` | Spatial reference geometries | id, khasra_no, village_lgd_code, geom (PostGIS geometry), area_sqm |
| `audit_trails` / `land_record_history` | Immutable hash-chained change log | history_id, record_id, field_name, old_value, new_value, previous_hash, current_hash, verified_by, digital_signature, timestamp |
| `lgd_master` | Local seeded copy of village/tehsil/district codes (mock) | state_code, district_code, tehsil_code, village_code, village_name |
| `mock_deeds` | Seeded sample deed records for demo validation | deed_no, year, status, seller, buyer |

### 3.1 Key constraints/design notes
- `documents.sha256_hash` — unique constraint (blocks duplicate uploads)
- `land_records.confidence_score` — numeric(5,2), 0.00–100.00
- `land_records.status_flag` — enum: `AUTO_APPROVED`, `REQUIRES_REVIEW`, `REJECTED_CRITICAL`
- `cadastral_parcels.geom` — indexed with a GiST index for fast `ST_Intersects`/`ST_Overlaps` queries
- `audit_trails.current_hash` — computed as `SHA-256(previous_hash + serialized_payload)`; never updated in place, only appended
- Sensitive owner-identity fields (e.g., national ID numbers, if collected) should be stored encrypted (AES-256-GCM), not plaintext

---

## 4. Other Technical Stack

| Category | Technology |
|---|---|
| Object storage | MinIO (self-hosted, S3-compatible) or AWS S3 |
| Containerization | Docker + Docker Compose (one container each: frontend, backend, Postgres/PostGIS, MinIO) |
| GIS map server | GeoServer (optional for demo — Leaflet can render PostGIS-served GeoJSON directly without it) |
| Cryptography | `cryptography` (Python) for AES-256-GCM + ECDSA/Ed25519; `hmac`/`hashlib` for signing |
| Secrets/key management | `.env` + python-dotenv for hackathon; note KMS (AWS KMS / HashiCorp Vault) as the production upgrade path |
| CI basics | GitHub Actions (lint + test on push) — optional, nice-to-have for judging polish |
| API documentation | FastAPI's built-in OpenAPI/Swagger UI (auto-generated, zero extra work) |
| Monitoring/dashboards (stretch) | Grafana or Apache Superset if time allows; otherwise the in-app dashboard is sufficient |
| Deployment target for demo | Local Docker Compose stack, or a single cloud VM (no need for k8s at hackathon scale) |

---

## 5. Suggested Repo/Service Boundaries

```
digiland/
├── frontend/              # React app (this doc's §1)
├── backend/                # FastAPI app (this doc's §2)
│   ├── routers/
│   ├── services/
│   │   ├── validation_engine.py
│   │   ├── confidence_scoring.py
│   │   ├── audit_chain.py
│   │   ├── gov_gateway/
│   │   │   ├── base.py
│   │   │   ├── mock_adapter.py
│   │   │   └── real_adapter.py
│   │   └── ingestion_adapter.py   # normalizes teammate's CV/OCR/NLP JSON
│   ├── models/             # SQLAlchemy/SQLModel schema
│   └── main.py
├── db/
│   └── init.sql             # schema + seed data (LGD master, mock deeds, sample cadastral parcels)
└── docker-compose.yml
```

---

*Prepared for Smart India Hackathon 2026 — Problem Statement 26018. Companion to `DigiLand_Complete_Documentation.md`.*
