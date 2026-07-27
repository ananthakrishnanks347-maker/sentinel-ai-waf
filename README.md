# 🛡️ Sentinel-AI — Hybrid Edge WAF & Real-Time Security Dashboard

**A dual-layer Web Application Firewall that pairs instant regex filtering with LLM-powered deep payload inspection — and streams every verdict live to a React dashboard.**

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-Async%20Proxy-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-Vite-61DAFB?logo=react&logoColor=black)
![WebSockets](https://img.shields.io/badge/Realtime-WebSockets-FF6F00)
![License](https://img.shields.io/badge/License-MIT-green)
![Status](https://img.shields.io/badge/Status-Active-brightgreen)
![Last Commit](https://img.shields.io/github/last-commit/ananthakrishnanks347-maker/sentinel-ai-waf)

Sentinel-AI defends web applications against the OWASP Top 10, zero-day anomalies, and prompt-injection attacks. Known attack signatures (SQLi, XSS, path traversal) are caught in microseconds by a local regex engine, while ambiguous or novel payloads are escalated to an LLM for deeper reasoning — all without adding noticeable latency to legitimate traffic.

![Sentinel-AI live dashboard](assets/dashboard-ui.png)

---

## 📑 Table of Contents

- [Why Sentinel-AI](#-why-sentinel-ai)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Screenshots](#-screenshots)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Running the Application](#-running-the-application)
- [Roadmap](#-roadmap)
- [Security Note](#-security-note)
- [License](#-license)
- [Author](#-author)

---

## 💡 Why Sentinel-AI

Traditional WAFs rely purely on static signatures — fast, but blind to novel or obfuscated attacks. Pure LLM-based filtering catches more, but is too slow to sit in the critical path of every request. Sentinel-AI takes a **hybrid approach**:

- Known, high-confidence attack patterns (SQLi, XSS, path traversal) are blocked instantly by a local regex engine — zero added latency.
- Anything ambiguous, novel, or resembling a prompt-injection attempt against an AI backend is escalated to an LLM for contextual reasoning before a verdict is made.
- Every decision — allowed or blocked — is streamed live to a dashboard so the defense is auditable, not a black box.

---

## 🚀 Key Features

| Feature | Description |
|---|---|
| **Dual-Layer Defense Engine** | Layer 1 uses local regex signatures for instant SQLi / XSS / path traversal detection. Layer 2 escalates ambiguous payloads to an LLM for zero-day and prompt-injection analysis. |
| **Real-Time Threat Telemetry** | Every allow/block decision is broadcast over WebSockets to a live React dashboard — no polling, no refresh. |
| **Asynchronous Reverse Proxy** | Built on FastAPI + Uvicorn to inspect and forward HTTP traffic with minimal overhead. |
| **Confidence-Scored Verdicts** | Each block includes a threat classification and confidence score (e.g. `SQL Injection · 0.95`) for transparent, auditable decisions. |
| **Built-In Attack Simulator** | A ready-to-run Python script fires SQLi, XSS, path traversal, and AI prompt-injection payloads to validate detection end-to-end. |

---

## 🏗️ Architecture

```text
[ Incoming Traffic / Attack Simulation ]
                   │
                   ▼
       [ FastAPI Reverse Proxy WAF ]
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
[ Layer 1: Regex Engine ]   [ Layer 2: LLM Threat Analyzer ]
 SQLi · XSS · Traversal      Zero-Day & Prompt-Injection Anomalies
         │                   │
         └─────────┬─────────┘
                   │
          [ Decision: 200 / 403 ]
                   │
          (WebSocket Broadcast)
                   │
                   ▼
        [ Live React Dashboard UI ]
```

---

## 📂 Project Structure

```text
sentinel-ai-waf/
├── waf_server/          # FastAPI reverse proxy + regex engine + LLM analyzer
│   ├── main.py
│   └── requirements.txt
├── dashboard/            # React + Vite + Tailwind live dashboard
│   ├── src/
│   └── package.json
├── test_attacks.py       # Attack simulation script
├── assets/                # README screenshots
├── .gitignore
└── README.md
```

---

## 📸 Screenshots

**Live Security Dashboard**
Real-time metrics — total requests inspected, threats blocked, clean traffic allowed, and live threat ratio — alongside a live traffic feed showing method, endpoint, threat classification, and payload preview for every request as it happens.

![Sentinel-AI live dashboard showing blocked SQLi, XSS, path traversal, and AI prompt injection attempts](assets/dashboard-ui.png)

**WAF server intercepting and scoring live traffic**
Requests are classified in real time — allowed traffic passes through as `200 OK`, while SQLi, XSS, path traversal, and prompt-injection attempts are blocked with a `403 Forbidden` and a confidence-scored reason.

![WAF server blocking malicious requests](assets/waf-server-log.png)

**Attack simulator validating detection end-to-end**
`test_attacks.py` fires a normal request plus four attack types — every malicious request is correctly blocked with its threat reason and confidence score.

![Attack simulation results](assets/attack-simulation.png)

---

## 🛠️ Tech Stack

- **Backend:** Python, FastAPI, Uvicorn, WebSockets, OpenAI-compatible API SDK
- **Frontend:** React, Vite, Tailwind CSS, Lucide Icons
- **Testing:** Python `requests`, OWASP-aligned regex signatures, custom attack simulator

---

## ⚡ Quick Start

### Prerequisites
- Python 3.10+
- Node.js & npm
- Git

### 1. Clone the repository
```bash
git clone https://github.com/ananthakrishnanks347-maker/sentinel-ai-waf.git
cd sentinel-ai-waf
```

### 2. Configure the backend WAF
```bash
# Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r waf_server/requirements.txt

# Set up environment variables
cp .env.example waf_server/.env
# Open waf_server/.env and add your API key (AGENT_ROUTER_KEY or OpenAI key)
```

### 3. Configure the React dashboard
```bash
cd dashboard
npm install
cd ..
```

---

## 🧪 Running the Application

Open three terminal windows:

**Terminal 1 — Backend WAF**
```bash
cd waf_server
source ../venv/bin/activate
uvicorn main:app --reload --port 8000
```

**Terminal 2 — React Dashboard**
```bash
cd dashboard
npm run dev
```
Visit the live dashboard at **http://localhost:5173**

**Terminal 3 — Fire the Attack Simulation**
```bash
source venv/bin/activate
python3 test_attacks.py
```

Watch the dashboard update instantly as malicious traffic is flagged, scored, and blocked with `403 Forbidden`.

---

## 🗺️ Roadmap

- [ ] Persist threat logs to a database for historical analysis
- [ ] Add rate-limiting and IP reputation scoring
- [ ] Dockerize the full stack (proxy + dashboard) for one-command deployment
- [ ] Expand regex signature set to cover SSRF and command injection

---

## 🔐 Security Note

Sentinel-AI is a personal/portfolio project built for learning and demonstration purposes. It has not undergone a formal third-party security audit and should not be deployed as a sole line of defense in a production environment without further hardening, testing, and review.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

## 👤 Author

**Ananthakrishnan K.S**
Aspiring Penetration Tester / Security Researcher

[![GitHub](https://img.shields.io/badge/GitHub-ananthakrishnanks347--maker-181717?logo=github)](https://github.com/ananthakrishnanks347-maker)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/ananthakrishnan-ks-)
[![TryHackMe](https://img.shields.io/badge/TryHackMe-Profile-212C42?logo=tryhackme&logoColor=white)](https://tryhackme.com/p/Ananthakrishnank.s)
