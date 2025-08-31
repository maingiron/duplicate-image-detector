from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Dict, Any
from PIL import Image
import imagehash
import os
from collections import defaultdict
import urllib.parse

app = FastAPI(title="Duplicate Image Detector API")

# Allow Vite dev server and same-origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ScanRequest(BaseModel):
    directory: str
    tolerance: int = 15
    resize_width: int = 256
    resize_height: int = 256


class MoveRequest(BaseModel):
    base_directory: str
    paths: List[str]


def is_supported_image(filename: str) -> bool:
    lower = filename.lower()
    return lower.endswith((".png", ".jpg", ".jpeg", ".bmp", ".gif", ".webp"))


def build_image_url(path: str) -> str:
    encoded = urllib.parse.quote(path)
    return f"/image?path={encoded}"


@app.post("/scan")
def scan_images(req: ScanRequest) -> Dict[str, Any]:
    directory = req.directory
    if not os.path.isdir(directory):
        raise HTTPException(status_code=400, detail="Directory does not exist")

    resize_dim = (req.resize_width, req.resize_height)
    image_hashes: Dict[imagehash.ImageHash, List[str]] = defaultdict(list)

    for root, _, files in os.walk(directory):
        for file in files:
            if not is_supported_image(file):
                continue
            filepath = os.path.join(root, file)
            try:
                image = Image.open(filepath)
                image = image.resize(resize_dim)
                h = imagehash.phash(image)

                # Try to match an existing hash within tolerance
                matched = None
                for existing_hash in list(image_hashes.keys()):
                    if abs(h - existing_hash) <= req.tolerance:
                        matched = existing_hash
                        break

                if matched is None:
                    image_hashes[h].append(filepath)
                else:
                    image_hashes[matched].append(filepath)
            except Exception as e:
                # Skip unreadable images
                print(f"Error processing {filepath}: {e}")
                continue

    # Build groups (only groups with more than one image)
    groups: List[Dict[str, Any]] = []
    for paths in image_hashes.values():
        if len(paths) <= 1:
            continue
        images = []
        for p in paths:
            try:
                with Image.open(p) as im:
                    width, height = im.size
                size = os.path.getsize(p)
            except Exception:
                width, height, size = 0, 0, 0
            images.append({
                "path": os.path.basename(p),
                "originalPath": p,
                "width": width,
                "height": height,
                "size": size,
                "url": build_image_url(p),
            })
        groups.append({"images": images})

    return {
        "baseDirectory": directory,
        "groups": groups,
        "tolerance": req.tolerance,
        "count": len(groups),
    }


@app.get("/image")
def get_image(path: str = Query(..., description="Absolute file path to image")):
    # Basic safety: ensure path exists and is a file
    if not os.path.isfile(path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path)


@app.post("/move")
def move_images(body: MoveRequest) -> Dict[str, Any]:
    base_dir = body.base_directory
    if not os.path.isdir(base_dir):
        raise HTTPException(status_code=400, detail="Base directory does not exist")

    target_dir = os.path.join(base_dir, "marked_for_deletion")
    os.makedirs(target_dir, exist_ok=True)

    moved: List[Dict[str, str]] = []
    errors: List[Dict[str, str]] = []

    for src in body.paths:
        try:
            if not os.path.isfile(src):
                errors.append({"path": src, "error": "Not a file"})
                continue
            filename = os.path.basename(src)
            dst = os.path.join(target_dir, filename)

            # Avoid overwrite by adding suffix
            base_name, ext = os.path.splitext(filename)
            counter = 1
            while os.path.exists(dst):
                dst = os.path.join(target_dir, f"{base_name}_{counter}{ext}")
                counter += 1

            os.replace(src, dst)
            moved.append({"from": src, "to": dst})
        except Exception as e:
            errors.append({"path": src, "error": str(e)})

    return {"moved": moved, "errors": errors} 