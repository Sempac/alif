'use strict';
// Jeu « Phrases en ordre » : une scène d'histoire, des cases vides, et les mots mélangés en dessous.
// L'enfant glisse chaque mot dans sa case, ou touche le mot puis la case.
// Utilise les fonctions générales d'app.js (S, save, go, Voice, parseScene, photoScene…).

const OR_LEVELS = [
  { min: 2, max: 3, size: true, label: 'Phrases de 2 ou 3 mots' },
  { min: 4, max: 4, size: true, label: 'Phrases de 4 mots' },
  { min: 5, max: 5, label: 'Phrases de 5 mots' },
  { min: 6, max: 99, label: 'Phrases de 6 mots et plus' },
];
const OR_ROUND = 6;
const OR_PASS = 4; // phrases réussies sans erreur pour débloquer le niveau suivant

function orState() { return S.ordre || (S.ordre = { unlocked: 1, best: {} }); }

function ordre() {
  const st = orState();
  app.innerHTML = header('Phrases en ordre 🧱') + `
    <p class="muted">Remets les mots dans le bon ordre ! Glisse chaque mot dans sa case, ou touche le mot puis la case.
      Réussis ${OR_PASS} phrases sur ${OR_ROUND} pour débloquer le niveau suivant.</p>
    <div class="levels">${OR_LEVELS.map((L, i) => {
      const n = i + 1, open = n <= st.unlocked, best = st.best[n];
      return `<button class="card level ${open ? '' : 'locked'}" ${open ? `data-go="ordrePlay" data-arg="${n}"` : 'disabled'}>
        <span class="lvl-n">${open ? n : '🔒'}</span>
        <span class="lvl-t">${L.label}</span>
        ${best != null ? `<span class="lvl-b">record ${best}/${OR_ROUND}</span>` : ''}
      </button>`;
    }).join('')}</div>`;
}

function ordrePlay(arg) {
  const n = Math.min(Math.max(+arg || 1, 1), OR_LEVELS.length);
  const L = OR_LEVELS[n - 1];
  const token = stopFlag;
  const pool = STORIES.flatMap((s) => s.pages.flatMap(([sc, ...sents], p) =>
    sents.map((t) => ({ s, p, sc, words: parseSentence(t) }))))
    .filter((it) => it.words.length >= L.min && it.words.length <= L.max);
  const round = shuffle(pool).slice(0, OR_ROUND);
  let i = 0, score = 0;

  const next = () => {
    if (token !== stopFlag) return;
    if (i >= round.length) return finish();
    const it = round[i];
    const want = it.words.map((w) => clean(w.a));
    // Étiquettes mélangées (jamais dans le bon ordre dès le départ).
    let order = shuffle(want.map((_, k) => k));
    while (want.length > 1 && order.every((k, j) => want[k] === want[j])) order = shuffle(order);
    const placed = want.map(() => false); // case j remplie ?
    const used = want.map(() => false);   // étiquette k posée ?
    let sel = null, errors = 0, done = false;

    app.innerHTML = `
      <header class="top"><button class="back" data-go="ordre">←</button>
        <div class="progress"><div style="width:${i / round.length * 100}%"></div></div>
        <div class="stars">⭐ ${S.stars}</div></header>
      <div class="quiz mt">
        <div class="mt-scene">${(window.IMAGES || {})[it.s.id] > it.p ? photoScene(it.s.id, it.p, it.sc) : parseScene(it.sc)}</div>
        <div class="or-slots" id="slots" dir="rtl">${want.map((w, j) =>
          `<div class="oslot" data-j="${j}" ${L.size ? `style="min-width:${Math.max(4, w.replace(/[ً-ْٰ]/g, '').length * 1.5).toFixed(1)}rem"` : ''}></div>`).join('')}</div>
        <div class="mt-fr">${it.words.map((w) => w.f).join(' · ')} <button class="round small" id="say">🔊</button></div>
        <div class="or-bank" id="bank" dir="rtl">${order.map((k) =>
          `<button class="otile" data-k="${k}">${ar(want[k])}</button>`).join('')}</div>
        <div class="feedback" id="fb"></div>
      </div>`;
    const text = it.words.map((w) => w.a).join(' ');
    $('#say').onclick = () => Voice.say(text);

    const select = (k) => {
      sel = sel === k ? null : k;
      $$('.otile').forEach((b) => b.classList.toggle('sel', +b.dataset.k === sel));
    };
    // Essaie de poser l'étiquette k dans la case j.
    const place = (k, j) => {
      if (done || used[k] || placed[j]) return;
      const slot = $(`.oslot[data-j="${j}"]`), tile = $(`.otile[data-k="${k}"]`);
      if (want[k] === want[j]) {
        placed[j] = true; used[k] = true; sel = null;
        slot.innerHTML = ar(want[k]); slot.classList.add('ok'); slot.classList.remove('next');
        tile.classList.add('used'); tile.classList.remove('sel', 'hint');
        tone([700, 1050], 0.08);
        $('#fb').innerHTML = '';
        if (placed.every(Boolean)) win();
      } else {
        errors++; buzz();
        slot.classList.add('bad'); setTimeout(() => slot.classList.remove('bad'), 450);
        tile.classList.add('shake'); setTimeout(() => tile.classList.remove('shake'), 450);
        select(null); sel = null;
        if (errors >= 3) {
          // Coup de pouce : le mot de la première case libre brille.
          const j0 = placed.indexOf(false);
          const k0 = want.findIndex((w, kk) => !used[kk] && w === want[j0]);
          $$('.otile').forEach((b) => b.classList.toggle('hint', +b.dataset.k === k0));
          $$('.oslot').forEach((s) => s.classList.toggle('next', +s.dataset.j === j0));
          $('#fb').innerHTML = '<div class="hint-card">💡 Le mot qui brille va dans la case qui clignote. Écoute la phrase 🔊</div>';
        }
      }
    };
    const win = () => {
      done = true;
      if (!errors) score++;
      $('#slots').innerHTML = `<div class="or-done">${ar(text)}</div>`;
      cheer();
      Voice.say(text).then(() => setTimeout(() => { if (token === stopFlag) { i++; next(); } }, 700));
    };

    $$('.oslot').forEach((s) => s.onclick = () => { if (sel != null) place(sel, +s.dataset.j); });

    // Glisser-déposer au doigt (ou simple toucher = sélection).
    $$('.otile').forEach((b) => {
      b.onpointerdown = (e) => {
        if (done || used[+b.dataset.k]) return;
        e.preventDefault();
        const k = +b.dataset.k, x0 = e.clientX, y0 = e.clientY;
        let ghost = null;
        const move = (ev) => {
          if (!ghost && Math.hypot(ev.clientX - x0, ev.clientY - y0) < 10) return;
          if (!ghost) {
            const r = b.getBoundingClientRect();
            ghost = b.cloneNode(true); ghost.classList.add('ghost');
            ghost.style.width = r.width + 'px';
            document.body.appendChild(ghost);
            b.classList.add('lift');
          }
          ghost.style.left = ev.clientX + 'px'; ghost.style.top = ev.clientY + 'px';
          $$('.oslot').forEach((s) => s.classList.remove('over'));
          const over = document.elementFromPoint(ev.clientX, ev.clientY);
          const s = over && over.closest('.oslot');
          if (s) s.classList.add('over');
        };
        const up = (ev) => {
          window.removeEventListener('pointermove', move);
          window.removeEventListener('pointerup', up);
          window.removeEventListener('pointercancel', up);
          $$('.oslot').forEach((s) => s.classList.remove('over'));
          if (!ghost) return select(k); // simple toucher
          ghost.remove(); b.classList.remove('lift');
          const over = document.elementFromPoint(ev.clientX, ev.clientY);
          const s = over && over.closest('.oslot');
          if (s) place(k, +s.dataset.j);
        };
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
        window.addEventListener('pointercancel', up);
      };
    });
  };

  const finish = () => {
    const st = orState();
    st.best[n] = Math.max(st.best[n] || 0, score);
    let extra = '';
    if (score >= OR_PASS && n === st.unlocked && n < OR_LEVELS.length) {
      st.unlocked = n + 1;
      extra = `<div class="panel">🔓 Niveau ${n + 1} débloqué : ${OR_LEVELS[n].label}</div>`;
    } else if (score < OR_PASS) {
      extra = `<div class="panel">Encore un effort : ${OR_PASS} phrases sans erreur pour débloquer le niveau suivant !</div>`;
    }
    save();
    endScreen(score, round.length, { again: 'ordrePlay', againArg: n, extra });
  };
  next();
}
