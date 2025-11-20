# DoYouTrustMe – 3D AI Avatar Chatbot

Research prototype from a Bachelor thesis on **trust in 3D AI avatars**.  
The system compares a **3D Avatar-Interface** with a **klassische Textoberfläche** for information search in a university context. It consists of a **SvelteKit app** (3D client + evaluation UI) and a **Python Flask server** (STT, TTS, LLM proxy).

> ⚠️ Forschungsprototyp – keine Gewähr auf Richtigkeit oder Stabilität, nicht für produktiven Einsatz gedacht.

---

## 🏗 Architektur (Kurzfassung)

- **Webseite (Client, SvelteKit + Three.js)**
  - Rendert den 3D-Avatar, spielt Audio ab, verarbeitet Tastatur- und Mikrofoneingabe.
- **SvelteKit App-Server**
  - Proxy zu einem Ubuntu/Python-Server (`/histarBackend/*` Routes).
  - Steuert Avatar-Aktionen und verwaltet alle Evaluationen (Supabase).
- **PythonServer (Ubuntu VM, Flask)**
  - Endpunkte für `/gwdg/chat`, `/stt`, `/tts`, usw.
  - Whisper (STT), Piper (TTS), Phonem-/Viseme-Extraktion.
  - Proxy zur GWDG-API mit `meta-llama-3.1-8b-rag`.
- **GWDG RAG Container**
  - LLM + Retrieval für studienbezogene Inhalte.
- **Supabase**
  - Speicherung von Antworten, GAAIS, NASA-TLX, Aufgabenbewertung und Feedback.

---

## 👀 Avatare

Zwei GLB-Modelle (statisch geriggte Avatare, via Blender vorbereitet):

```text
static/models/Male_Version_2.glb
static/models/Female_Version_4.glb
````

(Links im Code konfigurierbar, z.B. `https://histar.informatik.uni-bremen.de/assets/models/...`)

---

## 🔧 Tech Stack

* **Frontend:** SvelteKit, TypeScript, Three.js, Supabase, i18n (DE/EN)
* **Backend:** Python 3.10, Flask, Whisper, Piper, Gunicorn + Nginx (auf Uni-VM)
* **LLM:** `meta-llama-3.1-8b-rag` (GWDG RAG Container)

---

## ⚙️ Environment Variablen (Auszug)

Im SvelteKit-Teil werden u.a. genutzt:

```bash
# Supabase
PUBLIC_SUPABASE_URL=
PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_KEY_PRIVATE=
SUPABASE_TOKEN=

# VM / PythonServer
VM_API_URL=   # z.B. http://localhost:8000 oder Uni-VM
VM_API_KEY=

# GWDG LLM / RAG
GWDG_API_KEY=
GWDG_BASE_URL=
GWDG_MODEL=meta-llama-3.1-8b-rag
GWDG_ARCANA_ID=

# Sonstiges
BLOB_READ_WRITE_TOKEN=
```

Alternativ kann ein einzelner Cloud-Anbieter (Azure/AWS) STT, TTS und LLM bereitstellen; dann reduziert sich die Anzahl der Variablen entsprechend.

---

## 🧪 Lokales Setup

### 1️⃣ PythonServer starten

```bash
python3.10 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python PythonServer/api/server.py
```

### 2️⃣ SvelteKit-App starten

```bash
npm install
npm run dev -- --open
```

Die App läuft dann (typisch) unter `http://localhost:5173/` und kommuniziert mit dem PythonServer unter `VM_API_URL`.

## ✨ Wichtige Features

* 3D-Avatar-Interface mit Lip-Sync (Visemes → Blendshapes)
* Vergleich Avatar vs. Text-Interface (Between-Subjects-Design)
* RAG-basierte Antworten aus einem GWDG-LLM
* Voll integrierter Evaluations-Workflow:

  * Aufgabenbearbeitung
  * GAAIS
  * NASA-TLX
  * Kurzbewertungen der Varianten
  * Abschlussfragebogen
* Statistiken & Visualisierung (Svelte + ECharts) im `/Results`-Bereich

---

## ⚠️ Einschränkungen

* Antwortzeiten können auf der Uni-VM spürbar höher sein (v.a. STT/TTS).
* Prototyp-Charakter: eingeschränkte Fehlerbehandlung und Robustheit.
* Optimiert für aktuelle Chromium-Browser; andere Browser können Render-/Audio-Probleme zeigen.
* System ist nicht für personenbezogene Daten ausgelegt.

---

## 📜 Lizenzen

* npm-Abhängigkeiten:
  `npx license-checker --json --out static/licenses/npm-licenses.json`
* Python-Abhängigkeiten:
  `pip-licenses --format=json --output-file=pip-licenses.json`

Avatare und Grafiken sind ausschließlich für Forschungszwecke in dieser Arbeit verwendet; eine Wiederverwendung außerhalb des Projektkontextes kann weiteren Lizenzbedingungen unterliegen.
