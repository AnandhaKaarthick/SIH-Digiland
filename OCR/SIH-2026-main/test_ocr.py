import sys
import os

print("[TEST] Testing PaddleOCR with PP-OCRv4...")
from paddleocr import PaddleOCR

ocr = PaddleOCR(ocr_version="PP-OCRv4", use_doc_orientation_classify=False, use_doc_unwarping=False)

img_path = r"c:\Users\USER\OneDrive\Desktop\SIH 2026\test_images\test_sample.png"
print(f"[TEST] Running inference on {img_path}...")
results = ocr.predict(img_path)

print("[TEST] Raw results type:", type(results))
print("[TEST] Length of results:", len(results))

if results:
    res = results[0]
    print("[TEST] Result content:", res)
    if hasattr(res, 'to_dict'):
        d = res.to_dict()
        print("[TEST] Keys:", list(d.keys()))
        print("[TEST] Texts:", d.get('rec_texts') or d.get('rec_text'))
        print("[TEST] Scores:", d.get('rec_scores') or d.get('rec_score'))
