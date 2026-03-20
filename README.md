# 🚀 AI-Adaptive Onboarding Engine

> **IISC Hackathon 2026** — Close the skill gap before day one.

Upload a resume and a job description → the engine parses both with an open-source LLM (Mistral), maps the gap, and generates a personalized, interactive learning roadmap.

---

## 🗂️ Project Structure

```
.
├── backend/                  # FastAPI Python backend
│   ├── main.py               # App entry point (CORS, routing)
│   ├── adaptive_engine.py    # ⚠️  Core engine — STUB (your graph logic goes here)
│   ├── models/
│   │   └── schemas.py        # Pydantic models (Skill, SkillGap, Roadmap…)
│   ├── routers/
│   │   └── upload.py         # POST /api/upload/resume|jd, GET /api/gap
│   ├── services/
│   │   ├── parser.py         # PDF/TXT text extraction (PyMuPDF)
│   │   └── llm_client.py     # Mistral via Ollama (+ heuristic fallback)
│   └── requirements.txt
│
├── frontend/                 # Next.js 14 + TypeScript frontend
│   ├── app/
│   │   ├── page.tsx          # Home — upload zone
│   │   ├── dashboard/
│   │   │   └── page.tsx      # Dashboard — skill gap + roadmap tabs
│   │   └── globals.css
│   ├── components/
│   │   ├── UploadZone.tsx    # Drag-and-drop file upload
│   │   ├── SkillGapChart.tsx # Recharts Radar + Bar charts
│   │   └── RoadmapView.tsx   # Interactive weekly roadmap cards
│   └── lib/
│       └── api.ts            # Typed fetch wrappers
│
├── Dockerfile                # Multi-stage build
├── docker-compose.yml        # backend + frontend + ollama
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Python 3.11, FastAPI, Uvicorn |
| **PDF Parsing** | PyMuPDF (`fitz`) |
| **LLM** | Mistral (via [Ollama](https://ollama.com)) — falls back to keyword heuristics |
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS |
| **Charts** | [Recharts](https://recharts.org) (RadarChart, BarChart) |
| **Upload UI** | react-dropzone |
| **Icons** | lucide-react |
| **Container** | Docker + docker-compose |

---

## ⚡ Quick Start (Local, without Docker)

### 1. Backend

```bash
cd backend

# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# (Optional) Start Ollama with Mistral for full LLM extraction
# If Ollama is not running, the app falls back to keyword heuristics
ollama pull mistral
ollama serve

# Start the API server
uvicorn main:app --reload --port 8000
```

Visit **http://localhost:8000/docs** to explore the interactive Swagger UI.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit **http://localhost:3000**.

---

## 🐳 Quick Start (Docker)

```bash
# Build and start all services (backend, frontend, Ollama)
docker-compose up --build

# First run: Ollama will pull the Mistral model (~4 GB) — wait for it
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Swagger Docs | http://localhost:8000/docs |
| Ollama | http://localhost:11434 |

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/upload/resume` | Upload resume (PDF/TXT). Returns `SkillSet`. |
| `POST` | `/api/upload/jd` | Upload job description (PDF/TXT). Returns `SkillSet`. |
| `GET` | `/api/gap` | Compute skill gap + generate learning roadmap. |
| `DELETE` | `/api/reset` | Clear uploaded document state. |
| `GET` | `/health` | Liveness probe. |

---

## 🔑 Environment Variables

Copy `backend/.env.example` to `backend/.env`:

```env
OLLAMA_URL=http://localhost:11434/api/generate
OLLAMA_MODEL=mistral
```

---

## 🧠 Graph-based Skill Gap Analysis Logic

> **[Placeholder — reserved for your custom implementation]**
>
> This section documents the graph-based algorithm powering the skill node prerequisite engine in `backend/adaptive_engine.py`.

### Overview

*(Describe your approach here. Example structure below — replace with your own.)*

```
# Your description of the algorithm goal
# e.g. "We model skills as nodes in a Directed Acyclic Graph (DAG)…"
```

### Graph Data Structure

```python
# Example: describe the node/edge schema
# Node: { id, skill_name, category, estimated_hours, ... }
# Edge: (prerequisite_node → dependent_node)
```

### Algorithm: `_build_prerequisite_graph()`

*(Describe inputs, outputs, and the construction logic.)*

### Algorithm: `_topological_sort()`

*(Describe the sort strategy — Kahn's BFS, DFS post-order, etc.)*

### Algorithm: `prioritize_nodes()`

*(Describe the scoring function — gap magnitude, dependency depth, category weights, etc.)*

### Why this approach?

*(Justify the graph model. Why is a DAG suitable? What are the trade-offs?)*

---

## 🧪 Development Notes

- **Adaptive engine stub**: `adaptive_engine.py` returns **mock data** so the frontend renders correctly before the algorithm is implemented. Once you complete `_build_prerequisite_graph()` and `_topological_sort()`, replace the mock returns in `compute_skill_gap()` and `generate_roadmap()`.
- **LLM fallback**: If Ollama is not running, `llm_client.py` automatically falls back to a keyword matcher. This means the app works offline without a GPU for demos.
- **Adding new skills to the heuristic**: Edit `SKILL_KEYWORDS` in `backend/services/llm_client.py`.

---

## 📄 License

MIT — built for the IISC Hackathon 2026.
