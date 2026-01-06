# ImGen AI

ImGen AI is a local web application for running AI models (Safetensors) to generate images, videos, and chat.

## Prerequisites

- [Node.js](https://nodejs.org/) (for the frontend)
- [Python 3.10+](https://www.python.org/) (for the backend)
- AI Models (.safetensors files)

## Setup

1.  **Install Backend Dependencies**
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    pip install -r backend/requirements.txt
    ```

2.  **Install Frontend Dependencies**
    ```bash
    cd frontend
    npm install
    cd ..
    ```

3.  **Add Models**
    - Place your `.safetensors` model files into the `backend/models/` directory.
    - Examples:
        - Stable Diffusion v1.5 / XL for images
        - Stable Video Diffusion (SVD) for video
        - LLMs (Llama, Mistral) for chat

## How to Run

### Option 1: One-Click Script (Mac/Linux)
Run the helper script in the root directory:
```bash
./start.sh
```

### Option 2: Manual (Two Terminals)

**Terminal 1 (Backend)**
```bash
source venv/bin/activate
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 (Frontend)**
```bash
cd frontend
npm run dev
```

## Usage
Open your browser to [http://localhost:5173](http://localhost:5173).
# ImGen-AI
# ImGen-AI
