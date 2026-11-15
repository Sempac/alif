// Liste tous les textes que l'app peut faire lire (phrases et mots des histoires,
// mots illustrés, noms des lettres, mots des lettres jumelles).
// Sortie : voix/textes.json = [{ h: clé, t: texte }]  → lu par tools/make_audio.py
// Usage : node tools/make_audio.js && python tools/make_audio.py
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const ctx = { window: {} };
vm.createContext(ctx);
for (const f of ['data/letters.js', 'data/stories.js', 'data/words.js']) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx);
const { STORIES, WORDS, LETTERS, TWINS } = ctx.window;

// Même fonction que audioKey() dans app.js.
const key = (t) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(36);
};
const clean = (w) => w.replace(/[«»!?؟.,،:…"]/g, '');

const items = [];
const seen = new Set();
const add = (t) => { t = t.trim(); if (t && !seen.has(t)) { seen.add(t); items.push({ h: key(t), t }); } };

for (const s of STORIES) {
  s.pages.forEach(([, ...sents]) => sents.forEach((str) => {
    const ws = str.split(';').map((x) => x.split('|')[0]);
    add(ws.join(' '));
    ws.forEach((w) => add(clean(w)));
  }));
}
WORDS.forEach((w) => add(w.a));
(LETTERS || []).forEach((L) => L.name && add(L.name));
(TWINS || []).forEach((t) => Object.values(t.words || {}).flat().forEach(add));
add('ذَهَبَ زَيْدُونُ إِلَى الْحَدِيقَةِ');

fs.writeFileSync(path.join(root, 'voix/textes.json'), JSON.stringify(items));
console.log(`${items.length} textes`);
