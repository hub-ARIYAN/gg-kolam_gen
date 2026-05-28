import os
import sys
import subprocess
from subprocess import CalledProcessError
import mimetypes
import urllib.parse
import json
import time
import tempfile
from typing import Dict, Any, Optional

from fastapi import FastAPI, UploadFile, File, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, Response, JSONResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI()
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RESULTS_DIR = os.environ.get("RESULTS_DIR", os.path.join(BASE_DIR, "..", "public", "results"))
RESULTS_DIR = os.path.abspath(RESULTS_DIR)
os.makedirs(RESULTS_DIR, exist_ok=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for direct access
app.mount("/static", StaticFiles(directory=RESULTS_DIR), name="static")


@app.get("/")
async def health_check():
    """Health check endpoint for Render and monitoring."""
    return {
        "status": "healthy",
        "service": "Kolam Codex Math API",
        "version": "1.0.0",
        "endpoints": {
            "analyze": "/analyze/",
            "kolam_patterns": "/kolam/patterns",
            "kolam_generate": "/kolam/generate",
            "kolam_export": "/kolam/export/{pattern_id}"
        }
    }


@app.post("/analyze/")
async def analyze_kolam(file: UploadFile = File(...), request: Request = None):
    # Save uploaded file to RESULTS_DIR with a timestamp to avoid collisions
    original_name = os.path.basename(file.filename)
    name_root, ext = os.path.splitext(original_name)
    safe_root = name_root.replace(" ", "_")
    timestamp = int(time.time())
    saved_name = f"{safe_root}_{timestamp}{ext}"
    image_path = os.path.join(RESULTS_DIR, saved_name)

    with open(image_path, "wb") as f:
        f.write(await file.read())

    # Base name for result files and logs
    base_name = os.path.splitext(os.path.basename(image_path))[0]

    # Build absolute script paths
    kolam_tester = os.path.join(BASE_DIR, "Kolam_Tester.py")
    main_eq_conv = os.path.join(BASE_DIR, "main_eq_conv.py")

    # Helper to run a subprocess and capture output
    def run_script(script_path: str, args: list) -> Optional[Dict[str, str]]:
        try:
            res = subprocess.run([sys.executable, script_path] + args, capture_output=True, text=True, check=True)
            return {"stdout": res.stdout, "stderr": res.stderr}
        except CalledProcessError as e:
            return {"error": str(e), "stdout": getattr(e, 'stdout', ''), "stderr": getattr(e, 'stderr', '')}

    # Run Kolam_Tester
    tester_res = run_script(kolam_tester, [image_path, RESULTS_DIR])
    if tester_res is None or tester_res.get("error"):
        return JSONResponse(status_code=500, content={
            "status": "error",
            "step": "kolam_tester",
            "details": tester_res or {"error": "unknown error"}
        })

    # Save tester stdout/stderr for debugging
    try:
        with open(os.path.join(RESULTS_DIR, f"{base_name}_kolam_tester.log"), "w", encoding="utf-8") as lf:
            lf.write(tester_res.get("stdout", ""))
            lf.write("\n--- STDERR ---\n")
            lf.write(tester_res.get("stderr", ""))
    except Exception:
        pass

    # Run main_eq_conv
    conv_res = run_script(main_eq_conv, [image_path, RESULTS_DIR])
    if conv_res is None or conv_res.get("error"):
        return JSONResponse(status_code=500, content={
            "status": "error",
            "step": "main_eq_conv",
            "details": conv_res or {"error": "unknown error"}
        })

    # Save converter stdout/stderr for debugging
    try:
        with open(os.path.join(RESULTS_DIR, f"{base_name}_main_eq_conv.log"), "w", encoding="utf-8") as lf:
            lf.write(conv_res.get("stdout", ""))
            lf.write("\n--- STDERR ---\n")
            lf.write(conv_res.get("stderr", ""))
    except Exception:
        pass

    host = str(request.base_url).rstrip("/") if request else "http://localhost:8000"

    # Provide both filenames and download URLs for frontend compatibility
    filenames = {
        "analysis_image": f"{base_name}_analysis_visualization.png",
        "analysis_txt": f"{base_name}_analysis.txt",
        "equations_txt": f"{base_name}_equations.txt",
        "desmos_html": f"{base_name}_output_eq.html",
    }

    download_urls = {k: f"{host}/files/{v}" for k, v in filenames.items()}

    return JSONResponse(content={
        "status": "success",
        "filenames": filenames,
        "download_urls": download_urls
    })


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
