"""
PaddleOCR Web Server
====================
Flask application that serves a web UI for OCR processing.
Upload images via the UI or POST to /ocr to extract text.
"""

import base64
import io
import os
import sys
import tempfile
import time
import traceback

import cv2
import numpy as np
from flask import Flask, jsonify, render_template, request
from PIL import Image

# ---------------------------------------------------------------------------
# Add the PaddleOCR source directory to sys.path
# ---------------------------------------------------------------------------
PADDLEOCR_SRC = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "PaddleOCR-main",
    "PaddleOCR-main",
)
if os.path.isdir(PADDLEOCR_SRC) and PADDLEOCR_SRC not in sys.path:
    sys.path.insert(0, PADDLEOCR_SRC)

# ---------------------------------------------------------------------------
# Flask app
# ---------------------------------------------------------------------------
app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 20 * 1024 * 1024  # 20 MB upload limit

# ---------------------------------------------------------------------------
# Lazy-loaded OCR engines (cached per language)
# ---------------------------------------------------------------------------
_ocr_engines: dict = {}


def get_ocr_engine(lang: str = "en"):
    """Return a cached PaddleOCR engine for the given language."""
    if lang not in _ocr_engines:
        print(f"[OCR] Initializing PaddleOCR (PP-OCRv4) engine for lang='{lang}' ...")
        from paddleocr import PaddleOCR

        # PP-OCRv4 is rock-solid on CPU and highly accurate
        engine = PaddleOCR(
            lang=lang,
            ocr_version="PP-OCRv4",
            use_doc_orientation_classify=False,
            use_doc_unwarping=False,
        )
        _ocr_engines[lang] = engine
        print(f"[OCR] Engine for lang='{lang}' ready.")
    return _ocr_engines[lang]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def draw_bounding_boxes(image_np: np.ndarray, results: list) -> np.ndarray:
    """Draw bounding boxes and text labels on the image."""
    annotated = image_np.copy()

    for item in results:
        box = item["box"]
        text = item["text"]
        conf = item["confidence"]

        # Convert box points to integer numpy array
        pts = np.array(box, dtype=np.int32)

        # Color based on confidence
        if conf >= 0.9:
            color = (0, 200, 120)      # Bright Green
        elif conf >= 0.7:
            color = (0, 200, 255)      # Cyan/Yellow
        else:
            color = (0, 100, 255)      # Red-orange

        # Draw polygon
        cv2.polylines(annotated, [pts], isClosed=True, color=color, thickness=2)

        # Draw text label overlay above polygon
        if len(pts) > 0:
            x, y = int(pts[0][0]), int(pts[0][1])
            label = f"{text[:20]}{'...' if len(text) > 20 else ''} ({conf:.0%})"
            (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.45, 1)
            cv2.rectangle(annotated, (x, max(0, y - th - 8)), (x + tw + 6, max(th + 8, y)), color, -1)
            cv2.putText(
                annotated, label, (x + 3, max(th + 3, y - 4)),
                cv2.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 1, cv2.LINE_AA,
            )

    return annotated


def image_to_base64(image_np: np.ndarray) -> str:
    """Encode a BGR numpy image to base64 PNG string."""
    rgb = cv2.cvtColor(image_np, cv2.COLOR_BGR2RGB)
    pil_img = Image.fromarray(rgb)
    buf = io.BytesIO()
    pil_img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode("utf-8")


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/ocr", methods=["POST"])
def ocr_endpoint():
    """Accept an image upload and return OCR results as JSON."""
    if "image" not in request.files:
        return jsonify({"error": "No image file uploaded."}), 400

    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "Empty filename."}), 400

    lang = request.form.get("lang", "en")

    # Save uploaded file to a temp path
    suffix = os.path.splitext(file.filename)[1] or ".png"
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    try:
        file.save(tmp.name)
        tmp.close()

        # Load image with OpenCV
        image_np = cv2.imread(tmp.name)
        if image_np is None:
            return jsonify({"error": "Could not decode image. Please upload a valid image file."}), 400

        # Run OCR
        t0 = time.perf_counter()
        engine = get_ocr_engine(lang)
        raw_results = engine.predict(tmp.name)
        elapsed = time.perf_counter() - t0

        parsed = []
        if raw_results:
            res = raw_results[0]
            d = res if isinstance(res, dict) else res.to_dict() if hasattr(res, 'to_dict') else {}

            texts = d.get("rec_texts") or d.get("rec_text") or []
            scores = d.get("rec_scores") or d.get("rec_score") or []
            boxes = d.get("dt_polys") or d.get("dt_poly") or d.get("rec_polys") or []

            for i in range(min(len(texts), len(scores))):
                text = str(texts[i]).strip()
                if not text:
                    continue
                score = float(scores[i])
                box = boxes[i].tolist() if i < len(boxes) and hasattr(boxes[i], 'tolist') else []
                parsed.append({
                    "text": text,
                    "confidence": round(score, 4),
                    "box": box,
                })

        # Draw bounding boxes
        annotated_b64 = ""
        if parsed:
            annotated_img = draw_bounding_boxes(image_np, parsed)
            annotated_b64 = image_to_base64(annotated_img)

        return jsonify({
            "results": parsed,
            "annotated_image": annotated_b64,
            "processing_time": round(elapsed, 3),
            "language": lang,
            "total_lines": len(parsed),
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    finally:
        try:
            os.unlink(tmp.name)
        except OSError:
            pass


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    print("=" * 60)
    print("  PaddleOCR Web UI Server starting...")
    print("  Open http://localhost:5000 in your browser")
    print("=" * 60)
    app.run(host="0.0.0.0", port=5000, debug=False)
