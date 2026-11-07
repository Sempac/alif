'use strict';
// Alif — application d'arabe pour Zeydoune.
// Écrans : accueil, histoires, lettres jumelles, révision, test des lettres, espace parent.

const VERSION = 'alif-v1';
const HERO = 'Zeydoune';
const KEY = 'alif-data';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const app = $('#app');
const pop = $('#pop');
const byChar = Object.fromEntries(LETTERS.map((l) => [l.c, l]));
const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = (a) => a[Math.random() * a.length | 0];
const ar = (t, cls = '') => `<span class="ar ${cls}">${t}</span>`;

// ───────────── Données sauvegardées (sur l'iPad) ─────────────
const S = load();
function load() {
  const d = { letters: {}, conf: {}, stories: {}, stars: 0, testDone: false, pin: null, rate: 0.75 };
  try { return Object.assign(d, JSON.parse(localStorage.getItem(KEY)) || {}); } catch { return d; }
}
function save() { localStorage.setItem(KEY, JSON.stringify(S)); }
function addStars(n) { S.stars += n; save(); }

// Boîtes de Leitner : 0 = pas encore vue, 1 = à revoir souvent … 5 = maîtrisée.
function recordLetter(c, ok, chosen, fromTest) {
  const st = S.letters[c] || (S.letters[c] = { box: 0, ok: 0, ko: 0 });
  if (ok) { st.ok++; st.box = fromTest ? 3 : Math.min(5, Math.max(1, st.box) + 1); }
  else {
    st.ko++; st.box = 1;
    if (chosen && chosen !== c) { const k = c + '>' + chosen; S.conf[k] = (S.conf[k] || 0) + 1; }
  }
  save();
}

// ───────────── Voix (synthèse vocale arabe de l'iPad) ─────────────
const Voice = {
  v: null,
  pick() {
    if (!('speechSynthesis' in window)) return;
    const vs = speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('ar'));
    this.v = vs.find((v) => /ar.SA/i.test(v.lang)) || vs[0] || null;
  },
  stop() { if ('speechSynthesis' in window) speechSynthesis.cancel(); },
  say(text, rate = S.rate) {
    return new Promise((res) => {
      if (!('speechSynthesis' in window)) return res();
      if (!this.v) this.pick();
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ar-SA'; if (this.v) u.voice = this.v; u.rate = rate;
      let done = false;
      // Safari oublie parfois l'évènement de fin : on continue quand même.
      const t = setTimeout(() => fin(), 1500 + text.length * 220 / rate);
      const fin = () => { if (!done) { done = true; clearTimeout(t); res(); } };
      u.onend = fin; u.onerror = fin;
      speechSynthesis.speak(u);
    });
  },
};
if ('speechSynthesis' in window) { Voice.pick(); speechSynthesis.onvoiceschanged = () => Voice.pick(); }

// ───────────── Petits sons (sans fichier audio) ─────────────
let actx;
function tone(freqs, dur = 0.12) {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    freqs.forEach((f, i) => {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = 'sine'; o.frequency.value = f;
      const t0 = actx.currentTime + i * dur;
      g.gain.setValueAtTime(0.18, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + dur * 1.6);
      o.connect(g).connect(actx.destination); o.start(t0); o.stop(t0 + dur * 1.7);
    });
  } catch { /* pas de son, tant pis */ }
}
const cheer = () => tone([660, 880, 1320]);
const buzz = () => tone([220, 180], 0.15);

// ───────────── Navigation ─────────────
let stopFlag = 0; // invalide les lectures en cours quand on change d'écran
function go(route, arg) {
  stopFlag++; Voice.stop(); closePop();
  if (route !== 'parent') parentOk = false; // l'espace parent se reverrouille dès qu'on le quitte
  (ROUTES[route] || home)(arg);
  window.scrollTo(0, 0);
}
app.addEventListener('click', (e) => {
  const g = e.target.closest('[data-go]');
  if (g) go(g.dataset.go, g.dataset.arg);
});
const header = (title, back = 'home', extra = '') =>
  `<header class="top"><button class="back" data-go="${back}">←</button><h1>${title}</h1>${extra}<div class="stars">⭐ ${S.stars}</div></header>`;

// ───────────── Accueil ─────────────
function home() {
  const tips = [
    'Prêt pour une histoire ?',
    'Les lettres jumelles t’attendent ! 👯',
    'Chaque jour un peu, et tu deviens un champion ! 🏆',
    'Touche un mot dans une histoire pour l’entendre 🔊',
  ];
  const tip = S.testDone ? pick(tips) : 'Commence par le test des lettres 🎯';
  app.innerHTML = `
    <header class="top"><button class="round" data-go="parent" aria-label="Espace parent">⚙️</button><div class="stars">⭐ ${S.stars}</div></header>
    <div class="hello"><div class="mascot">🦉</div><div class="bubble">Salam <b>${HERO}</b> !<br>${tip}</div></div>
    <div class="tiles">
      <button class="tile t-stories" data-go="library"><span>📚</span>Histoires</button>
      <button class="tile t-twins" data-go="twins"><span>👯</span>Lettres jumelles</button>
      <button class="tile t-review" data-go="review"><span>🔁</span>Révision<small>les lettres à retravailler</small></button>
      <button class="tile t-test" data-go="test"><span>🎯</span>Test des lettres${S.testDone ? '' : ' <em class="badge-new">à faire</em>'}</button>
    </div>`;
}

// ───────────── Moteur de quiz (choix multiple) ─────────────
// q = { prompt, audio?, choices: [{label, value}], answer, layout?, onResult?(ok, chosen), hint?(chosen) }
function runQuiz(cfg) {
  let i = 0, score = 0;
  const token = stopFlag;
  const show = () => {
    if (token !== stopFlag) return;
    if (i >= cfg.questions.length) return (cfg.onEnd || endScreen)(score, cfg.questions.length, cfg);
    const q = cfg.questions[i];
    app.innerHTML = `
      <header class="top"><button class="back" data-go="${cfg.back}">←</button>
        <div class="progress"><div style="width:${i / cfg.questions.length * 100}%"></div></div>
        <div class="stars">⭐ ${S.stars}</div></header>
      <div class="quiz">
        <div class="prompt">${q.prompt}</div>
        ${q.audio ? '<button class="big-audio" id="replay" aria-label="Réécouter">🔊</button>' : ''}
        <div class="choices ${q.layout || ''}">${q.choices.map((c, k) => `<button class="choice" data-k="${k}">${c.label}</button>`).join('')}</div>
        <div class="feedback" id="fb"></div>
      </div>`;
    if (q.audio) { $('#replay').onclick = () => Voice.say(q.audio); setTimeout(() => token === stopFlag && Voice.say(q.audio), 350); }
    let tries = 0, locked = false;
    $$('.choice').forEach((b) => b.onclick = () => {
      if (locked) return;
      const c = q.choices[+b.dataset.k];
      const ok = c.value === q.answer;
      if (tries === 0 && q.onResult) q.onResult(ok, c.value);
      tries++;
      if (ok) {
        locked = true; b.classList.add('good'); cheer();
        if (tries === 1) score++;
        setTimeout(() => { i++; show(); }, tries === 1 ? 900 : 1600);
      } else {
        b.classList.add('bad'); b.disabled = true; buzz();
        if (q.hint) $('#fb').innerHTML = q.hint(c.value);
        if (q.audio) setTimeout(() => Voice.say(q.audio), 500);
      }
    });
  };
  show();
}

function starsFor(score, total) {
  const r = score / total;
  return r >= 0.9 ? 3 : r >= 0.6 ? 2 : 1;
}
function endScreen(score, total, cfg) {
  const n = starsFor(score, total);
  addStars(n);
  const msg = n === 3 ? 'Bravo, champion !' : n === 2 ? 'Très bien !' : 'Continue, tu progresses !';
  app.innerHTML = `
    <div class="end">
      <div class="big">${n === 3 ? '🏆' : n === 2 ? '🎉' : '💪'}</div>
      <h2>${msg}</h2>
      <div>${score} bonnes réponses sur ${total}</div>
      <div class="earned">${'⭐'.repeat(n)}</div>
      ${cfg.extra || ''}
      <div class="btn-row">
        <button class="btn" data-go="${cfg.again}" data-arg="${cfg.againArg || ''}">Rejouer</button>
        <button class="btn alt" data-go="home">Accueil</button>
      </div>
    </div>`;
  cheer();
}

// Comparaison affichée après une erreur : la bonne lettre et celle choisie.
function hintCard(c, target) {
  const L = byChar[c];
  return `<div class="hint-card ${target ? 'target' : ''}">${ar(c)}<div><b>${L.fr}</b> ${target ? '✅' : '❌'}<br>${LETTER_HINTS[c] || ''}</div></div>`;
}
function letterHint(target) {
  return (chosen) => `<div class="hint">${hintCard(target, true)}${byChar[chosen] ? hintCard(chosen, false) : ''}</div>`;
}

// Lettres qui ressemblent à c (pour les mauvaises réponses proposées).
function lookalikes(c) {
  return [...new Set(TWINS.filter((t) => t.l.includes(c)).flatMap((t) => t.l))].filter((x) => x !== c);
}
function distractors(c, n) {
  const near = shuffle(lookalikes(c));
  const far = shuffle(LETTERS.map((l) => l.c).filter((x) => x !== c && !near.includes(x)));
  return near.concat(far).slice(0, n);
}
function listenQ(c, options, fromTest) {
  return {
    prompt: 'Quelle lettre entends-tu ?',
    audio: byChar[c].name,
    choices: options.map((x) => ({ label: ar(x), value: x })),
    answer: c, layout: 'letters',
    onResult: (ok, chosen) => recordLetter(c, ok, chosen, fromTest),
    hint: letterHint(c),
  };
}

// ───────────── Test des lettres ─────────────
function test() {
  runQuiz({
    back: 'home', again: 'test',
    questions: shuffle(LETTERS).map((L) => listenQ(L.c, shuffle(distractors(L.c, 3).concat(L.c)), true)),
    onEnd(score, total, cfg) {
      S.testDone = true; save();
      const weak = LETTERS.filter((L) => (S.letters[L.c] || {}).box === 1).map((L) => L.c);
      cfg.extra = weak.length
        ? `<div class="panel">À retravailler : ${ar(weak.join(' '), 'weak')}</div>`
        : '<div class="panel">Tu connais toutes tes lettres ! 🌟</div>';
      endScreen(score, total, cfg);
      $('.end .ar') && ($('.end .ar').style.fontSize = '2.4rem');
    },
  });
}

// ───────────── Révision intelligente ─────────────
function review() {
  // Plus une lettre est dans une petite boîte, plus elle a de chances de revenir.
  const weight = (c) => { const b = (S.letters[c] || {}).box || 0; return b === 0 ? 3 : 6 - b; };
  const bag = LETTERS.flatMap((L) => Array(weight(L.c) ** 2).fill(L.c));
  const chosen = [];
  while (chosen.length < 10) {
    const c = pick(bag);
    if (chosen[chosen.length - 1] !== c && chosen.filter((x) => x === c).length < 2) chosen.push(c);
  }
  runQuiz({
    back: 'home', again: 'review',
    questions: chosen.map((c) => listenQ(c, shuffle(distractors(c, 3).concat(c)))),
  });
}

// ───────────── Lettres jumelles ─────────────
function pairNeedsWork(t) {
  const errs = Object.entries(S.conf).filter(([k]) => { const [a, b] = k.split('>'); return t.l.includes(a) && t.l.includes(b); })
    .reduce((n, [, v]) => n + v, 0);
  return t.prio || errs >= 2;
}
function twins() {
  const sorted = [...TWINS].sort((a, b) => pairNeedsWork(b) - pairNeedsWork(a));
  const card = (t) => `
    <button class="card ${pairNeedsWork(t) ? 'prio' : ''}" data-go="twinSession" data-arg="${t.id}">
      ${pairNeedsWork(t) ? '<span class="flag">à travailler</span>' : ''}
      ${ar(t.l.join(' '))}
      <div class="sub">${t.l.map((c) => byChar[c].fr).join(' · ')}</div>
    </button>`;
  app.innerHTML = header('Lettres jumelles 👯') + `
    <p class="muted">Ces lettres se ressemblent. Entraîne-toi à bien les reconnaître !</p>
    <div class="list">${sorted.map(card).join('')}</div>`;
}
function twinSession(id) {
  const t = TWINS.find((x) => x.id === id) || TWINS[0];
  const types = ['listen', 'intruder'].concat(t.words ? ['word', 'word'] : []);
  const qs = [];
  for (let n = 0; n < 10; n++) {
    const type = n < 2 ? 'listen' : pick(types);
    if (type === 'listen') {
      qs.push(listenQ(pick(t.l), shuffle(t.l)));
    } else if (type === 'intruder') {
      const [base, odd] = shuffle(t.l);
      const pos = Math.random() * 8 | 0;
      qs.push({
        prompt: 'Touche la lettre qui est différente !',
        choices: Array.from({ length: 8 }, (_, k) => ({ label: ar(k === pos ? odd : base), value: k })),
        answer: pos, layout: 'grid8',
        onResult: (ok) => recordLetter(odd, ok, base),
        hint: () => `<div class="hint">${hintCard(odd, true)}${hintCard(base, false)}</div>`,
      });
    } else {
      const c = pick(Object.keys(t.words));
      const w = pick(t.words[c]);
      qs.push({
        prompt: `Quelle lettre est dans ce mot ?${ar(w, 'word')}`,
        audio: w,
        choices: t.l.map((x) => ({ label: ar(x), value: x })),
        answer: c, layout: 'letters',
        onResult: (ok, chosen) => recordLetter(c, ok, chosen),
        hint: letterHint(c),
      });
    }
  }
  runQuiz({ back: 'twins', again: 'twinSession', againArg: id, questions: qs });
}

// ───────────── Bibliothèque ─────────────
const LENS = [['', 'Toutes'], ['courte', '🟢 Courtes'], ['moyenne', '🟡 Moyennes'], ['longue', '🔴 Longues']];
const THEMES = { quotidien: '🏡 Quotidien', drôle: '😂 Drôle', animaux: '🐾 Animaux', sagesse: '💡 Sagesse', coran: '📖 Coran', aventure: '🧭 Aventure', mythe: '🏛️ Mythe' };
const filt = { len: '', theme: '' };
const LEN_ORDER = { courte: 0, moyenne: 1, longue: 2 };

function recommended() {
  const order = [...STORIES].sort((a, b) => LEN_ORDER[a.len] - LEN_ORDER[b.len] || a.diff - b.diff);
  return order.find((s) => (S.stories[s.id] || {}).page > 0 && !(S.stories[s.id] || {}).done)
    || order.find((s) => !(S.stories[s.id] || {}).done);
}
function storyCard(s) {
  const st = S.stories[s.id] || {};
  return `
    <button class="card story-card" data-go="story" data-arg="${s.id}">
      ${st.done ? `<span class="done-mark">✅ ${'⭐'.repeat(st.stars || 1)}</span>` : ''}
      <div class="cover">${s.cover}</div>
      <div class="title">${s.t}</div>
      ${ar(s.ar)}
      <div class="meta"><span class="len len-${s.len}">${s.len}</span><span>${THEMES[s.theme] || ''}</span><span>${'★'.repeat(s.diff)}${'☆'.repeat(3 - s.diff)}</span></div>
      ${st.page > 0 && !st.done ? `<div class="resume">📖 Reprendre page ${st.page + 1}</div>` : ''}
    </button>`;
}
function library() {
  const reco = recommended();
  const list = STORIES.filter((s) => (!filt.len || s.len === filt.len) && (!filt.theme || s.theme === filt.theme));
  const themes = [...new Set(STORIES.map((s) => s.theme))];
  const done = STORIES.filter((s) => (S.stories[s.id] || {}).done).length;
  app.innerHTML = header('Histoires 📚', 'home', `<span class="muted">${done}/${STORIES.length} lues</span>`) + `
    ${reco ? `<button class="card reco" data-go="story" data-arg="${reco.id}"><span class="cover">${reco.cover}</span>
      <span><small class="muted">Recommandé pour toi</small><b>${reco.t}</b>${ar(reco.ar)}</span></button>` : ''}
    <div class="filters">${LENS.map(([v, l]) => `<button class="chip ${filt.len === v ? 'on' : ''}" data-len="${v}">${l}</button>`).join('')}</div>
    <div class="filters">
      <button class="chip ${filt.theme === '' ? 'on' : ''}" data-theme="">Tous les thèmes</button>
      ${themes.map((t) => `<button class="chip ${filt.theme === t ? 'on' : ''}" data-theme="${t}">${THEMES[t] || t}</button>`).join('')}
    </div>
    <div class="list">${list.map(storyCard).join('') || '<div class="empty">Pas encore d’histoire ici.</div>'}</div>`;
  $$('[data-len]').forEach((b) => b.onclick = () => { filt.len = b.dataset.len; library(); });
  $$('[data-theme]').forEach((b) => b.onclick = () => { filt.theme = b.dataset.theme; library(); });
}

// ───────────── Lecteur d'histoire ─────────────
function parseScene(str) {
  const [bg, ...items] = str.split('|');
  return `<div class="scene bg-${bg}">${items.map((it) => {
    const [e, x, y, s, anim] = it.trim().split(/\s+/);
    return `<span class="it ${anim ? 'a-' + anim : ''}" style="left:${x}%;top:${y}%;--s:${s}">${e}</span>`;
  }).join('')}</div>`;
}
function parseSentence(str) {
  return str.split(';').map((p) => { const [a, f] = p.split('|'); return { a, f }; });
}
const clean = (w) => w.replace(/[«»!?؟.,،:…"]/g, '');

function story(id) {
  const s = STORIES.find((x) => x.id === id);
  if (!s) return library();
  const st = S.stories[id] || (S.stories[id] = { page: 0 });
  let p = Math.min(st.page || 0, s.pages.length - 1);
  if (st.done) p = 0;
  const token = stopFlag;
  let reading = 0; // numéro de la lecture karaoké en cours

  const render = (fresh) => {
    const [scene, ...sentences] = s.pages[p];
    const chap = (s.chapters || []).find(([, from]) => from === p);
    const words = sentences.map(parseSentence);
    let wi = 0;
    app.innerHTML = header(s.t, 'library') + `
      <div class="reader">
        <div style="position:relative">${parseScene(scene)}
          ${chap && fresh ? `<div class="chapter">Chapitre ${s.chapters.indexOf(chap) + 1}<br>${chap[0]}</div>` : ''}</div>
        <div class="text">${words.map((ws) => `<div class="sentence ar">${ws.map((w) => `<span class="w" data-i="${wi++}">${w.a}</span>`).join(' ')}</div>`).join('')}</div>
        <div class="controls">
          <button class="btn alt" id="prev" ${p === 0 ? 'disabled style="opacity:.3"' : ''}>▶</button>
          <button class="btn alt" id="listen">🔊 Écouter</button>
          <button class="btn next" id="next">${p === s.pages.length - 1 ? '🏁 Fin' : '◀ Suite'}</button>
        </div>
        <div class="page-dots">Page ${p + 1} / ${s.pages.length}</div>
      </div>`;
    const flat = words.flat();
    $$('.w').forEach((el) => el.onclick = (e) => {
      e.stopPropagation();
      reading++; $$('.w.on').forEach((x) => x.classList.remove('on'));
      el.classList.add('on');
      const w = flat[+el.dataset.i];
      showPop(w.a, w.f);
    });
    // L'arabe se lit de droite à gauche : ◀ avance, ▶ recule.
    $('#prev').onclick = () => { if (p > 0) { p--; turn(); } };
    $('#next').onclick = () => { if (p < s.pages.length - 1) { p++; turn(); } else finish(); };
    $('#listen').onclick = () => karaoke(flat);
  };
  const turn = () => {
    reading++; Voice.stop(); closePop();
    st.page = p; save(); render(true);
  };
  async function karaoke(flat) {
    const me = ++reading; closePop();
    const els = $$('.w');
    for (let k = 0; k < flat.length; k++) {
      if (me !== reading || token !== stopFlag) return;
      els.forEach((x) => x.classList.remove('on'));
      els[k].classList.add('on');
      // Durée minimale : le surlignage reste visible même si la voix échoue.
      await Promise.all([Voice.say(clean(flat[k].a)), new Promise((r) => setTimeout(r, 450))]);
    }
    if (me === reading) els.forEach((x) => x.classList.remove('on'));
  }
  function finish() {
    const qs = (s.q || []).map(([question, opts, a]) => {
      const choices = shuffle(opts.map((label, k) => ({ label, value: k })));
      return { prompt: question, choices, answer: a, layout: 'text' };
    });
    const conclude = (score) => {
      const earned = Math.min(3, 1 + score);
      const gain = Math.max(0, earned - (st.stars || 0));
      st.done = true; st.page = 0; st.stars = Math.max(st.stars || 0, earned); save();
      addStars(gain);
      app.innerHTML = `
        <div class="end">
          <div class="big">${s.cover}</div>
          <h2>Histoire terminée, bravo ${HERO} !</h2>
          <div class="earned">${'⭐'.repeat(earned)}</div>
          ${gain ? `<div>+${gain} étoile${gain > 1 ? 's' : ''}</div>` : ''}
          <div class="btn-row">
            <button class="btn" data-go="library">Autre histoire</button>
            <button class="btn alt" data-go="story" data-arg="${s.id}">Relire</button>
          </div>
        </div>`;
      cheer();
    };
    if (!qs.length) return conclude(2);
    runQuiz({ back: 'library', questions: qs, onEnd: conclude });
  }
  render(true);
}

function showPop(a, f) {
  pop.innerHTML = `${ar(a)}<span class="fr">${f}</span><button aria-label="Écouter">🔊</button>`;
  pop.classList.remove('hidden');
  pop.querySelector('button').onclick = (e) => { e.stopPropagation(); Voice.say(clean(a)); };
  Voice.say(clean(a));
}
function closePop() { pop.classList.add('hidden'); }
document.addEventListener('click', (e) => { if (!e.target.closest('.pop, .w')) closePop(); });

// ───────────── Espace parent ─────────────
let parentOk = false;
function parent() {
  if (parentOk) return dashboard();
  const first = !S.pin;
  app.innerHTML = header('Espace parent') + `
    <div class="pin">
      <div>${first ? 'Choisis un code à 4 chiffres pour protéger cet espace.' : 'Code parent :'}</div>
      <input id="pin" type="password" inputmode="numeric" maxlength="4" autocomplete="off">
      <button class="btn" id="ok">${first ? 'Enregistrer' : 'Entrer'}</button>
      <div id="err" class="muted"></div>
    </div>`;
  const input = $('#pin');
  input.focus();
  $('#ok').onclick = () => {
    const v = input.value.trim();
    if (!/^\d{4}$/.test(v)) { $('#err').textContent = '4 chiffres, s’il te plaît.'; return; }
    if (first) { S.pin = v; save(); }
    else if (v !== S.pin) { $('#err').textContent = 'Code incorrect.'; input.value = ''; return; }
    parentOk = true; dashboard();
  };
}
function dashboard() {
  const cells = LETTERS.map((L) => {
    const st = S.letters[L.c] || { box: 0, ok: 0, ko: 0 };
    return `<div class="lcell box${st.box}">${ar(L.c)}<small>${st.ok}✓ ${st.ko}✗</small></div>`;
  }).join('');
  const conf = Object.entries(S.conf).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const stories = STORIES.map((s) => {
    const st = S.stories[s.id] || {};
    return `<tr><td>${s.cover}</td><td style="text-align:left">${s.t}</td><td>${s.len}</td><td>${st.done ? '✅ ' + '⭐'.repeat(st.stars || 1) : st.page > 0 ? 'page ' + (st.page + 1) : '—'}</td></tr>`;
  }).join('');
  Voice.pick();
  app.innerHTML = header('Espace parent') + `
    <div class="panel"><h3>Résumé</h3>
      <div>⭐ ${S.stars} étoiles · Test des lettres : ${S.testDone ? 'fait ✅' : 'pas encore fait'} ·
      Histoires terminées : ${STORIES.filter((s) => (S.stories[s.id] || {}).done).length}/${STORIES.length}</div></div>
    <div class="panel"><h3>Les lettres</h3>
      <div class="lgrid">${cells}</div>
      <div class="legend"><span class="box0">pas encore vue</span><span class="box1">à revoir</span><span class="box2">fragile</span><span class="box3">connue</span><span class="box4">bien connue</span><span class="box5">maîtrisée</span></div></div>
    <div class="panel"><h3>Confusions</h3>
      ${conf.length ? `<table class="conf"><tr><th>Il fallait</th><th>Il a choisi</th><th>Fois</th></tr>
        ${conf.map(([k, n]) => { const [a, b] = k.split('>'); return `<tr><td>${ar(a)}</td><td>${ar(b)}</td><td>${n}</td></tr>`; }).join('')}</table>`
        : '<div class="muted">Aucune confusion enregistrée pour l’instant.</div>'}</div>
    <div class="panel"><h3>Histoires</h3><table class="conf">${stories}</table></div>
    <div class="panel"><h3>Voix</h3>
      ${Voice.v ? `<div>Voix arabe : <b>${Voice.v.name}</b> (${Voice.v.lang})</div>`
        : '<div class="warn">Aucune voix arabe trouvée. Sur l’iPad : Réglages › Accessibilité › Contenu énoncé › Voix › Arabe, puis télécharger une voix (Majed, par exemple).</div>'}
      <div class="row">Vitesse <input type="range" id="rate" min="0.4" max="1.1" step="0.05" value="${S.rate}"> <span id="rateV">${S.rate}</span>
        <button class="btn alt" id="tryVoice">🔊 Essayer</button></div></div>
    <div class="panel"><h3>Réglages</h3>
      <div class="row"><button class="btn alt" id="newPin">Changer le code</button>
      <button class="btn alt" id="reset">Tout remettre à zéro</button></div>
      <div class="muted" style="margin-top:10px">Version ${VERSION} · données gardées sur cet appareil</div></div>`;
  $('#rate').oninput = (e) => { S.rate = +e.target.value; $('#rateV').textContent = S.rate; save(); };
  $('#tryVoice').onclick = () => Voice.say('ذَهَبَ زَيْدُونُ إِلَى الْحَدِيقَةِ');
  $('#newPin').onclick = () => { S.pin = null; parentOk = false; save(); parent(); };
  let armed = false;
  $('#reset').onclick = (e) => {
    if (!armed) { armed = true; e.target.textContent = 'Appuie encore pour confirmer'; return; }
    const pin = S.pin, rate = S.rate;
    Object.assign(S, { letters: {}, conf: {}, stories: {}, stars: 0, testDone: false, pin, rate });
    save(); dashboard();
  };
}

const ROUTES = { home, library, story, twins, twinSession, review, test, parent };

// ───────────── Démarrage ─────────────
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js');
// Ouverture directe d'un écran par l'adresse, ex. #story=chatte (pratique pour tester).
const [r0, a0] = decodeURIComponent(location.hash.slice(1)).split('=');
go(ROUTES[r0] && r0 !== 'parent' ? r0 : 'home', a0);
