"""Records the voice lines that have no mp3 yet (tools/lines.json → assets/audio/<key>.mp3).

Same voice as the existing files: Piper TTS, en_US-lessac-medium.
Setup (once):  pip install piper-tts lameenc numpy
               download en_US-lessac-medium.onnx + .onnx.json from
               https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_US/lessac/medium
Usage:         node tools/build.mjs
               python tools/make_audio.py path/to/en_US-lessac-medium.onnx [--redo key1 key2 …]
               node tools/build.mjs          (adds the new files to js/assets.js)
"""
import io, json, sys, wave
from pathlib import Path

import lameenc
import numpy as np
from piper import PiperVoice

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "audio"
# letter sounds are spelled with phonemes (plain "a" would be read as the letter name)
PHONEMES = {"snd_a": "[[ˈæ, ˈæ,]] ant!", "snd_p": "[[pʰə, pʰə,]] pineapple!"}
# the English voice cannot read Vietnamese letters: "Mây" is spoken as "May"
SPOKEN = {"Mây": "May"}


def spoken(text):
    for a, b in SPOKEN.items():
        text = text.replace(a, b)
    return text


def synth(voice, text):
    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        voice.synthesize_wav(text, w)
    buf.seek(0)
    with wave.open(buf) as w:
        rate = w.getframerate()
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16)
    # trim silence, keep 60 ms on each side
    loud = np.where(np.abs(x) > 500)[0]
    if len(loud):
        pad = int(rate * 0.06)
        x = x[max(0, loud[0] - pad): loud[-1] + pad]
    return x, rate


def to_mp3(x, rate):
    enc = lameenc.Encoder()
    enc.set_bit_rate(64)
    enc.set_in_sample_rate(rate)
    enc.set_channels(1)
    enc.set_quality(2)
    return enc.encode(x.tobytes()) + enc.flush()


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    voice = PiperVoice.load(sys.argv[1])
    redo = set(sys.argv[sys.argv.index("--redo") + 1:]) if "--redo" in sys.argv else set()
    lines = json.loads((ROOT / "tools" / "lines.json").read_text(encoding="utf-8"))
    made = 0
    for key, text in lines.items():
        f = OUT / f"{key}.mp3"
        if f.exists() and key not in redo:
            continue
        x, rate = synth(voice, PHONEMES.get(key, spoken(text)))
        f.write_bytes(to_mp3(x, rate))
        made += 1
        print(f"{key}: {text}")
    print(f"made {made} file(s)")


if __name__ == "__main__":
    main()
