import os
import sys
import subprocess
import mimetypes
import urllib.parse
import json
import time
from typing import Dict, Any

from fastapi import FastAPI, UploadFile, File, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, Response, JSONResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI()
RESULTS_DIR = os.path.join(os.path.dirname(__file__), "../public/results")
RESULTS_DIR = os.path.abspath(RESULTS_DIR)
os.makedirs(RESULTS_DIR, exist_ok=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://*.appwrite.global",  # Appwrite Sites domains
        "https://*.appwrite.io",      # Alternative Appwrite domains
        "*"  # Allow all origins for now (can restrict later)
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Mount static files for direct access
app.mount("/static", StaticFiles(directory=RESULTS_DIR), name="static")


@app.post("/analyze/")
async def analyze_kolam(file: UploadFile = File(...), request: Request = None):
    image_path = os.path.join(RESULTS_DIR, file.filename)

    # Save uploaded file
    with open(image_path, "wb") as f:
        f.write(await file.read())

    # Run Kolam_Tester.py
    subprocess.run([sys.executable, "backend/Kolam_Tester.py", image_path, RESULTS_DIR], check=True)

    # Run main_eq_conv.py
    subprocess.run([sys.executable, "backend/main_eq_conv.py", image_path, RESULTS_DIR], check=True)

    base_name = os.path.splitext(os.path.basename(image_path))[0]
    host = str(request.base_url).rstrip("/") if request else "http://localhost:8000"

    return {
        "analysis_image_url": f"/download/{base_name}_analysis_visualization.png",
        "analysis_txt_url": f"/download/{base_name}_analysis.txt",
        "equations_txt_url": f"/download/{base_name}_equations.txt",
        "desmos_url": f"/download/{base_name}_output_eq.html",
    }


@app.get("/download/{filename}")
def download_file(filename: str):
    file_path = os.path.join(RESULTS_DIR, filename)
    print("Trying to serve:", file_path)
    if not os.path.exists(file_path):
        return Response("File not found", status_code=404)

    mime_type, _ = mimetypes.guess_type(file_path)
    
    # Add proper headers for file downloads
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "*",
        "Content-Disposition": f"attachment; filename={filename}",
        "Content-Type": mime_type or "application/octet-stream",
    }

    return FileResponse(
        path=file_path,
        media_type=mime_type or "application/octet-stream",
        filename=filename,
        headers=headers
    )


@app.get("/files/{filename}")
def serve_file(filename: str):
    """Serve files with proper CORS headers for frontend access"""
    file_path = os.path.join(RESULTS_DIR, filename)
    print("Serving file:", file_path)
    if not os.path.exists(file_path):
        return Response("File not found", status_code=404)

    mime_type, _ = mimetypes.guess_type(file_path)
    
    return FileResponse(
        path=file_path,
        media_type=mime_type or "application/octet-stream",
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        }
    )


@app.get("/kolam/patterns")
async def get_kolam_patterns():
    """Get available kolam pattern types and configurations."""
    patterns = {
        "types": [
            {"id": "square", "name": "Square Kolam", "description": "Geometric square-based patterns"},
            {"id": "diamond", "name": "Diamond Kolam", "description": "Diamond-shaped traditional patterns"},
            {"id": "star", "name": "Star Kolam", "description": "Radiating star patterns"},
            {"id": "traditional", "name": "Traditional Pulli", "description": "Classic pulli kolam with dots and curves"}
        ],
        "sizes": {"min": 3, "max": 9, "default": 5},
        "features": {
            "animation": True,
            "export": ["svg", "png"],
            "customization": ["colors", "stroke_width", "dots"]
        }
    }
    return JSONResponse(content=patterns)


@app.post("/kolam/generate")
async def generate_kolam_pattern(request: Dict[str, Any]):
    """Generate a kolam pattern based on parameters."""
    try:
        pattern_type = request.get("type", "traditional")
        size = request.get("size", 5)
        animated = request.get("animated", True)
        show_dots = request.get("showDots", True)
        
        # Validate inputs
        if pattern_type not in ["square", "diamond", "star", "traditional"]:
            raise HTTPException(status_code=400, detail="Invalid pattern type")
        
        if not isinstance(size, int) or size < 3 or size > 9:
            raise HTTPException(status_code=400, detail="Size must be between 3 and 9")
        
        # Generate pattern data (simplified for backend)
        pattern_data = {
            "id": f"kolam_{pattern_type}_{size}x{size}_{int(time.time())}",
            "name": f"{pattern_type.title()} Kolam {size}x{size}",
            "type": pattern_type,
            "size": size,
            "animated": animated,
            "showDots": show_dots,
            "dimensions": {
                "width": size * 60,
                "height": size * 60
            },
            "grid": {
                "size": size,
                "cellSpacing": 60
            },
            "generated_at": time.time(),
            "status": "generated"
        }
        
        return JSONResponse(content=pattern_data)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate kolam: {str(e)}")


@app.get("/kolam/export/{pattern_id}")
async def export_kolam_pattern(pattern_id: str, format: str = "svg"):
    """Export a generated kolam pattern."""
    try:
        if format not in ["svg", "png", "json"]:
            raise HTTPException(status_code=400, detail="Invalid export format")
        
        # For now, return a placeholder response
        # In a full implementation, this would generate and return the actual file
        export_data = {
            "pattern_id": pattern_id,
            "format": format,
            "download_url": f"/download/{pattern_id}.{format}",
            "status": "ready"
        }
        
        return JSONResponse(content=export_data)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to export kolam: {str(e)}")
