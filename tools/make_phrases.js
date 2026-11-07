// Prépare la liste des textes à faire lire par une voix Premium de l'iPad (app Raccourcis).
// Sortie : voix/phrases.txt (un texte par ligne, dans l'ordre de lecture)
//          voix/index.json  (même ordre : clé de chaque texte, pour redécouper l'enregistrement)
// Usage : node tools/make_phrases.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const ctx = { window: {} };
vm.createContext(ctx);
for (const f of ['data/stories.js', 'data/words.js']) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx);
const { STORIES, WORDS } = ctx.window;

const items = []; // { key, text }
const seen = new Set();
const add = (key, text) => { if (!seen.has(text)) { seen.add(text); items.push({ key, text }); } };

for (const s of STORIES) {
  s.pages.forEach(([, ...sents], p) => sents.forEach((str, k) => {
    const text = str.split(';').map((x) => x.split('|')[0]).join(' ');
    add(`${s.id}-${p + 1}-${k + 1}`, text);
  }));
}
WORDS.forEach((w, i) => add(`mot-${i + 1}`, w.a));

fs.mkdirSync(path.join(root, 'voix'), { recursive: true });
fs.writeFileSync(path.join(root, 'voix/phrases.txt'), items.map((x) => x.text).join('\n') + '\n');
fs.writeFileSync(path.join(root, 'voix/index.json'), JSON.stringify(items, null, 0));
const letters = items.reduce((a, x) => a + x.text.replace(/[ً-ْٰ\s]/g, '').length, 0);
console.log(`${items.length} textes (${items.filter((x) => !x.key.startsWith('mot-')).length} phrases, ${items.filter((x) => x.key.startsWith('mot-')).length} mots), ${letters} lettres`);
