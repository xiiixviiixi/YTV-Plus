import sys
sys.path.insert(0, r'C:\Users\Rayhan Khan\AppData\Roaming\Python\Python313\site-packages')
from PIL import Image

ROOT = r'X:\Documents\The Standard Software Company/YouTube TV+'
SRC_SQUARE = r'X:\Downloads\YouTube TV icon.png'   # 1080x1080 source
SRC_WIDE   = r'X:\Downloads\YouTube TV.png'         # 1920x1080 source
OUT        = f'{ROOT}/branding'

# 1:1 square fallback icon (Tizen CLI / wgt packaging) — direct resize, no cropping.
square_src = Image.open(SRC_SQUARE).convert('RGBA')
square_src.resize((1024, 1024), Image.LANCZOS).save(f'{OUT}/icon.png', 'PNG')

# 16:9 widescreen icon (Apps2Samsung tile) — core branding inside the central
# 512x423 safe zone (half of 1024x846 safe area scaled to 1920x1080 canvas).
wide_src = Image.open(SRC_WIDE).convert('RGBA')

# Build a clean 1920x1080 canvas, letterboxing the source to preserve aspect
# while keeping everything inside the central safe zone.
canvas = Image.new('RGBA', (1920, 1080), (0, 0, 0, 0))
w, h = wide_src.size
scale = min(1920 / w, 1080 / h)
new_w, new_h = int(w * scale), int(h * scale)
fit = wide_src.resize((new_w, new_h), Image.LANCZOS)
canvas.paste(fit, ((1920 - new_w) // 2, (1080 - new_h) // 2))
canvas.save(f'{OUT}/icon_16b9.png', 'PNG')

print(f'wrote {OUT}/icon.png        {square_src.resize((1024,1024), Image.LANCZOS).size}')
print(f'wrote {OUT}/icon_16b9.png {canvas.size}')
