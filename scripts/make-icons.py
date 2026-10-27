"""Generates the extension icons (a clock inside a chat bubble).

Usage: python3 scripts/make-icons.py
Writes extension/icons/icon-{16,48,128}.png. Drawn at 1024px and downscaled
so edges stay smooth.
"""

import math
from pathlib import Path

from PIL import Image, ImageDraw

SIZE = 1024
SIZES = (16, 48, 128)
TOP = (96, 150, 255)
BOTTOM = (40, 90, 220)
HAND = (40, 90, 220)
OUT_DIR = Path(__file__).resolve().parent.parent / 'extension' / 'icons'


def gradient_background():
    image = Image.new('RGBA', (SIZE, SIZE))
    draw = ImageDraw.Draw(image)
    for y in range(SIZE):
        t = y / (SIZE - 1)
        color = tuple(round(a + (b - a) * t) for a, b in zip(TOP, BOTTOM))
        draw.line([(0, y), (SIZE, y)], fill=color + (255,))
    mask = Image.new('L', (SIZE, SIZE), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        [0, 0, SIZE - 1, SIZE - 1], radius=230, fill=255)
    image.putalpha(mask)
    return image


def hand_end(cx, cy, degrees, length):
    radians = math.radians(degrees)
    return (cx + length * math.sin(radians), cy - length * math.cos(radians))


def draw_icon():
    image = gradient_background()
    draw = ImageDraw.Draw(image)
    cx, cy, radius = 530, 480, 350

    # Chat bubble: a white circle with a tail at the lower left.
    draw.polygon([(250, 690), (170, 910), (440, 810)], fill='white')
    draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius],
                 fill='white')

    # Clock hands showing 10:10.
    width = 74
    for degrees, length in ((305, 175), (60, 250)):
        end = hand_end(cx, cy, degrees, length)
        draw.line([(cx, cy), end], fill=HAND, width=width)
        draw.ellipse([end[0] - width / 2, end[1] - width / 2,
                      end[0] + width / 2, end[1] + width / 2], fill=HAND)
    draw.ellipse([cx - 55, cy - 55, cx + 55, cy + 55], fill=HAND)
    return image


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    icon = draw_icon()
    for size in SIZES:
        icon.resize((size, size), Image.LANCZOS).save(
            OUT_DIR / f'icon-{size}.png')
    icon.resize((512, 512), Image.LANCZOS).save(OUT_DIR.parent.parent /
                                                'docs' / 'icon-preview.png')


if __name__ == '__main__':
    main()
