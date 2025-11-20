# **DoYouTrustMe – 3D AI Avatar Chatbot**

Research prototype from a Bachelor’s thesis on **trust in 3D AI avatars**.
The project compares a **3D avatar interface** with a **classical text interface** for information retrieval in a university context.
It consists of a **SvelteKit client** (3D rendering + evaluation UI) and a **Python Flask server** (STT, TTS, LLM proxy).

> ⚠️ **Research prototype** – no guarantees for correctness, stability, or production use.
> ⚠️ **Backend server (local)** available here:
> 👉 **[https://github.com/lechiffrebeats/3d-ai-avatars-server](https://github.com/lechiffrebeats/3d-ai-avatars-server)**

---

## 🏗 **Architecture (Short Overview)**

* **Web Client (SvelteKit + Three.js)**

  * Renders the 3D avatar, plays audio, handles keyboard & microphone input.

* **SvelteKit App Server**

  * Proxies requests to the Python server (`/histarBackend/*`) mentioned above.
  * Controls avatar actions and stores evaluation data (Supabase).

* **Python Server (Flask on Ubuntu VM)**

  * Endpoints for `/gwdg/chat`, `/stt`, `/tts`, etc.
  * Whisper (STT), Piper (TTS), phoneme/viseme extraction.
  * Acts as a proxy to the GWDG LLM (`meta-llama-3.1-8b-rag`) or if you have cuda/gpu on do it locally [https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct](https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct).

* **GWDG RAG Container**

  * LLM + retrieval for university-related information.

* **Supabase**

  * Stores all evaluation data (GAAIS, NASA-TLX, tasks, feedback).

## 👀 **Avatars (Licensing Notice)**

The avatar models used in this project are **paid assets purchased from CGTrader**. 
Due to licensing restrictions, **the original `.glb/.fbx` files cannot be included in this public repository** and are **not allowed to be redistributed**.

* use your **own legally purchased copy** of the avatars
* place them in `static/models/` & adjust naming in Avatar.svelte
* replace them with **your own models** (open-source or custom)

### 📩 Need help?

If you need a **license-safe alternative setup**, contact me or replace the models with **open-source CC0 avatars**.

## 🔧 **Tech Stack**

**Frontend:** SvelteKit, TypeScript, Three.js, Supabase, i18n
**Backend:** Python 3.10, Flask, Whisper, Piper, Gunicorn + Nginx, PiperTTS, BFA
**LLM:** `meta-llama-3.1-8b-rag` (via GWDG RAG Container)

---

## ⚙️ **Environment Variables (Excerpt)**

```bash
# Supabase
PUBLIC_SUPABASE_URL=
PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_KEY_PRIVATE=
SUPABASE_TOKEN=

# VM / Python Server
VM_API_URL=       # e.g. http://localhost:8000
VM_API_KEY=

# GWDG LLM
GWDG_API_KEY=
GWDG_BASE_URL=
GWDG_MODEL=meta-llama-3.1-8b-rag
GWDG_ARCANA_ID=

# Misc
BLOB_READ_WRITE_TOKEN=
```

A cloud setup (Azure/AWS) can replace Whisper, Piper, and LLM → reducing variables.

---

## 🧪 **Local Development Setup**

### **1️⃣ Start the Python Server**

```bash
python3.10 -m venv .venv
source .venv/bin/activate    # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python PythonServer/api/server.py
```

### **2️⃣ Start the SvelteKit App**

```bash
npm install
npm run dev -- --open
```

Frontend runs at `http://localhost:5173/`, communicating with `VM_API_URL`.

---

## 🌐 **Deployment**

### **SvelteKit → Vercel**

* Import repo
* Select “SvelteKit”
* Add environment variables

### **PythonServer → Ubuntu VM**

* Install dependencies
* Run via Gunicorn
* Reverse proxy via Nginx (HTTPS recommended)

---

## ✨ **Key Features**

* Real-time 3D avatar with **viseme-based lip-sync**
* **Avatar vs. text interface** (between-subjects user study)
* RAG-powered answers via GWDG
* Full evaluation pipeline:

  * Task performance
  * GAAIS
  * NASA-TLX
  * Variant ratings
  * Final questionnaire
* Built-in results visualization (`/Results`)

---

## ⚠️ **Limitations**

* Higher latency on the university VM (especially STT/TTS).
* Prototype-level error handling and stability.
* Best with Chromium browsers.
* Not intended for personal data.

---

## 📜 **Licensing**

* **npm licenses:**
  `npx license-checker --json --out static/licenses/npm-licenses.json`
* **Python licenses:**
  `pip-licenses --format=json --output-file=pip-licenses.json`

Avatar models and graphics are included **for research purposes only** and may require separate licensing for other use cases.

---