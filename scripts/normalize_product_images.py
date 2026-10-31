from __future__ import annotations
from pathlib import Path
from PIL import Image, ImageOps
import numpy as np
import cv2

ROOT = Path(__file__).resolve().parents[1]
PRODUCTS_DIR = ROOT / 'public' / 'products'
OUT_SIZE = 700
FIT_SIZE = 620


def normalize_image(path: Path) -> None:
    arr = np.array(Image.open(path).convert('RGB'))
    hsv = cv2.cvtColor(arr, cv2.COLOR_RGB2HSV)
    mean = arr.mean(axis=2)
    std = arr.std(axis=2)
    sat = hsv[:, :, 1]

    # Build a foreground mask that removes the very light catalogue background
    mask = ((mean < 240) | (std > 8) | (sat > 20)).astype(np.uint8) * 255

    # Remove thin decorative bars that sit flush against the top edge in many crops
    row_density = (mask > 0).mean(axis=1)
    top_run = 0
    for density in row_density[:25]:
        if density > 0.40:
            top_run += 1
        else:
            break
    if 0 < top_run <= 20:
        mask[: top_run + 2] = 0

    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))

    num, labels, stats, _ = cv2.connectedComponentsWithStats(mask, 8)
    components: list[tuple[int, int, int, int, int, int]] = []
    H, W = mask.shape
    min_area = max(30, int(0.0008 * H * W))

    for i in range(1, num):
        x, y, w, h, area = stats[i]
        if area < min_area:
            continue
        # Ignore bottom text fragments
        if y > 0.76 * H and h < 0.10 * H:
            continue
        # Ignore thin header bars
        if y < 14 and h < 18 and w > 0.45 * W:
            continue
        components.append((area, x, y, w, h, i))

    keep = np.zeros_like(mask)
    if components:
        components.sort(reverse=True)
        largest = components[0][0]
        for area, x, y, w, h, i in components:
            if area < 0.12 * largest and len(components) > 1:
                continue
            keep[labels == i] = 255
    else:
        keep = mask

    keep = cv2.dilate(keep, np.ones((3, 3), np.uint8), iterations=1)
    ys, xs = np.where(keep > 0)
    if len(xs) == 0:
        x1, y1, x2, y2 = 0, 0, W, H
    else:
        x1, y1, x2, y2 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1

    pad = max(10, int(0.06 * max(x2 - x1, y2 - y1)))
    x1 = max(0, x1 - pad)
    y1 = max(0, y1 - pad)
    x2 = min(W, x2 + pad)
    y2 = min(H, y2 + pad)

    isolated = np.where(keep[..., None] > 0, arr, 255)
    crop = isolated[y1:y2, x1:x2].copy()

    # Push nearly-white pixels fully to white for a cleaner e-commerce look
    bright = crop.mean(axis=2) > 235
    crop[bright] = 255

    cleaned = Image.fromarray(crop.astype('uint8'))
    canvas = Image.new('RGB', (OUT_SIZE, OUT_SIZE), 'white')
    fitted = ImageOps.contain(cleaned, (FIT_SIZE, FIT_SIZE), method=Image.Resampling.LANCZOS)
    canvas.paste(fitted, ((OUT_SIZE - fitted.width) // 2, (OUT_SIZE - fitted.height) // 2))
    canvas.save(path, 'WEBP', quality=92, method=6)


def main() -> None:
    files = sorted(PRODUCTS_DIR.glob('*.webp'))
    for f in files:
        normalize_image(f)
    print(f'Normalized {len(files)} product image assets in {PRODUCTS_DIR}')


if __name__ == '__main__':
    main()
