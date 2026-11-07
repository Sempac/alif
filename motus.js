'use strict';
// Jeu « Mots à trous » : retrouver les lettres qui manquent dans un mot illustré,
// puis dans une phrase d'histoire. Niveaux : étiquettes (3 → 10), minuteur, clavier arabe.
// Utilise les fonctions générales d'app.js (S, save, go, Voice, recordLetter, letterHint…).

const MT_LEVELS = [
  { holes: [1, 1], choices: 3, maxLen: 4, label: '1 lettre · 3 étiquettes' },
  { holes: [1, 1], choices: 4, timer: 10, label: '1 lettre · 4 étiquettes · ⏱ 10 s' },
  { holes: [2, 2], choices: 6, timer: 15, label: '2 lettres · 6 étiquettes · ⏱ 15 s' },
  { holes: [2, 3], choices: 10, timer: 20, label: '2 ou 3 lettres · 10 étiquettes · ⏱ 20 s' },
  { holes: [1, 2], keyboard: true, timer: 25, label: '1 ou 2 lettres · clavier arabe · ⏱ 25 s' },
  { sentence: true, holes: [1, 2], choices: 4, timer: 20, label: 'Phrase · 4 étiquettes · ⏱ 20 s' },
  { sentence: true, holes: [2, 3], keyboard: true, timer: 30, label: 'Phrase · clavier arabe · ⏱ 30 s' },
];
const MT_ROUND = 10;
// Lettres qui ne s'attachent pas à la lettre suivante.
const NONJOIN = 'اأإآدذرزوؤةء';
const LET28 = LETTERS.map((l) => l.c);

function mtState() { return S.motus || (S.motus = { unlocked: 1, best: {} }); }

// Découpe un texte en graphèmes : lettre + ses voyelles (ou espace / ponctuation).
function graphemes(text) {
  return text.match(/[ء-ي][ً-ْٰ]*|[^ء-ي]/g) || [];
}

function motus() {
  const st = mtState();
  app.innerHTML = header('Mots à trous 🧩') + `
    <p class="muted">Trouve les lettres qui manquent ! Réussis 8 mots sur 10 pour débloquer le niveau suivant.</p>
    <div class="levels">${MT_LEVELS.map((L, i) => {
      const n = i + 1, open = n <= st.unlocked, best = st.best[n];
      return `<button class="card level ${open ? '' : 'locked'}" ${open ? `data-go="motusPlay" data-arg="${n}"` : 'disabled'}>
        <span class="lvl-n">${open ? n : '🔒'}</span>
        <span class="lvl-t">${L.sentence ? '📜 ' : ''}${L.label}</span>
        ${best != null ? `<span class="lvl-b">record ${best}/${MT_ROUND}</span>` : ''}
      </button>`;
    }).join('')}</div>`;
}

function mtQuestion(L) {
  const k = L.holes[0] + Math.floor(Math.random() * (L.holes[1] - L.holes[0] + 1));
  let g, img, audio, fr, scene;
  if (L.sentence) {
    // Une phrase prise dans les histoires courtes ou moyennes.
    const pool = STORIES.filter((s) => s.len !== 'longue').flatMap((s) =>
      s.pages.flatMap(([sc, ...sents], p) => sents.map((t) => ({ s, p, sc, words: parseSentence(t) }))));
    const it = pick(pool);
    const text = it.words.map((w) => w.a).join(' ');
    g = graphemes(text); audio = text; fr = it.words.map((w) => w.f).join(' · ');
    scene = (window.IMAGES || {})[it.s.id] > it.p ? photoScene(it.s.id, it.p, it.sc) : parseScene(it.sc);
  } else {
    const pool = WORDS.filter((w) => !L.maxLen || graphemes(w.a).length <= L.maxLen);
    const w = pick(pool);
    g = graphemes(w.a); img = w.img; audio = w.a; fr = w.f;
  }
  const cand = g.map((x, i) => (LET28.includes(x[0]) ? i : -1)).filter((i) => i >= 0);
  const holes = shuffle(cand).slice(0, Math.min(k, cand.length)).sort((a, b) => a - b);
  return { g, holes, img, scene, audio, fr };
}

function mtWordHtml(q, filled, cur, reveal) {
  if (reveal === 'full') return ar(q.g.join(''), 'mt-text');
  let out = '', run = '';
  const flush = () => { if (run) { out += ar(run, 'mt-text'); run = ''; } };
  q.g.forEach((x, i) => {
    const h = q.holes.indexOf(i);
    if (h < 0) {
      // Trait d'attache si la lettre précédente (un trou) se lie à celle-ci.
      const prev = q.g[i - 1];
      if (i > 0 && q.holes.includes(i - 1) && LET28.includes(x[0]) && !NONJOIN.includes(prev[0]) && !filled[q.holes.indexOf(i - 1)]) run += 'ـ';
      run += x;
      const next = q.g[i + 1];
      if (next && q.holes.includes(i + 1) && LET28.includes(next[0]) && !NONJOIN.includes(x[0]) && !filled[q.holes.indexOf(i + 1)]) run += 'ـ';
      return;
    }
    flush();
    const f = filled[h];
    out += `<span class="slot ${f ? (f === 'late' ? 'late' : 'ok') : ''} ${h === cur ? 'cur' : ''}">${f ? ar(x) : '&nbsp;'}</span>`;
  });
  flush();
  return out;
}

function motusPlay(arg) {
  const n = Math.min(Math.max(+arg || 1, 1), MT_LEVELS.length);
  const L = MT_LEVELS[n - 1];
  const token = stopFlag;
  let i = 0, score = 0, timerId = null;

  const next = () => {
    clearInterval(timerId);
    if (token !== stopFlag) return;
    if (i >= MT_ROUND) return finish();
    const q = mtQuestion(L);
    const filled = q.holes.map(() => false);
    let errors = 0, done = false, cur = 0;
    const needed = [...new Set(q.holes.map((h) => q.g[h][0]))];
    const keys = L.keyboard ? LET28
      : shuffle(needed.concat(shuffle(needed.flatMap(lookalikes)).filter((c, j, a) => !needed.includes(c) && a.indexOf(c) === j))
        .slice(0, Math.max(L.choices, needed.length)));
    while (!L.keyboard && keys.length < L.choices) {
      const c = pick(LET28); if (!keys.includes(c)) keys.push(c);
    }
    const keyList = L.keyboard ? keys : shuffle(keys);

    app.innerHTML = `
      <header class="top"><button class="back" data-go="motus">←</button>
        <div class="progress"><div style="width:${i / MT_ROUND * 100}%"></div></div>
        <div class="stars">⭐ ${S.stars}</div></header>
      <div class="quiz mt">
        ${L.timer ? '<div class="timer"><div id="tbar"></div><span id="tsec"></span></div>' : ''}
        ${q.scene ? `<div class="mt-scene">${q.scene}</div>` : `<div class="mt-img">${q.img}</div>`}
        <div class="mt-word ${L.sentence ? 'sent' : ''}" id="mw" dir="rtl"></div>
        <div class="mt-fr">${q.fr} <button class="round small" id="say">🔊</button></div>
        <div class="${L.keyboard ? 'kbd' : 'choices letters'}" dir="${L.keyboard ? 'rtl' : 'ltr'}">
          ${keyList.map((c) => `<button class="${L.keyboard ? 'key' : 'choice'}" data-c="${c}">${ar(c)}</button>`).join('')}
        </div>
        <div class="feedback" id="fb"></div>
      </div>`;
    const draw = (reveal) => { $('#mw').innerHTML = mtWordHtml(q, filled, done ? -1 : cur, reveal); };
    draw();
    $('#say').onclick = () => Voice.say(q.audio);

    const end = (ok) => {
      done = true; clearInterval(timerId);
      if (ok && !errors) score++;
      draw('full');
      $('#mw').classList.add(ok ? 'win' : 'lose');
      if (ok) cheer();
      Voice.say(q.audio);
      setTimeout(() => { i++; next(); }, ok ? 1800 : 2600);
    };

    $$('[data-c]').forEach((b) => b.onclick = () => {
      if (done) return;
      const want = q.g[q.holes[cur]][0];
      const c = b.dataset.c;
      if (c === want) {
        if (!filled[cur]) recordLetter(want, true);
        filled[cur] = true; cur++;
        tone([700, 1050], 0.08);
        $('#fb').innerHTML = '';
        if (cur >= q.holes.length) return end(true);
        draw();
      } else {
        errors++; buzz();
        recordLetter(want, false, c);
        b.classList.add('bad'); setTimeout(() => b.classList.remove('bad'), 500);
        if (!L.keyboard) b.disabled = true;
        $('#fb').innerHTML = letterHint(want)(c);
      }
    });

    if (L.timer) {
      const t0 = Date.now(), total = L.timer * 1000;
      timerId = setInterval(() => {
        if (token !== stopFlag) return clearInterval(timerId);
        const left = Math.max(0, total - (Date.now() - t0));
        const bar = $('#tbar'), sec = $('#tsec');
        if (!bar) return clearInterval(timerId);
        bar.style.width = (left / total * 100) + '%';
        bar.className = left < 3000 ? 'hurry' : '';
        sec.textContent = Math.ceil(left / 1000) + ' s';
        if (left === 0 && !done) {
          // Temps écoulé : on montre la réponse.
          q.holes.forEach((_, h) => { if (!filled[h]) filled[h] = 'late'; });
          $('#fb').innerHTML = '<div class="hint-card">⏰ Temps écoulé ! Voici la réponse.</div>';
          draw(); setTimeout(() => end(false), 900);
          done = true;
        }
      }, 100);
    }
  };

  const finish = () => {
    const st = mtState();
    st.best[n] = Math.max(st.best[n] || 0, score);
    let extra = '';
    if (score >= 8 && n === st.unlocked && n < MT_LEVELS.length) {
      st.unlocked = n + 1;
      extra = `<div class="panel">🔓 Niveau ${n + 1} débloqué : ${MT_LEVELS[n].label}</div>`;
    } else if (score < 8) {
      extra = '<div class="panel">Encore un effort : 8 sur 10 pour débloquer le niveau suivant !</div>';
    }
    save();
    endScreen(score, MT_ROUND, { again: 'motusPlay', againArg: n, extra });
  };
  next();
}
