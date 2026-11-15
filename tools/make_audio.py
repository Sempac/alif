"""Génère la voix des histoires avec une voix neuronale gratuite (Microsoft Edge, sans compte).

Lit voix/textes.json (fait par tools/make_audio.js), crée audio/<clé>.mp3 pour chaque
texte manquant et écrit data/audio.js = { clé: [[index du mot, début en ms], ...] }
pour que le surlignage karaoké suive exactement la voix.

Usage : node tools/make_audio.js && python tools/make_audio.py
        python tools/make_audio.py --voix ar-SA-HamedNeural --tout   (changer de voix, tout refaire)
Prérequis : python -m pip install edge-tts
"""
import argparse, asyncio, json, re, sys
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parent.parent
# Voix proposées dans l'espace parent : id → (voix Edge, nom affiché). La première = par défaut.
VOICES = {
    "zariyah": ("ar-SA-ZariyahNeural", "Zariyah (femme)"),
    "hamed": ("ar-SA-HamedNeural", "Hamed (homme)"),
    "fatima": ("ar-AE-FatimaNeural", "Fatima (femme)"),
    "hamdan": ("ar-AE-HamdanNeural", "Hamdan (homme)"),
}
TASHKEEL = re.compile(r"[ً-ْٰ]")
PUNCT = re.compile(r"[«»\"“”!?؟.,،:…]")


def spoken(t):
    # Les guillemets et les deux-points gênent la voix : on les remplace par une pause.
    t = re.sub(r"\s*:\s*", "، ", t)
    return re.sub(r"[«»\"“”]", "", t)


def bare(w):
    return TASHKEEL.sub("", PUNCT.sub("", w))


def align(text, bounds):
    """Associe chaque mot prononcé (WordBoundary) au mot affiché correspondant."""
    words = [bare(w) for w in text.split(" ")]
    marks, k = [], 0
    for ms, said in bounds:
        b = bare(said)
        if not b:
            continue
        for j in range(k, len(words)):
            if words[j] and (b in words[j] or words[j] in b):
                marks.append([j, ms])
                k = j + 1
                break
    return marks


async def one(item, voice, rate, sem, marks, out):
    path = out / f"{item['h']}.mp3"
    async with sem:
        for essai in range(3):
            try:
                c = edge_tts.Communicate(spoken(item["t"]), voice, rate=rate, boundary="WordBoundary")
                audio, bounds = bytearray(), []
                async for ch in c.stream():
                    if ch["type"] == "audio":
                        audio += ch["data"]
                    elif ch["type"] == "WordBoundary":
                        bounds.append((round(ch["offset"] / 10000), ch["text"]))
                if not audio:
                    raise RuntimeError("pas d'audio")
                path.write_bytes(audio)
                marks[item["h"]] = align(item["t"], bounds)
                return True
            except Exception as e:  # réseau : on réessaie
                err = e
                await asyncio.sleep(2 + essai * 3)
        print("ÉCHEC", item["t"], err, file=sys.stderr)
        return False


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--vitesse", default="-30%")
    ap.add_argument("--tout", action="store_true", help="tout régénérer")
    a = ap.parse_args()

    items = json.loads((ROOT / "voix" / "textes.json").read_text("utf-8"))
    keep = {x["h"] for x in items}
    allmarks = {}
    for vid, (voice, label) in VOICES.items():
        out = ROOT / "audio" / vid
        out.mkdir(parents=True, exist_ok=True)
        mf = ROOT / "voix" / f"marks-{vid}.json"
        marks = {} if a.tout or not mf.exists() else json.loads(mf.read_text("utf-8"))
        todo = [x for x in items if a.tout or x["h"] not in marks or not (out / f"{x['h']}.mp3").exists()]
        print(f"{label} : {len(todo)} / {len(items)} à générer")
        sem = asyncio.Semaphore(6)
        res = await asyncio.gather(*(one(x, voice, a.vitesse, sem, marks, out) for x in todo))
        # On ne garde que les textes encore utilisés.
        marks = {h: m for h, m in marks.items() if h in keep}
        for f in out.glob("*.mp3"):
            if f.stem not in keep:
                f.unlink()
        mf.write_text(json.dumps(marks, separators=(",", ":")), "utf-8")
        allmarks[vid] = marks
        print(f"  OK : {sum(res)} générés, {len(res) - sum(res)} échecs")
    voices = [{"id": vid, "label": label} for vid, (_, label) in VOICES.items()]
    (ROOT / "data" / "audio.js").write_text(
        "// Fait par tools/make_audio.py. VOICES : voix au choix (la 1re par défaut).\n"
        "// AUDIO[voix][clé du texte] = [[index du mot, début en ms], ...]\n"
        f"window.VOICES = {json.dumps(voices, ensure_ascii=False)};\n"
        f"window.AUDIO = {json.dumps(allmarks, separators=(',', ':'))};\n", "utf-8")


asyncio.run(main())
