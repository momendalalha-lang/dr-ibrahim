"""
Generate a 16-bit arcade pixel-art coin avatar of Dr Ibrahim in the exact
visual style, shape, ring, and palette of `medicine-with-momen-avatar.png`.
Also generates a second talking-mouth frame (`dr-ibrahim-pixel-coin-talk.png`).
"""
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter
from scipy import ndimage

# 1. Load source cutout & reference crop (304x304)
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

# 2. Remove the office chair behind his shoulders/ears while keeping head, scrubs, hand & mic
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

# 3. Color-grade the high-res portrait for vibrant 16-bit arcade colors
graded = rgb.copy()

is_warm_skin = clean_mask & ((R0 - B0) > 18) & (R0 > 85) & (yy < 298)
is_scrubs_or_mic = clean_mask & (~is_warm_skin) & (yy >= 165)
is_hair = clean_mask & (~is_warm_skin) & (yy < 165)

# Warm & brighten skin
for c_idx, add in [(0, 10), (1, 5), (2, -3)]:
    ch = graded[:, :, c_idx]
    graded[:, :, c_idx] = np.where(is_warm_skin, np.clip((ch - 140) * 1.18 + 148 + add, 0, 255), ch)

# Tint dark charcoal scrubs toward rich arcade navy-slate (matching Mo'men's coat/scrubs)
is_mic_box_hi = (yy >= 214) & (xx >= 32) & (xx <= 116)
is_scrub_cloth = is_scrubs_or_mic & (~is_mic_box_hi)
graded[:, :, 0] = np.where(is_scrub_cloth, np.clip(R0 * 0.72 + 8, 12, 95), graded[:, :, 0])
graded[:, :, 1] = np.where(is_scrub_cloth, np.clip(G0 * 0.86 + 16, 18, 118), graded[:, :, 1])
graded[:, :, 2] = np.where(is_scrub_cloth, np.clip(B0 * 1.28 + 38, 36, 172), graded[:, :, 2])

# Rich warm dark brown for hair with enhanced crown highlights so right side isn't flat black
graded[:, :, 0] = np.where(is_hair, np.clip((R0 - 42) * 1.28 + 58, 18, 155), graded[:, :, 0])
graded[:, :, 1] = np.where(is_hair, np.clip((G0 - 38) * 1.15 + 40, 14, 112), graded[:, :, 1])
graded[:, :, 2] = np.where(is_hair, np.clip((B0 - 38) * 1.02 + 32, 14, 92), graded[:, :, 2])

bg_neutral = graded.copy()
for c in range(3):
    bg_neutral[:, :, c] = np.where(clean_mask, graded[:, :, c], 35)

pil_graded = Image.fromarray(bg_neutral.astype(np.uint8))
pil_graded = pil_graded.filter(ImageFilter.MedianFilter(size=3))
pil_graded = ImageEnhance.Contrast(pil_graded).enhance(1.18)
pil_graded = ImageEnhance.Sharpness(pil_graded).enhance(1.85)

# 4. Map onto a 92x92 pixel-art grid, shifting right by +8px so Dr Ibrahim is centered in the coin
GRID = 92
CX, CY = (GRID - 1) / 2.0, (GRID - 1) / 2.0

crop_box = (4, 8, W - 20, H - 2)
sub_img = pil_graded.crop(crop_box)
sub_msk = Image.fromarray((clean_mask * 255).astype(np.uint8)).crop(crop_box)

g_rgb = np.array(sub_img.resize((GRID, GRID), Image.BICUBIC)).astype(float)
g_mask = np.array(sub_msk.resize((GRID, GRID), Image.BILINEAR)) > 120

SHIFT_Y, SHIFT_X = 2, 8
g_rgb = np.roll(np.roll(g_rgb, SHIFT_Y, axis=0), SHIFT_X, axis=1)
g_mask = np.roll(np.roll(g_mask, SHIFT_Y, axis=0), SHIFT_X, axis=1)
g_mask[:SHIFT_Y, :] = False
g_mask[:, :SHIFT_X] = False

# 5. Curated 16-bit Pixel-Art Palette (without green in the general palette so mic never turns green!)
BASE_PALETTE = np.array([
    # Skin tones (warm arcade peach/tan ramp)
    [255, 238, 214],  # 0: brightest skin highlight
    [255, 219, 182],  # 1: light skin
    [247, 192, 146],  # 2: upper mid skin
    [234, 164, 118],  # 3: mid skin
    [212, 134,  92],  # 4: warm cheek / lower mid skin
    [182, 104,  68],  # 5: skin shadow
    [142,  76,  48],  # 6: deep skin shadow / crease
    [102,  52,  36],  # 7: dark beard / brow shadow

    # Lips / Mouth
    [228, 122, 118],  # 8: bright lip
    [190,  80,  84],  # 9: mid lip
    [132,  42,  50],  # 10: mouth interior / dark lip shadow
    [252, 246, 240],  # 11: teeth / sclera highlight

    # Hair & Beard (rich espresso / chestnut ramp)
    [ 18,  14,  26],  # 12: deepest hair/pupil black-brown
    [ 38,  26,  32],  # 13: dark espresso hair
    [ 66,  45,  38],  # 14: medium brown hair
    [ 98,  68,  52],  # 15: warm brown hair highlight
    [128,  92,  68],  # 16: light hair crown highlight

    # Scrubs (Navy-Slate Medical Scrubs)
    [ 14,  20,  36],  # 17: deepest scrub fold
    [ 24,  34,  58],  # 18: dark navy scrub shadow
    [ 36,  52,  86],  # 19: main navy-slate scrub
    [ 52,  72, 114],  # 20: scrub highlight fold
    [ 74,  98, 144],  # 21: bright shoulder rim

    # Microphone (Gunmetal + Silver Mesh)
    [ 38,  44,  60],  # 22: mic body dark
    [ 74,  84, 106],  # 23: mic mesh shadow
    [122, 134, 160],  # 24: mic mesh mid
    [176, 188, 212],  # 25: mic mesh bright silver
], dtype=float)

OUTLINE = np.array([7, 9, 24], dtype=np.uint8)  # #070918

char_px = np.zeros((GRID, GRID, 4), dtype=np.uint8)
bayer2 = np.array([[0, 2], [3, 1]], dtype=float) / 4.0 - 0.375

for y in range(GRID):
    for x in range(GRID):
        if not g_mask[y, x]:
            continue
        # Dedicated metallic checkerboard mesh dither on the podcast microphone capsule (y=67..82, x=21..37)
        if 67 <= y <= 82 and 20 <= x <= 37:
            r, g, b = g_rgb[y, x]
            l = 0.299 * r + 0.587 * g + 0.114 * b
            # If it's his pointing finger or thumb (warm skin tone), let normal skin palette handle it
            if (r - b) <= 22 or r < 125:
                dither = (x + y) % 2
                if l > 105:
                    char_px[y, x, :3] = BASE_PALETTE[25 if dither == 0 else 24].astype(np.uint8)
                elif l > 68:
                    char_px[y, x, :3] = BASE_PALETTE[24 if dither == 0 else 23].astype(np.uint8)
                elif l > 42:
                    char_px[y, x, :3] = BASE_PALETTE[22].astype(np.uint8)
                else:
                    char_px[y, x, :3] = OUTLINE
                char_px[y, x, 3] = 255
                continue

        pix = g_rgb[y, x] + bayer2[y % 2, x % 2] * 4.5
        diffs = BASE_PALETTE - pix[None, :]
        dist2 = 2.0 * (diffs[:, 0] ** 2) + 4.0 * (diffs[:, 1] ** 2) + 3.0 * (diffs[:, 2] ** 2)
        # Prevent navy scrub/mic colors (indices 17..25) from appearing on the head/jaw/beard/hand
        r_px, g_px, b_px = g_rgb[y, x]
        in_head_or_hand = (
            (y < 55 and 18 <= x <= 62)
            or (55 <= y < 68 and 29 <= x <= 57)
            or (y >= 66 and 36 <= x <= 60 and (r_px - b_px) > 12)
        )
        if in_head_or_hand:
            dist2[17:] = 1e9
        best = np.argmin(dist2)
        char_px[y, x, :3] = BASE_PALETTE[best].astype(np.uint8)
        char_px[y, x, 3] = 255

# 6. Hand-polished 16-bit Pixel Details: Expressive Eyes, Catchlights, Eyebrows & Smile
# Viewer's Left Eye (his right eye, centered around x=30, y=50)
EYE_DARK  = [18, 14, 26]
IRIS_DARK = [52, 98, 76]
IRIS_LITE = [98, 158, 122]
SCLERA    = [252, 246, 240]
BROW_DARK = [46, 30, 30]

# Crisp upper eyelash & iris for Viewer's Left Eye (y=49..51, x=28..33)
for x in range(27, 34):
    char_px[48, x, :3] = [66, 45, 38] if x in (27, 33) else BROW_DARK
for x in range(28, 34):
    char_px[49, x, :3] = BROW_DARK if x in (28, 33) else EYE_DARK
char_px[50, 28, :3] = SCLERA
char_px[50, 29, :3] = IRIS_DARK
char_px[50, 30, :3] = EYE_DARK      # pupil
char_px[50, 31, :3] = [255, 255, 255]  # crisp 1px specular catchlight!
char_px[50, 32, :3] = IRIS_LITE
char_px[50, 33, :3] = SCLERA
char_px[51, 29, :3] = SCLERA
char_px[51, 30, :3] = IRIS_LITE
char_px[51, 31, :3] = IRIS_DARK

# Crisp upper eyelash & iris for Viewer's Right Eye (y=46..48, x=43..49)
for x in range(42, 50):
    char_px[45, x, :3] = [66, 45, 38] if x in (42, 49) else BROW_DARK
for x in range(43, 49):
    char_px[46, x, :3] = BROW_DARK if x in (43, 48) else EYE_DARK
char_px[47, 43, :3] = SCLERA
char_px[47, 44, :3] = SCLERA
char_px[47, 45, :3] = EYE_DARK      # pupil
char_px[47, 46, :3] = [255, 255, 255]  # crisp 1px specular catchlight!
char_px[47, 47, :3] = IRIS_LITE
char_px[47, 48, :3] = SCLERA
char_px[48, 44, :3] = SCLERA
char_px[48, 45, :3] = IRIS_DARK
char_px[48, 46, :3] = IRIS_LITE
char_px[48, 47, :3] = SCLERA

# Crisp smile / teeth glint (y=62..64, x=38..44)
char_px[62, 38, :3] = [132, 42, 50]
char_px[62, 39, :3] = [252, 246, 240]
char_px[62, 40, :3] = [252, 246, 240]
char_px[62, 41, :3] = [252, 246, 240]
char_px[62, 42, :3] = [235, 215, 205]
char_px[62, 43, :3] = [132, 42, 50]
char_px[63, 39, :3] = [190, 80, 84]
char_px[63, 40, :3] = [132, 42, 50]
char_px[63, 41, :3] = [132, 42, 50]
char_px[63, 42, :3] = [190, 80, 84]

# 7. Add 1-pixel dark arcade outline around the character silhouette & pointing hand
dilated = ndimage.binary_dilation(g_mask, structure=np.array([[0,1,0],[1,1,1],[0,1,0]], dtype=bool))
outline_mask = dilated & (~g_mask)
for y in range(GRID):
    for x in range(GRID):
        if outline_mask[y, x]:
            char_px[y, x, :3] = OUTLINE
            char_px[y, x, 3] = 255

gy, gx = np.mgrid[0:GRID, 0:GRID]
R_g, G_g, B_g = g_rgb[:, :, 0], g_rgb[:, :, 1], g_rgb[:, :, 2]
lum_g = 0.299 * R_g + 0.587 * G_g + 0.114 * B_g
hand_region = g_mask & (gy >= 58) & (gx >= 28) & (gx <= 68) & ((R_g - B_g) > 18) & (R_g > 110)
hand_dil = ndimage.binary_dilation(hand_region, structure=np.array([[0,1,0],[1,1,1],[0,1,0]], dtype=bool))
hand_edge = hand_dil & (~hand_region) & g_mask & (gy >= 57) & (lum_g < 90)
for y in range(GRID):
    for x in range(GRID):
        if hand_edge[y, x]:
            char_px[y, x, :3] = OUTLINE

# 8. Build the Medicine-with-Mo'men Arcade Gold Coin Ring + Power Teal Sparkle Field
def render_coin(char_layer, out_path):
    canvas = np.zeros((GRID, GRID, 4), dtype=np.uint8)
    dist = np.sqrt((gx - CX) ** 2 + (gy - CY) ** 2)

    R_OUTER_BORDER = 44.6
    R_GOLD_OUTER   = 42.8
    R_GOLD_INNER   = 38.9
    R_INNER_BORDER = 37.3
    R_TEAL_RIM     = 35.6

    TEAL_MAIN = np.array([15, 163, 156], dtype=np.uint8)     # #0FA39C
    TEAL_RIM  = np.array([48, 240, 224], dtype=np.uint8)     # #30F0E0
    TEAL_DEEP = np.array([11, 132, 128], dtype=np.uint8)     # #0B8480

    GOLD_HI   = np.array([255, 243, 122], dtype=np.uint8)    # #FFF37A
    GOLD_MAIN = np.array([255, 201, 40], dtype=np.uint8)     # #FFC928
    GOLD_SHAD = np.array([224, 146, 0], dtype=np.uint8)      # #E09200

    # Draw interior teal circle
    for y in range(GRID):
        for x in range(GRID):
            d = dist[y, x]
            if d <= R_INNER_BORDER:
                if d > R_TEAL_RIM:
                    canvas[y, x] = [*TEAL_RIM, 255]
                elif y > 54 and (d > R_TEAL_RIM - 2.3):
                    canvas[y, x] = [*TEAL_DEEP, 255]
                else:
                    canvas[y, x] = [*TEAL_MAIN, 255]

    def draw_plus(cx, cy, radius, color):
        for dy in range(-radius, radius + 1):
            if 0 <= cy + dy < GRID and 0 <= cx < GRID:
                canvas[cy + dy, cx] = [*color, 255]
        for dx in range(-radius, radius + 1):
            if 0 <= cy < GRID and 0 <= cx + dx < GRID:
                canvas[cy, cx + dx] = [*color, 255]

    def draw_diamond_star(cx, cy):
        pts_white = [
            (0,0), (-1,0), (1,0), (0,-1), (0,1),
            (-2,0), (2,0), (0,-2), (0,2),
            (-1,-1), (1,-1), (-1,1), (1,1),
            (-3,0), (3,0), (0,-3), (0,3)
        ]
        for dx, dy in pts_white:
            if 0 <= cy + dy < GRID and 0 <= cx + dx < GRID:
                canvas[cy + dy, cx + dx] = [255, 255, 255, 255]

    # Left sparkles (positioned cleanly in the left teal space!)
    draw_diamond_star(15, 42)
    draw_plus(19, 31, 1, [255, 255, 255])
    draw_plus(13, 51, 1, [92, 247, 232])

    # Right sparkles (in the right teal space!)
    draw_diamond_star(74, 38)
    draw_plus(70, 28, 1, [255, 255, 255])
    draw_plus(67, 46, 1, [92, 247, 232])

    # Composite character inside the coin interior
    for y in range(GRID):
        for x in range(GRID):
            d = dist[y, x]
            in_bounds = (d <= R_INNER_BORDER + 0.4) or (y < 18 and d <= R_GOLD_INNER + 0.4)
            if in_bounds and char_layer[y, x, 3] > 0:
                canvas[y, x] = char_layer[y, x]

    # Draw the Gold Pixel Ring & Dark Outlines on top
    for y in range(GRID):
        for x in range(GRID):
            d = dist[y, x]
            hair_peek = (y < 14) and (char_layer[y, x, 3] > 0) and (d < R_GOLD_INNER)
            if hair_peek:
                continue

            if R_GOLD_OUTER < d <= R_OUTER_BORDER:
                canvas[y, x] = [*OUTLINE, 255]
            elif R_GOLD_INNER < d <= R_GOLD_OUTER:
                radial_pos = (d - R_GOLD_INNER) / (R_GOLD_OUTER - R_GOLD_INNER)
                if (y < 23 and radial_pos > 0.45) or (x < 23 and y < 58 and radial_pos > 0.55):
                    canvas[y, x] = [*GOLD_HI, 255]
                elif (y > 70 and radial_pos < 0.45) or (x > 69 and y > 48 and radial_pos < 0.45):
                    canvas[y, x] = [*GOLD_SHAD, 255]
                else:
                    canvas[y, x] = [*GOLD_MAIN, 255]
            elif R_INNER_BORDER < d <= R_GOLD_INNER:
                canvas[y, x] = [*OUTLINE, 255]

    SCALE = 14
    out_im = Image.fromarray(canvas).resize((GRID * SCALE, GRID * SCALE), Image.NEAREST)
    out_im.save(out_path)
    print("Saved", out_path, out_im.size)

# Frame 1: Standard expressive speaking smile
render_coin(char_px, "D:/Projects/MUS-Site/public/assets/dr-ibrahim-pixel-coin.png")

# Frame 2: Slightly wider open speaking mouth for hover/idle animation
char_talk = char_px.copy()
for x in range(39, 43):
    char_talk[63, x, :3] = [100, 24, 34]
    char_talk[64, x, :3] = [190, 80, 84]
    char_talk[65, x, :3] = [228, 122, 118]
render_coin(char_talk, "D:/Projects/MUS-Site/public/assets/dr-ibrahim-pixel-coin-talk.png")
