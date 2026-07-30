# ArchitectIQ — Phase 1 Base Infrastructure & Setup

This repository contains the **Phase 1: Project Setup & Base Infrastructure** implementation for **ArchitectIQ** — a production-grade AI-powered Software Planning Workspace.

---

## Technical Stack (Phase 1 Baseline)

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, React Router v6, Lucide Icons.
- **Backend:** FastAPI (Python 3.11), Pydantic v2, SQLAlchemy 2.0 (PostgreSQL driver).
- **Database:** PostgreSQL 15 (Relational storage setup).
- **Vector Database:** ChromaDB (Persistent vector store initialization).
- **Containerization:** Docker & Docker Compose.

---

## Project Structure Overview

```
ArchitectIQ/
├── docker-compose.yml             # Docker Compose orchestration file
├── .env.example                   # Environment configuration template
├── README.md                      # Setup and verification instructions
├── backend/                       # FastAPI Backend Application
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env.example
│   └── app/
│       ├── main.py                # App entrypoint & /api/v1/health check
│       ├── core/
│       │   └── config.py          # Settings & Environment variables loader
│       └── db/
│           ├── session.py         # PostgreSQL database connection check
│           └── vector_db.py       # ChromaDB vector store initialization
└── frontend/                      # React Single Page Application
    ├── Dockerfile
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── src/
        ├── App.tsx                # App router (Landing, Login, Register, Dashboard)
        ├── main.tsx               # DOM entrypoint
        ├── index.css              # Global styles & custom Tailwind utilities
        ├── context/
        │   └── ThemeContext.tsx   # Global Dark/Light Theme state
        ├── components/
        │   ├── ui/                # Reusable UI Components (Button, Card, Input, Modal, Spinner, ThemeToggle)
        │   └── layout/            # Layout Components (Navbar, Footer, DashboardLayout)
        └── pages/                 # Phase 1 UI Pages (LandingPage, LoginPage, RegisterPage, DashboardPage)
```

---

## Local Development Setup

### Method 1: Docker Compose (Recommended)

1. Ensure Docker Desktop is installed and running on your system.
2. Clone/navigate to the repository root directory:
   ```bash
   cd ArchitectIQ
   ```
3. Copy environment configuration:
   ```bash
   cp .env.example .env
   ```
4. Build and start all services:
   ```bash
   docker-compose up --build
   ```
5. Access running services:
   - **Frontend UI Workspace:** `http://localhost:3000` (or `http://localhost:5173` if running locally via Vite)
   - **Backend API Server:** `http://localhost:8000`
   - **Interactive API Swagger Docs:** `http://localhost:8000/docs`
   - **Health Check Endpoint:** `http://localhost:8000/api/v1/health`

---

### Method 2: Manual Local Setup (Without Docker)

#### Backend Setup:
```bash
cd backend
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env

# Run FastAPI Server
uvicorn app.main:app --reload --port 8000
```

#### Frontend Setup:
```bash
cd frontend
npm install
npm run dev
```

---

## Verification Steps (Phase 1 Baseline)

1. **Verify Backend Health Check:**
   - Open browser or execute HTTP GET request to `http://localhost:8000/api/v1/health`.
   - Expected JSON Response:
     ```json
     {
       "status": "healthy",
       "services": {
         "api": { "status": "healthy" },
         "database": { "status": "healthy", "message": "PostgreSQL connection successful" },
         "vector_store": { "status": "healthy", "message": "ChromaDB connection successful", "heartbeat": 1722300000 }
       }
     }
     ```

2. **Verify Frontend UI Pages:**
   - **Landing Page (`/`):** Confirm responsive hero section, features list, "How ArchitectIQ Works" workflow, and CTA.
   - **Theme Toggle:** Click the sun/moon icon in the top right to verify seamless switching between Dark and Light mode.
   - **Sign In Page (`/login`):** Verify clean card layout with email and password inputs.
   - **Sign Up Page (`/register`):** Verify registration form fields.
   - **Dashboard Workspace (`/dashboard`):** Verify empty dashboard layout shell including sidebar navigation, top header, status indicator, and preview modal.

---

## Phase 1 Status: COMPLETED ✅

Ready for **Phase 2: Authentication & Project Workspace** implementation!
