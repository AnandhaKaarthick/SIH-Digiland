# 🏛️ DigiLand — Intelligent Land Record Digitization, Multi-Tier Validation, Audit Ledger & Cadastral GIS Platform

> **Smart India Hackathon (SIH 2026) — Problem Statement 26018**  
> *End-to-End GovTech Solution for Land Record Extraction, Cross-Database Verification, Immutable Blockchain Audit Ledger & Cadastral Vector Mapping*

---

![DigiLand Banner](https://img.shields.io/badge/DigiLand-GovTech%20Platform-004526?style=for-the-badge&logo=gov.uk)
![SIH 2026](https://img.shields.io/badge/SIH-2026%20PS%2026018-c17817?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-v0.109-009688?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-v18.3-61DAFB?style=for-the-badge&logo=react)
![SQLite](https://img.shields.io/badge/SQLite-DB%20Active-003B57?style=for-the-badge&logo=sqlite)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

---

## 🌟 Overview

**DigiLand** is an enterprise-grade, state-of-the-art GovTech platform designed to digitize, validate, deduplicate, and audit Indian land records across diverse document formats and languages. Built specifically for Revenue Department officers, Patwaris, and Tehsildars under DILRMP (Digital India Land Records Modernization Programme) guidelines.

DigiLand processes all 4 key revenue document schemas (**Record of Rights / Khatauni**, **Conveyance / Sale Deeds**, **Mutation Orders**, and **Cadastral Maps**), providing **real-time multilingual OCR extraction**, **interactive split-view verification with bounding box backtracking**, **SHA-256 cryptographic blockchain ledger auditability**, and **automated deduplication**.

---

## ✨ Key Features

### 1. 🌐 Multilingual OCR & NLP Token Recognition (10 Languages)
- **Languages Supported**: English, Hindi (हिन्दी), Tamil (தமிழ்), Telugu (తెలుగు), Marathi (मराठी), Bengali (বাংলা), Gujarati (ગુજરાતી), Kannada (ಕನ್ನಡ), Malayalam (മലയാളം), and Urdu (اردو with native Right-to-Left layout).
- Instant, zero-reload language switching powered by React Language Context.
- Automated document schema classification (**CONVEYANCE_DEED**, **RECORD_OF_RIGHTS**, **MUTATION_ORDER**, **CADASTRAL_MAP**).

### 2. 🔍 Split-View Verification & Multi-Page Document Viewer
- **Dual-Pane Viewport**: 50/50 split screen matching extracted schema form fields with source document bounding boxes.
- **OCR Bounding Box Backtracking**: Clicking any field (e.g. *Khasra No*, *Khata No*, *Owner Shares*, *ULPIN*) highlights the exact visual ROI box on the source scan.
- **Full-Screen Interactive Inspection Modal**: High-resolution document inspection viewer supporting page-by-page thumbnail navigation, multi-page page stepping (`Page X of Y`), zoom controls (+ / - / 100%), and bounding box toggling.
- **Native PDF & Image Support**: Renders actual uploaded files (PDFs via interactive viewer iframe, images via high-definition canvas).

### 3. ⚡ Real-Time SHA-256 Deduplication & 1-Click Automated Purging
- **Cryptographic & Metadata Deduplication**: Scans every upload against current batch queues and database registry (`MOCK_LAND_RECORDS`).
- **Real-Time Duplicate Alert Modal**: Displays an instant `⚠️ DUPLICATE DETECTED` alert with side-by-side comparison cards (*Master Record in System* vs *Uploaded Duplicate File*).
- **Persistent Purging Engine**: 1-click **"Purge All Duplicates"** and **"Remove Duplicate"** actions permanently remove redundant records across navigation tabs and browser reloads.

### 4. ⚖️ Revenue Invariants Engine & Dual Sign-Off (Approve / Reject)
- **Invariant Checks**: Auto-validates joint ownership share fractions ($\sum \text{Shares} = 1.00$) and alerts officers on discrepancies.
- **Dual Verification Parity**:
  - **Approve & Save**: Commits validated record to database with officer's Ed25519 digital signature (`VALID / STP`).
  - **Reject & Flag Record**: Opens an interactive **Rejection Reason Modal** allowing officers to select legal rejection grounds (*Fraudulent Claim*, *Duplicate Entry*, *Invalid Stamp Duty*, *Mismatched Boundaries*, *Illegible Scan*) and log critical error reasons (`FAILED_CRITICAL`).

### 5. 🛡️ Immutable Cryptographic Audit Ledger
- **SHA-256 Blockchain Block Hashing**: Every human review action (approval, correction, rejection) generates a cryptographically linked block hash ($H_n = \text{SHA256}(H_{n-1} \parallel \text{Payload})$).
- **Officer ECDSA / Ed25519 Digital Signatures**: Tamper-proof digital signatures for revenue officers.

### 6. 🗺️ Bhu-Naksha & Cadastral GIS Vector Mapping Engine
- **Spatial Geometry Validation**: Cross-verifies textual plot area ($m^2$) against spatial PostGIS GIS polygon geometries.
- Interactive GIS map view with layer toggles (Satellite, Cadastral Parcels, Zoning boundaries).

---

## 🛠️ Technology Stack

| Layer | Technologies & Frameworks |
| :--- | :--- |
| **Frontend Framework** | React 18, Vite 5, TailwindCSS / Custom Theme System |
| **Icons & Design** | Lucide React, Custom Dark/Parchment GovTech Aesthetic |
| **Backend Framework** | Python 3.11, FastAPI, Uvicorn ASGI Server |
| **OCR & NLP Engine** | PaddleOCR PP-OCRv4, Regex Pattern Extractors |
| **Database & Ledger** | SQLite, SQLAlchemy ORM, SHA-256 Cryptographic Audit Hash |
| **Internationalization** | Native i18n Engine (10 Languages + RTL Support) |

---

## ⚡ 1-Click Dual Launcher (Frontend + Backend)

Start both the **FastAPI Backend (Port 8000)** and **React Frontend (Port 5173)** simultaneously using a single command:

### 🔹 Option 1: Single Python File Launcher (Recommended)
Run in terminal or double-click:
```bash
python run.py
```
> *This automatically starts the FastAPI backend, starts the Vite React frontend, and opens the Web App in your browser.*

### 🔹 Option 2: Windows Batch File
Double-click `start.bat` in File Explorer, or run in terminal:
```cmd
start.bat
```

### 🔹 Option 3: PowerShell Script
Run in PowerShell:
```powershell
.\start.ps1
```

### 🔹 Option 4: npm Command (Cross-Platform)
Run in terminal:
```bash
npm start
```

---

## 🛠️ Manual Step-by-Step Setup

### Prerequisites
- **Node.js** (v18.0 or higher)
- **Python** (v3.9 or higher)

### 1. Clone the Repository
```bash
git clone https://github.com/AnandhaKaarthick/SIH-Digiland.git
cd SIH-Digiland
```

### 2. Frontend Setup (React + Vite)
```bash
# Install frontend dependencies
npm install

# Start Vite Development Server
npm run dev
```

### 3. Backend Setup (FastAPI + Python)
```bash
# Install Python dependencies
pip install fastapi uvicorn sqlalchemy pydantic

# Start FastAPI ASGI Backend Server
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 📂 Project Structure

```
SIH 2026/
├── backend/                  # FastAPI Backend Server
│   ├── main.py               # Main ASGI Application Entrypoint
│   ├── models/               # SQLAlchemy Database Schemas & Audit Trail
│   ├── routers/              # API Route Handlers (records, OCR, GIS, auth)
│   └── services/             # Audit Chain & OCR Pipeline Services
├── src/                      # React Frontend Source
│   ├── components/           # Core Platform Views & Components
│   │   ├── Dashboard.jsx
│   │   ├── DocumentUpload.jsx
│   │   ├── SplitViewVerification.jsx
│   │   ├── RecordDetailsView.jsx
│   │   ├── NavigationShell.jsx
│   │   ├── GisMapView.jsx
│   │   └── AdminRbac.jsx
│   ├── context/              # Multilingual i18n Language Context
│   ├── data/                 # Seed Data & Land Record Repositories
│   ├── utils/                # Document SVG & Helper Generators
│   ├── services/             # REST API Client Service
│   ├── App.jsx               # Main React Application Routing
│   └── index.css             # TailwindCSS & Design System Tokens
├── public/                   # Static Assets & Icons
├── package.json              # Frontend Package Manifest
├── vite.config.js            # Vite Configuration
├── .gitignore                # Git Ignore Specifications
└── README.md                 # Project Documentation
```

---

## 📡 API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/records` | Fetch all land records with optional search query `?q=` |
| `GET` | `/api/v1/records/{record_id}` | Fetch detailed land record by ID |
| `POST` | `/api/v1/ocr/process-full-pipeline` | Ingest uploaded document & run OCR pipeline |
| `POST` | `/api/v1/records/review/commit` | Commit human review (Approve / Reject) with SHA-256 signature |
| `DELETE` | `/api/v1/records/{record_id}` | Permanently delete a record from SQLite database |
| `POST` | `/api/v1/records/purge-duplicates` | Deduplicate database & purge redundant duplicate records |
| `GET` | `/api/v1/records/audit-trail/all` | Fetch full cryptographic audit ledger chain |

---

## 📄 License & Attribution

Developed for **Smart India Hackathon (SIH 2026)** under **Problem Statement 26018**.  
Distributed under the **MIT License**.
