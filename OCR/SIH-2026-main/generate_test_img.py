import cv2
import numpy as np

# Create a clear image with text for testing OCR
img = np.ones((300, 800, 3), dtype=np.uint8) * 255

# Add title and text
font = cv2.FONT_HERSHEY_SIMPLEX
cv2.putText(img, "PaddleOCR Functional Test", (50, 80), font, 1.2, (0, 0, 0), 3, cv2.LINE_AA)
cv2.putText(img, "Smart India Hackathon 2026", (50, 150), font, 1.0, (180, 50, 0), 2, cv2.LINE_AA)
cv2.putText(img, "Status: SUCCESS - OCR Engine Ready", (50, 220), font, 0.9, (0, 150, 0), 2, cv2.LINE_AA)

cv2.imwrite(r"c:\Users\USER\OneDrive\Desktop\SIH 2026\test_images\test_sample.png", img)
print("Sample test image generated at test_images/test_sample.png")
