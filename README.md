---

🌿 Harmonize EcoConnect

Unified Platform for Rural Resilience
AI-powered, edge-native, offline-first — for agriculture and primary healthcare

https://img.shields.io/badge/License-MIT-yellow.svg
https://img.shields.io/badge/Python-3.10-blue
https://img.shields.io/badge/TensorFlow%20Lite-2.15-orange
https://img.shields.io/badge/Appwrite-1.5-red
https://img.shields.io/badge/SQLite-3-green

---

📌 Overview

Harmonize EcoConnect is a dual‑mode, edge‑native AI platform designed for rural communities with unreliable electricity and internet. It runs entirely on solar‑powered devices and works offline, providing:

· 🌾 Agri Mode – On‑device crop disease detection, yield prediction, pest alerts, and input credit scoring.
· 🏥 Health Mode – Symptom triage, patient risk stratification, and encrypted health records – all without cloud dependency.

The system uses TinyML models (<1MB), a local SQLite database, Appwrite for eventual sync, and communicates via USSD, SMS, LoRa mesh, and MQTT.

🔗 Live Interactive Prototype
https://ai.studio/apps/1e7274a1-1677-480f-8092-dc8834a35503

---

🚀 Key Features

Feature Agri Mode Health Mode
Offline AI inference ✅ Crop disease detection (85% target accuracy) ✅ Symptom triage + risk scoring
Local data storage SQLite (soil, yield, pest logs) SQLite (patient records, visit history)
Sync when online Appwrite + MQTT Appwrite + MQTT
Low‑bandwidth UI Tailwind CSS + shadcn/ui Tailwind CSS + shadcn/ui
Voice / USSD fallback Planned Planned
Field‑tested ✅ 20 farmers, Ondo State ⚠️ Prototype only (testing pending)

---

🧱 Technical Architecture

```
┌─────────────────────────────────────────────────────┐
│                   User Interface                     │
│  (React + Tailwind + shadcn/ui + Chart.js)          │
└─────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────┐
│              Offline‑First Core                      │
│  • SQLite (local DB)                                 │
│  • TinyML models (TensorFlow Lite, INT8 quantized)   │
│  • Appwrite SDK (auth, document storage, sync queue) │
└─────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────┐
│              Communication Layer                     │
│  • GSM modem (USSD/SMS)                              │
│  • LoRa / BLE mesh                                   │
│  • MQTT batch sync                                   │
└─────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────┐
│                Hardware Stack                        │
│  • Raspberry Pi Zero 2 W / ESP32‑S3                  │
│  • LiFePO₄ battery + 20W solar panel                 │
│  • E‑ink/monochrome LCD (optional)                   │
└─────────────────────────────────────────────────────┘
```

---

📦 Repository Structure

```
Harmonize-EcoConnect/
├── backend/
│   ├── app/
│   │   ├── agri/            # Agri mode models & routes
│   │   ├── health/          # Health mode models & routes
│   │   ├── sync/            # Appwrite + MQTT sync logic
│   │   └── main.py          # FastAPI entry point
│   ├── models/              # Quantized .tflite files
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/           # WebSocket & state
│   │   └── App.tsx
│   └── package.json
├── hardware/
│   ├── schematics/          # Circuit diagrams
│   └── firmware/            # MicroPython / C++
├── docs/
│   ├── architecture.md
│   └── api_reference.md
├── tests/                   # Unit & integration tests
├── .github/workflows/       # CI/CD (OTA updates)
└── README.md
```

---

🛠️ Getting Started (Development)

Prerequisites

· Python 3.10+
· Node.js 18+
· Google Cloud account (for Vertex AI / Gemini – optional for local dev)
· Appwrite instance (self‑hosted or cloud)

Clone & Install

```bash
git clone https://github.com/Oracle69digitalmarketing/Harmonize-EcoConnect.git
cd Harmonize-EcoConnect

# Backend
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install
```

Run Locally

```bash
# Backend (FastAPI)
cd backend
uvicorn app.main:app --reload --port 8000

# Frontend (React + Vite)
cd frontend
npm run dev
```

Open http://localhost:5173 to see the dashboard.

Environment Variables

Create a .env file in backend/:

```
APPWRITE_ENDPOINT=https://your-appwrite-server/v1
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key
GEMINI_API_KEY=your_google_ai_key   # optional for enhanced models
```

---

📊 Field Testing Status

Component Status Location Users
Agri Mode (crop diagnosis) ✅ Tested Ondo State, Nigeria 20 farmers
Health Mode (triage) ⚠️ Prototype only Lab –
Solar + offline operation ✅ Validated Lab + field 5 units
USSD/SMS fallback 🔄 In development – –

---

🤝 Contributing

We welcome contributions! Please see CONTRIBUTING.md for guidelines.
All code is open source under the MIT license.

---

📄 License

MIT © 2026 Oracle69 Writing and Editing Enterprise

---

📬 Contact

Oluwaseun Adewumi – Co‑founder & CSO
LinkedIn | adewumioluwatoyin09@gmail.com

Adewumi Adewale – Co‑founder & CTO
LinkedIn | adewaleadewumi@oracle69.com

Parent Company: Oracle69 Writing and Editing Enterprise (RC4082607, SMEDAN SUIN83388941)

---

🙏 Acknowledgements

· RES4Africa – RAISEAfrica Accelerator support
· Tony Elumelu Foundation – Entrepreneurship Programme
· Google AI Studio – Prototyping environment
· Open source community: TensorFlow Lite, Appwrite, SQLite, FastAPI, React

---

“We aren’t building for the world that has everything. We are building for the communities that need it most.”

---
