import os
import glob
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Body, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import torch
from diffusers import (
    StableDiffusionPipeline, 
    StableDiffusionImg2ImgPipeline,
    StableVideoDiffusionPipeline
)
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
from safetensors.torch import load_file
from PIL import Image
import io
import base64
import numpy as np
import cv2
import tempfile
import uuid

app = FastAPI()

# CORS
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "outputs")

# Ensure dirs exist
if not os.path.exists(MODELS_DIR):
    os.makedirs(MODELS_DIR)
if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

class ModelManager:
    def __init__(self):
        self.image_pipeline = None
        self.img2img_pipeline = None
        self.video_pipeline = None
        self.chat_pipeline = None
        
        self.current_image_model_name = None
        self.current_chat_model_name = None

    def list_models(self):
        # Look for Safetensors
        files = glob.glob(os.path.join(MODELS_DIR, "*.safetensors"))
        return [os.path.basename(f) for f in files]

    def load_image_model(self, model_name: str):
        path = os.path.join(MODELS_DIR, model_name)
        if not os.path.exists(path):
            raise HTTPException(status_code=404, detail="Model file not found")
        
        try:
            # Determine if it's likely a video model based on name (Super simplistic heuristic)
            if "svd" in model_name.lower() or "video" in model_name.lower():
                 print(f"Loading {model_name} as Video Model specific pipeline...")
                 self.video_pipeline = StableVideoDiffusionPipeline.from_single_file(
                    path, 
                    torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
                    use_safetensors=True
                 )
                 if torch.cuda.is_available():
                    self.video_pipeline.to("cuda")
                 elif torch.backends.mps.is_available():
                    self.video_pipeline.to("mps")
                 
                 return {"status": "success", "message": f"Loaded generic video model {model_name}"}

            # Otherwise load as Standard SD
            print(f"Loading {model_name} as Text2Img/Img2Img Model...")
            self.image_pipeline = StableDiffusionPipeline.from_single_file(
                path, 
                torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
                use_safetensors=True
            )
            
            if torch.cuda.is_available():
                self.image_pipeline.to("cuda")
            elif torch.backends.mps.is_available():
                self.image_pipeline.to("mps")

            # Create img2img pipeline from components to save memory
            self.img2img_pipeline = StableDiffusionImg2ImgPipeline(
                **self.image_pipeline.components
            )
            
            self.current_image_model_name = model_name
            return {"status": "success", "message": f"Loaded image/img2img model {model_name}"}
        except Exception as e:
            print(f"Error loading model: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    def load_chat_model(self, model_name: str):
        path = os.path.join(MODELS_DIR, model_name)
        if not os.path.exists(path):
             raise HTTPException(status_code=404, detail="Model file not found")

        try:
            tokenizer = AutoTokenizer.from_pretrained("gpt2") 
            model = AutoModelForCausalLM.from_pretrained(path, local_files_only=True) 
            self.chat_pipeline = pipeline("text-generation", model=model, tokenizer=tokenizer)
            self.current_chat_model_name = model_name
            return {"status": "success", "message": f"Loaded chat model {model_name}"}
        except Exception as e:
             raise HTTPException(status_code=500, detail=f"Failed to load as chat model: {e}")

model_manager = ModelManager()

class ChatRequest(BaseModel):
    prompt: str
    max_length: int = 100

class ImageRequest(BaseModel):
    prompt: str
    negative_prompt: Optional[str] = ""
    steps: int = 20

@app.get("/models")
def list_models():
    return {"models": model_manager.list_models()}

@app.post("/load/image")
def load_image_model(model: dict = Body(...)):
    name = model.get("name")
    return model_manager.load_image_model(name)

@app.post("/chat")
def chat(request: ChatRequest):
    if not model_manager.chat_pipeline:
        return {"response": f"Echo (No model loaded): {request.prompt}"}
    
    res = model_manager.chat_pipeline(request.prompt, max_length=request.max_length)
    return {"response": res[0]['generated_text']}

@app.post("/generate/text2img")
def generate_image(request: ImageRequest):
    if not model_manager.image_pipeline:
        # Mock Response
        # Generate a dummy image for demo purposes if no model is present/loaded
        img = Image.new('RGB', (512, 512), color = (73, 109, 137))
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        return {"image": f"data:image/png;base64,{img_str}", "status": "mocked"}

    image = model_manager.image_pipeline(
        prompt=request.prompt, 
        negative_prompt=request.negative_prompt, 
        num_inference_steps=request.steps
    ).images[0]
    
    buffered = io.BytesIO()
    image.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    return {"image": f"data:image/png;base64,{img_str}"}

@app.post("/generate/img2img")
async def generate_img2img(
    prompt: str = Form(...),
    negative_prompt: str = Form(""),
    steps: int = Form(20),
    strength: float = Form(0.75),
    image: UploadFile = File(...)
):
    if not model_manager.img2img_pipeline:
        # Generate a mock response image
        img = Image.new('RGB', (512, 512), color = (100, 50, 150))
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        return {"image": f"data:image/png;base64,{img_str}", "status": "mocked (no model)"}

    # Read uploaded image
    contents = await image.read()
    init_image = Image.open(io.BytesIO(contents)).convert("RGB")
    init_image = init_image.resize((512, 512))

    gen_image = model_manager.img2img_pipeline(
        prompt=prompt,
        negative_prompt=negative_prompt,
        image=init_image,
        strength=strength,
        num_inference_steps=steps
    ).images[0]

    buffered = io.BytesIO()
    gen_image.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    return {"image": f"data:image/png;base64,{img_str}"}

@app.post("/generate/video")
async def generate_video(
    image: UploadFile = File(...),
    prompt: Optional[str] = Form(None),
    fps: int = Form(7),
    motion_bucket_id: int = Form(127)
):
    """
    Image-to-Video generation. 
    Standard SVD does not use text prompts, but we accept it for future compatibility
    or alternate pipelines.
    """
    if not model_manager.video_pipeline:
         # Raising error so UI knows
         raise HTTPException(status_code=400, detail="No Video Model Loaded. Please load an SVD .safetensors file first.")

    contents = await image.read()
    init_image = Image.open(io.BytesIO(contents)).convert("RGB")
    init_image = init_image.resize((1024, 576)) # SVD resolution

    # Handle pipeline arguments dynamically
    kwargs = {
        "image": init_image,
        "decode_chunk_size": 8,
        "motion_bucket_id": motion_bucket_id,
        "fps": fps
    }
    
    # Check if pipeline accepts a prompt (SVD doesn't, but others might)
    try:
        allowed_args = set(model_manager.video_pipeline.forward.__code__.co_varnames)
        if "prompt" in allowed_args and prompt: 
            kwargs["prompt"] = prompt
            print(f"Passing prompt to video pipeline: {prompt}")
    except Exception:
        pass # Fallback

    frames = model_manager.video_pipeline(**kwargs).frames[0]

    # Save frames as mp4
    filename = f"{uuid.uuid4()}.mp4"
    output_path = os.path.join(OUTPUT_DIR, filename)
    
    # Use OpenCV to save video
    height, width, layers = np.array(frames[0]).shape
    fourcc = cv2.VideoWriter_fourcc(*'mp4v') 
    video = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    for frame in frames:
        # PIL to OpenCv (RGB to BGR)
        cv_frame = cv2.cvtColor(np.array(frame), cv2.COLOR_RGB2BGR)
        video.write(cv_frame)

    cv2.destroyAllWindows()
    # release() is important
    video.release()

    return {"video_url": f"/outputs/{filename}"}

# Serve static output files
app.mount("/outputs", StaticFiles(directory=OUTPUT_DIR), name="outputs")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
