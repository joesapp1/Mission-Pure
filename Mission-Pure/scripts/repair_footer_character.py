from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
for path in ROOT.glob('*.html'):
    text = path.read_text(encoding='utf-8', errors='ignore')
    text = text.replace('\u00a0', ' ')
    path.write_text(text, encoding='utf-8')
