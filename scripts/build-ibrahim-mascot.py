"""
Generate a smooth (non-pixelated) mascot cutout of Dr Ibrahim:
transparent background, no coin frame, centered bust for the white badge.
Reuses the masking + color-grade pipeline from build-ibrahim-pixel-coin.py.
"""
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter
from scipy import ndimage

crop_im = Image.open("D:/Projects/MUS-Site/public/assets/dr-ibrahim-circle-crop.png").convert("RGBA")
nobg_im = Image.open("D:/Projects/MUS-Site/public/assets/dr-ibrahim-nobg.png").convert("RGBA")

crop_np = np.array(crop_im)
nobg_np = np.array(nobg_im)
H, W = nobg_np.shape[:2]

alpha = nobg_np[:, :, 3].astype(float) / 255.0
rgb = crop_np[:, :, :3].astype(float)
R0, G0, B0 = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
lum0 = 0.299 * R0 + 0.587 * G0 + 0.114 * B0
sat0 = np.maximum(np.maximum(R0, G0), B0) - np.minimum(np.minimum(R0, G0), B0)

yy, xx = np.mgrid[0:H, 0:W]

# Remove the office chair behind his shoulders/ears (same as coin pipeline)
chair_left = (xx < 64) & (yy > 152) & (yy < 194) & (sat0 < 18) & (lum0 < 92)
chair_right = (xx > 156) & (yy > 80) & (yy < 170) & (sat0 < 25) & (lum0 < 95)
c_dist = np.sqrt((xx - W / 2.0) ** 2 + (yy - H / 2.0) ** 2)
outside_circle = c_dist > (W * 0.485)
white_fringe = (alpha < 0.88) & (lum0 > 160) & (sat0 < 28) & (yy < 160)

clean_mask = (alpha > 0.52) & (~chair_left) & (~chair_right) & (~outside_circle) & (~white_fringe)
lab, n_comp = ndimage.label(clean_mask)
sizes = ndimage.sum(clean_mask, lab, range(1, n_comp + 1))
clean_mask = lab == (np.argmax(sizes) + 1)
clean_mask = ndimage.binary_closing(clean_mask, structure=np.ones((3, 3)))
clean_mask = ndimage.binary_fill_holes(clean_mask)

eroded_upper = ndimage.binary_erosion(clean_mask, structure=np.ones((3, 3)))
clean_mask = np.where(yy < 155, eroded_upper, clean_mask)

# Color-grade (same vibrancy pass as the coin, kept smooth)
graded = rgb.copy()

is_warm_skin = clean_mask & ((R0 - B0) > 18) & (R0 > 85) & (yy < 298)
is_scrubs_or_mic = clean_mask & (~is_warm_skin) & (yy >= 165)
is_hair = clean_mask & (~is_warm_skin) & (yy < 165)

for c_idx, add in [(0, 10), (1, 5), (2, -3)]:
    ch = graded[:, :, c_idx]
    graded[:, :, c_idx] = np.where(is_warm_skin, np.clip((ch - 140) * 1.18 + 148 + add, 0, 255), ch)

is_mic_box_hi = (yy >= 214) & (xx >= 32) & (xx <= 116)
is_scrub_cloth = is_scrubs_or_mic & (~is_mic_box_hi)
graded[:, :, 0] = np.where(is_scrub_cloth, np.clip(R0 * 0.72 + 8, 12, 95), graded[:, :, 0])
graded[:, :, 1] = np.where(is_scrub_cloth, np.clip(G0 * 0.86 + 16, 18, 118), graded[:, :, 1])
graded[:, :, 2] = np.where(is_scrub_cloth, np.clip(B0 * 1.28 + 38, 36, 172), graded[:, :, 2])

graded[:, :, 0] = np.where(is_hair, np.clip((R0 - 42) * 1.28 + 58, 18, 155), graded[:, :, 0])
graded[:, :, 1] = np.where(is_hair, np.clip((G0 - 38) * 1.15 + 40, 14, 112), graded[:, :, 1])
graded[:, :, 2] = np.where(is_hair, np.clip((B0 - 38) * 1.02 + 32, 14, 92), graded[:, :, 2])

pil_graded = Image.fromarray(graded.astype(np.uint8))
pil_graded = pil_graded.filter(ImageFilter.MedianFilter(size=3))
pil_graded = ImageEnhance.Contrast(pil_graded).enhance(1.12)
pil_graded = ImageEnhance.Sharpness(pil_graded).enhance(1.4)
graded_np = np.array(pil_graded).astype(float)

# Feathered alpha from the clean mask
alpha_f = ndimage.gaussian_filter(clean_mask.astype(float), sigma=1.6)
alpha_u8 = np.clip(alpha_f * 255, 0, 255).astype(np.uint8)

# Crop to the character bounding box with padding
ys, xs = np.where(alpha_u8 > 12)
pad = 10
y0, y1 = max(0, ys.min() - pad), min(H, ys.max() + pad + 1)
x0, x1 = max(0, xs.min() - pad), min(W, xs.max() + pad + 1)

cut = np.zeros((y1 - y0, x1 - x0, 4), dtype=np.uint8)
cut[:, :, :3] = graded_np[y0:y1, x0:x1].astype(np.uint8)
cut[:, :, 3] = alpha_u8[y0:y1, x0:x1]

# Center the bust on a square 512 canvas with headroom at top for the arc text
OUT = 512
canvas = Image.new("RGBA", (OUT, OUT), (0, 0, 0, 0))
cut_im = Image.fromarray(cut)
# scale so the cutout height fills ~78% of the canvas (bust + mic)
scale = min((OUT * 0.82) / cut_im.height, (OUT * 0.92) / cut_im.width)
new_w = max(1, int(cut_im.width * scale))
new_h = max(1, int(cut_im.height * scale))
cut_im = cut_im.resize((new_w, new_h), Image.LANCZOS)
# slight sharpening after upscale for "more appearing" clarity
cut_im = cut_im.filter(ImageFilter.UnsharpMask(radius=2, percent=60, threshold=2))
px = (OUT - new_w) // 2
py = int(OUT * 0.90) - new_h  # bottom-anchored so shoulders/mic sit near the base
canvas.paste(cut_im, (px, py), cut_im)

canvas.save("D:/Projects/MUS-Site/public/assets/dr-ibrahim-mascot.png")
print("Saved dr-ibrahim-mascot.png", canvas.size)
