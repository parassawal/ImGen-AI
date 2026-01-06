# 🎨 ImGen AI

**ImGen AI** is a powerful, local web application designed to unleash your creativity using state-of-the-art AI models. It provides a unified interface for generating images, videos, and engaging in chat conversations using locally running `.safetensors` models.

Built with a modern stack featuring **FastAPI** for high-performance inference and **React (Vite)** for a responsive user experience.

---

## ✨ Features

-   **🖼️ Text-to-Image Generation**: Create stunning visuals from text prompts using Stable Diffusion models.
-   **🎨 Image-to-Image Transformation**: Modify and style existing images with adjustable strength and steps.
-   **🎥 Text-to-Video Creation**: Generate short video clips using Stable Video Diffusion (SVD).
-   **💬 Local Chat**: Chat with LLMs (Large Language Models) running entirely offline.
-   **🔌 Dynamic Model Loading**: Hot-swap models without restarting the server. Automatically detects and loads `.safetensors` files.
-   **🚀 Hardware Acceleration**: Supports CUDA (NVIDIA) and MPS (Apple Silicon/Mac) for fast inference.

## 🛠️ Tech Stack

### Backend
-   **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
-   **ML/AI**: [Diffusers](https://huggingface.co/docs/diffusers), [Transformers](https://huggingface.co/docs/transformers), [PyTorch](https://pytorch.org/)
-   **Image Processing**: OpenCV, Pillow

### Frontend
-   **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **HTTP Client**: Axios

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
-   **Node.js** (v18 or higher)
-   **Python** (3.10 or higher)
-   **Git**

> [!NOTE]
> A GPU with at least 8GB VRAM is recommended for smooth image/video generation. Apple Silicon (M1/M2/M3) users are supported via MPS.

---

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
https://github.com/parassawal/ImGen-AI.git
cd imgen
```

### 2. Backend Setup
Set up the Python environment and install dependencies.
```bash
# Create a virtual environment
python3 -m venv venv

# Activate the virtual environment
# On Mac/Linux:
source venv/bin/activate
# On Windows:
# .\venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt
```

### 3. Frontend Setup
Install the necessary Node.js packages.
```bash
cd frontend
npm install
cd ..
```

### 4. 📥 Download Models
ImGen AI requires model weights (`.safetensors` format) to function. You **must** download these manually and place them in the `backend/models/` directory.

**Recommended Models:**
-   **Images**: [Stable Diffusion v1.5](https://huggingface.co/runwayml/stable-diffusion-v1-5) or [SDXL](https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0)
-   **Video**: [Stable Video Diffusion (SVD)](https://huggingface.co/stabilityai/stable-video-diffusion-img2vid-xt)
-   **Chat**: Llama 3, Mistral, or other compatible Safetensors LLMs.

**Directory Structure:**
```
imgen/
├── backend/
│   └── models/
│       ├── stable-diffusion-v1-5.safetensors
│       ├── svd-xt.safetensors
│       └── ...
```

---

## ▶️ How to Run

### Option 1: One-Click Script (Mac/Linux)
We provide a helper script to start both services simultaneously.
```bash
./start.sh
```

### Option 2: Manual Start
If you prefer running services separately for debugging:

**Terminal 1: Backend**
```bash
source venv/bin/activate
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2: Frontend**
```bash
cd frontend
npm run dev
```

The application will be available at **[http://localhost:5173](http://localhost:5173)**.

---

## 📖 Usage Guide

1.  **Load a Model**: Use the navigation or settings to select a model from your `models` folder. The system will detect if it's an Image, Video, or Chat model.
2.  **Generate**:
    -   **Text2Img**: Enter a positive prompt (what you want) and a negative prompt (what you don't want).
    -   **Img2Img**: Upload a base image and describe changes.
    -   **Video**: Upload an image to animate it.
3.  **Outputs**: All generated files are saved in `backend/outputs/` and displayed in the UI.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

