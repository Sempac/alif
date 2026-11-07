"""Importe les illustrations générées dans l'application.

Dépose les images dans images-source/ en les nommant <histoire>-<page>.<ext>
(ex. chatte-1.png, chatte-2.png… ; page = 1 pour la première page).
Puis lance :  python tools/import_images.py

Chaque image est recadrée au format 3:2, réduite à 1280 px de large et enregistrée
en JPEG léger dans images/<histoire>/<page>.jpg. data/images.js est régénéré :
une histoire n'affiche ses illustrations qu'à partir de la page 1 et tant que les
pages se suivent (sinon les dessins actuels restent utilisés).
"""
import json
import re
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'images-source'
OUT = ROOT / 'images'
W, H = 1280, 853  # 3:2


def fit(img):
    img = img.convert('RGB')
    r = img.width / img.height
    if r > W / H:  # trop large : on coupe les côtés
        nw = int(img.height * W / H)
        x = (img.width - nw) // 2
        img = img.crop((x, 0, x + nw, img.height))
    else:  # trop haute : on coupe le haut et le bas
        nh = int(img.width * H / W)
        y = (img.height - nh) // 2
        img = img.crop((0, y, img.width, y + nh))
    return img.resize((W, H), Image.LANCZOS)


def main():
    found = {}
    for f in sorted(SRC.glob('*')):
        m = re.fullmatch(r'([a-z-]+?)-(\d+)\.(png|jpe?g|webp)', f.name, re.I)
        if not m:
            print('ignoré (nom non reconnu) :', f.name)
            continue
        sid, page = m.group(1), int(m.group(2))
        dest = OUT / sid / f'{page}.jpg'
        dest.parent.mkdir(parents=True, exist_ok=True)
        fit(Image.open(f)).save(dest, 'JPEG', quality=82, optimize=True, progressive=True)
        found.setdefault(sid, set()).add(page)
        print(f'{f.name} -> {dest.relative_to(ROOT)} ({dest.stat().st_size // 1024} Ko)')
    # Toutes les images déjà importées comptent aussi.
    for d in OUT.glob('*'):
        for j in d.glob('*.jpg'):
            found.setdefault(d.name, set()).add(int(j.stem))
    counts = {}
    for sid, pages in found.items():
        n = 0
        while n + 1 in pages:
            n += 1
        if n:
            counts[sid] = n
    (ROOT / 'data' / 'images.js').write_text(
        "// Généré par tools/import_images.py : nombre de pages illustrées par histoire.\n"
        f"window.IMAGES = {json.dumps(counts, ensure_ascii=False)};\n", encoding='utf-8')
    print('Pages illustrées :', counts)


if __name__ == '__main__':
    main()
