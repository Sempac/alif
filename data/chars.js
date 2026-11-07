// Personnages dessinés en entier (SVG), utilisés dans les scènes :
//   "@nom:pose:humeur+ailes x y taille animation"  (y = position des pieds, en %)
// Poses : stand, walk, wave, point, give, happy, scared, sad, carry, pull, ride, fall, swim, fly
// Humeurs : smile (défaut), o (surpris), sad, angry
window.Chars = (() => {
  const PEOPLE = {
    zeydoune: { type: 'kid', skin: '#e8b48a', hair: 'short', hairC: '#2b1d14', top: '#3a7bd5', bottom: '#2d3e50' },
    ali: { type: 'kid', skin: '#c68b5e', hair: 'curly', hairC: '#1b120c', top: '#2fa84f', bottom: '#4a4a4a' },
    joha: { type: 'man', skin: '#d9a57a', head: 'turban', headC: '#ffffff', beard: '#9a9a9a', robe: '#8b5a2b', sash: '#e0c27a' },
    johason: { type: 'kid', skin: '#d9a57a', head: 'cap', headC: '#ffffff', robe: '#e6d3a3', bottom: '#e6d3a3' },
    sindbad: { type: 'man', skin: '#d39a6a', head: 'turban', headC: '#e8572a', jewel: true, beard: '#2a1a10', robe: '#2e5fa8', sash: '#f2c14e' },
    sailor: { type: 'man', skin: '#c68b5e', head: 'cap', headC: '#c0392b', beard: '#3b2a1a', robe: '#6d8f3c', sash: '#3b2a1a' },
    king: { type: 'man', skin: '#d39a6a', head: 'crown', headC: '#f2c14e', beard: '#3b2a1a', robe: '#7b3fa0', sash: '#f2c14e' },
    daedalus: { type: 'man', skin: '#e0b08a', head: 'bald', hairC: '#eeeeee', beard: '#eeeeee', robe: '#f4f1e8', sash: '#3a6fb0' },
    icarus: { type: 'kid', skin: '#e8b48a', hair: 'curly', hairC: '#6b4423', robe: '#f4f1e8', short: true, sash: '#3a6fb0' },
    man: { type: 'man', skin: '#c68b5e', head: 'turban', headC: '#d9c9a3', beard: '#3b2a1a', robe: '#5b7f8f', sash: '#3b2a1a' },
    woman: { type: 'man', skin: '#d9a57a', head: 'scarf', headC: '#b5446e', robe: '#e08a3c', sash: '#b5446e' },
    mother: { type: 'man', skin: '#c68b5e', head: 'scarf', headC: '#6d4c8f', robe: '#3b6e8f', sash: '#6d4c8f' },
    girl: { type: 'kid', skin: '#d9a57a', head: 'scarf', headC: '#5b9bd5', robe: '#f2c14e', bottom: '#f2c14e' },
    sheikh: { type: 'man', skin: '#d9a57a', head: 'turban', headC: '#ffffff', beard: '#eeeeee', robe: '#f4f1e8', sash: '#8b5a2b' },
    father: { type: 'man', skin: '#d39a6a', head: 'cap', headC: '#ffffff', beard: '#2a1a10', robe: '#4f6d3a', sash: '#2a1a10' },
    son1: { type: 'kid', skin: '#d39a6a', hair: 'short', hairC: '#1b120c', top: '#c0392b', bottom: '#4a4a4a' },
    son2: { type: 'kid', skin: '#d39a6a', hair: 'curly', hairC: '#2b1d14', top: '#f2a93b', bottom: '#2d3e50' },
    son3: { type: 'kid', skin: '#d39a6a', head: 'cap', headC: '#ffffff', robe: '#8fb8de', bottom: '#8fb8de' },
    boy: { type: 'kid', skin: '#e0b08a', head: 'cap', headC: '#ffffff', robe: '#a3c4e6', bottom: '#a3c4e6' },
    robber: { type: 'man', skin: '#b07a50', head: 'turban', headC: '#2b2b2b', beard: '#1b120c', robe: '#4a3b2a', sash: '#8b1e1e' },
    chief: { type: 'man', skin: '#b07a50', head: 'turban', headC: '#8b1e1e', beard: '#1b120c', robe: '#2b2b2b', sash: '#f2c14e' },
  };

  // a = [bras gauche, bras droit] (0 = le long du corps, 180 = levé), l = jambes, rot = corps penché
  const POSES = {
    stand: { a: [12, -12], l: [0, 0] },
    walk: { a: [20, -20], l: [0, 0], cls: 'walking' },
    wave: { a: [12, -150], l: [0, 0], cls: 'waving' },
    point: { a: [12, -80], l: [0, 0] },
    give: { a: [12, -55], l: [0, 0] },
    happy: { a: [145, -145], l: [8, -8] },
    scared: { a: [160, -160], l: [10, -10], mood: 'o' },
    sad: { a: [5, -5], l: [0, 0], mood: 'sad' },
    carry: { a: [170, -170], l: [6, -6] },
    pull: { a: [-70, -85], l: [12, -6], rot: -14 },
    ride: { a: [20, -20], l: [55, -55] },
    fall: { a: [150, -120], l: [25, -35], rot: -70, mood: 'o' },
    swim: { a: [165, -165], l: [10, -10], rot: 80 },
    fly: { a: [95, -95], l: [6, -6] },
  };

  const dark = '#3a1f14';

  function head(d, g, mood) {
    const { cx, hy, r } = g;
    let back = '', front = '';
    if (d.hair === 'short') back += `<circle cx="${cx}" cy="${hy - 3}" r="${r + 2}" fill="${d.hairC}"/>`;
    if (d.hair === 'curly') {
      for (let k = -3; k <= 3; k++) back += `<circle cx="${cx + k * r * 0.32}" cy="${hy - r * 0.75 + Math.abs(k) * 2.5}" r="${r * 0.38}" fill="${d.hairC}"/>`;
    }
    if (d.head === 'scarf') {
      back += `<circle cx="${cx}" cy="${hy}" r="${r + 6}" fill="${d.headC}"/>
        <path d="M${cx - r - 6} ${hy} L${cx - r - 2} ${hy + r + 18} L${cx + r + 2} ${hy + r + 18} L${cx + r + 6} ${hy} Z" fill="${d.headC}"/>`;
    }
    let face = `<circle cx="${cx}" cy="${hy}" r="${r}" fill="${d.skin}"/>`;
    if (d.head === 'bald') face += `<ellipse cx="${cx - r * 0.95}" cy="${hy - 1}" rx="${r * 0.22}" ry="${r * 0.4}" fill="${d.hairC}"/><ellipse cx="${cx + r * 0.95}" cy="${hy - 1}" rx="${r * 0.22}" ry="${r * 0.4}" fill="${d.hairC}"/>`;
    if (d.beard) {
      face += `<path d="M${cx - r * 0.92} ${hy + 1} Q${cx - r * 0.9} ${hy + r * 1.5} ${cx} ${hy + r * 1.6} Q${cx + r * 0.9} ${hy + r * 1.5} ${cx + r * 0.92} ${hy + 1} Q${cx} ${hy + r * 0.75} ${cx - r * 0.92} ${hy + 1} Z" fill="${d.beard}"/>`;
    } else {
      face += `<circle cx="${cx - r * 0.6}" cy="${hy + r * 0.32}" r="${r * 0.17}" fill="#ff7a7a" opacity=".35"/><circle cx="${cx + r * 0.6}" cy="${hy + r * 0.32}" r="${r * 0.17}" fill="#ff7a7a" opacity=".35"/>`;
    }
    // Yeux
    const ey = hy - r * 0.08, ex = r * 0.38;
    face += `<circle cx="${cx - ex}" cy="${ey}" r="${r * 0.13}" fill="${dark}"/><circle cx="${cx + ex}" cy="${ey}" r="${r * 0.13}" fill="${dark}"/>`;
    if (mood === 'angry') face += `<path d="M${cx - ex - 5} ${ey - 7} L${cx - ex + 4} ${ey - 4} M${cx + ex + 5} ${ey - 7} L${cx + ex - 4} ${ey - 4}" stroke="${dark}" stroke-width="2.4" stroke-linecap="round"/>`;
    if (mood === 'sad') face += `<path d="M${cx - ex - 5} ${ey - 4} L${cx - ex + 4} ${ey - 7} M${cx + ex + 5} ${ey - 4} L${cx + ex - 4} ${ey - 7}" stroke="${dark}" stroke-width="2" stroke-linecap="round"/>`;
    // Bouche
    const my = hy + r * 0.45, mc = d.beard ? '#fff2e6' : dark;
    if (mood === 'o') face += `<ellipse cx="${cx}" cy="${my + 1}" rx="${r * 0.18}" ry="${r * 0.24}" fill="${d.beard ? '#5a1f1f' : dark}"/>`;
    else if (mood === 'sad' || mood === 'angry') face += `<path d="M${cx - r * 0.3} ${my + 3} Q${cx} ${my - 2} ${cx + r * 0.3} ${my + 3}" stroke="${mc}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
    else face += `<path d="M${cx - r * 0.32} ${my} Q${cx} ${my + r * 0.32} ${cx + r * 0.32} ${my}" stroke="${mc}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
    // Coiffes
    if (d.head === 'turban') {
      front += `<ellipse cx="${cx}" cy="${hy - r * 0.62}" rx="${r * 1.12}" ry="${r * 0.62}" fill="${d.headC}" stroke="#0002" stroke-width="1.5"/>
        <path d="M${cx - r} ${hy - r * 0.55} Q${cx} ${hy - r * 1.05} ${cx + r} ${hy - r * 0.55}" stroke="#0002" stroke-width="1.5" fill="none"/>`;
      if (d.jewel) front += `<circle cx="${cx}" cy="${hy - r * 0.55}" r="${r * 0.2}" fill="#2ecc71" stroke="#f2c14e" stroke-width="1.5"/><path d="M${cx} ${hy - r * 0.7} q4 -14 12 -18" stroke="#f2c14e" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    }
    if (d.head === 'cap') front += `<path d="M${cx - r * 0.85} ${hy - r * 0.42} A${r * 0.85} ${r * 0.7} 0 0 1 ${cx + r * 0.85} ${hy - r * 0.42} Z" fill="${d.headC}" stroke="#0002" stroke-width="1"/>`;
    if (d.head === 'crown') {
      const b = hy - r * 0.6, t = hy - r * 1.45, m = (b + t) / 2;
      front += `<polygon points="${cx - r * 0.8},${b} ${cx - r * 0.8},${t} ${cx - r * 0.4},${m} ${cx},${t} ${cx + r * 0.4},${m} ${cx + r * 0.8},${t} ${cx + r * 0.8},${b}" fill="${d.headC}" stroke="#c99a1e" stroke-width="1.5" stroke-linejoin="round"/>
        <circle cx="${cx}" cy="${(b + m) / 2}" r="2.5" fill="#e74c3c"/>`;
    }
    return back + face + front;
  }

  function person(d, poseName, mood, wings) {
    const P = POSES[poseName] || POSES.stand;
    mood = mood || P.mood || 'smile';
    const kid = d.type === 'kid';
    const g = kid
      ? { cx: 50, hy: 60, r: 19, sy: 88, sx: 14, hip: 140, leg: 50, arm: 40, top: 82, bot: d.robe ? (d.short ? 146 : 170) : 146, bw: [15, 19] }
      : { cx: 50, hy: 38, r: 16, sy: 64, sx: 17, hip: 140, leg: 50, arm: 50, top: 58, bot: d.short ? 148 : 176, bw: [17, 25] };
    const { cx } = g;
    const legC = d.robe && !d.bottom ? d.skin : (d.bottom || d.skin);
    let s = '';
    // Ailes (Dédale et Icare)
    if (wings) {
      for (const i of [-1, 1]) {
        const wx = cx + i * 46;
        s += `<g><ellipse cx="${wx}" cy="${g.sy + 8}" rx="40" ry="15" fill="#fbf4e4" stroke="#d9c7a5" stroke-width="2"/>
          ${[0, 1, 2, 3].map((k) => `<ellipse cx="${wx + i * (k * 9 - 12)}" cy="${g.sy + 18}" rx="7" ry="12" fill="#f1e4c6" stroke="#d9c7a5" stroke-width="1.2"/>`).join('')}</g>`;
      }
    }
    // Jambes
    [-1, 1].forEach((i, k) => {
      const x = cx + i * 6;
      s += `<g class="leg ${k ? 'legR' : 'legL'}" style="transform-origin:${x}px ${g.hip}px" transform="rotate(${P.l[k]})">
        <rect x="${x - 5}" y="${g.hip - 6}" width="10" height="${g.leg + 6}" rx="5" fill="${legC}"/>
        <ellipse cx="${x + i * 2}" cy="${g.hip + g.leg}" rx="8" ry="4.5" fill="#5a3d2b"/></g>`;
    });
    // Corps
    if (d.robe) {
      s += `<path d="M${cx - g.bw[0]} ${g.top} L${cx + g.bw[0]} ${g.top} L${cx + g.bw[1]} ${g.bot} L${cx - g.bw[1]} ${g.bot} Z" fill="${d.robe}" stroke="${d.robe}" stroke-width="8" stroke-linejoin="round"/>`;
    } else {
      s += `<rect x="${cx - 13}" y="${g.hip - 8}" width="26" height="14" rx="5" fill="${d.bottom}"/>
        <rect x="${cx - g.bw[0]}" y="${g.top}" width="${g.bw[0] * 2}" height="${g.hip - g.top}" rx="9" fill="${d.top}"/>`;
    }
    if (d.sash) s += `<rect x="${cx - g.bw[0] - 2}" y="${(kid ? 118 : 112)}" width="${g.bw[0] * 2 + 4}" height="6" rx="3" fill="${d.sash}"/>`;
    s += `<rect x="${cx - 5}" y="${g.hy + g.r - 4}" width="10" height="${g.top - g.hy - g.r + 8}" fill="${d.skin}"/>`;
    // Bras
    const sleeve = d.robe || d.top;
    [-1, 1].forEach((i, k) => {
      const x = cx + i * g.sx, y = g.sy;
      s += `<g class="arm ${k ? 'armR' : 'armL'}" style="transform-origin:${x}px ${y}px" transform="rotate(${P.a[k]})">
        <rect x="${x - 4.5}" y="${y - 4}" width="9" height="${g.arm}" rx="4.5" fill="${sleeve}"/>
        <circle cx="${x}" cy="${y + g.arm}" r="5.5" fill="${d.skin}"/></g>`;
    });
    s += head(d, g, mood);
    const body = P.rot ? `<g transform="rotate(${P.rot} ${cx} ${g.hip})">${s}</g>` : s;
    return { svg: `<svg viewBox="0 0 100 200" class="${P.cls || ''}">${body}</svg>`, ar: 0.5, k: 1 };
  }

  function lion(mood, cls) {
    const c = '#e8a33d', m = '#a0521d';
    const legs = [62, 84, 128, 150].map((x, k) => `<g class="leg ${k % 2 ? 'legR' : 'legL'}" style="transform-origin:${x + 6}px 92px">
      <rect x="${x}" y="88" width="13" height="42" rx="6" fill="${c}"/><ellipse cx="${x + 6}" cy="131" rx="9" ry="5" fill="#c97f22"/></g>`).join('');
    const mouth = mood === 'angry'
      ? '<ellipse cx="50" cy="80" rx="9" ry="7" fill="#7a1f1f"/><path d="M44 75 l3 4 l3 -4 l3 4 l3 -4" fill="#fff"/>'
      : '<path d="M43 78 Q50 84 57 78" stroke="#3a1f14" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
    const brows = mood === 'angry' ? '<path d="M36 52 L47 57 M64 52 L53 57" stroke="#3a1f14" stroke-width="3" stroke-linecap="round"/>' : '';
    return {
      svg: `<svg viewBox="0 0 200 140" class="${cls || ''}">
        <path d="M160 78 Q190 70 186 40" stroke="${c}" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="186" cy="38" r="9" fill="${m}"/>
        ${legs}<ellipse cx="110" cy="80" rx="58" ry="30" fill="${c}"/>
        <circle cx="50" cy="64" r="40" fill="${m}"/>
        ${[0, 1, 2, 3, 4, 5, 6, 7].map((k) => `<circle cx="${50 + 38 * Math.cos(k * Math.PI / 4)}" cy="${64 + 38 * Math.sin(k * Math.PI / 4)}" r="9" fill="${m}"/>`).join('')}
        <circle cx="32" cy="38" r="8" fill="${c}"/><circle cx="68" cy="38" r="8" fill="${c}"/>
        <circle cx="50" cy="66" r="27" fill="#f0b24a"/>
        <circle cx="41" cy="60" r="3.5" fill="#3a1f14"/><circle cx="59" cy="60" r="3.5" fill="#3a1f14"/>${brows}
        <path d="M45 68 L55 68 L50 74 Z" fill="#5a2d14"/>${mouth}</svg>`,
      ar: 200 / 140, k: 0.7,
    };
  }

  function well() {
    return {
      svg: `<svg viewBox="0 0 120 140">
        <rect x="18" y="20" width="7" height="72" fill="#7a4a24"/><rect x="95" y="20" width="7" height="72" fill="#7a4a24"/>
        <polygon points="8,26 60,2 112,26" fill="#a0522d" stroke="#7a3a1d" stroke-width="3" stroke-linejoin="round"/>
        <rect x="24" y="44" width="72" height="5" fill="#7a4a24"/><line x1="60" y1="49" x2="60" y2="70" stroke="#c9a46a" stroke-width="2.5"/>
        <rect x="12" y="80" width="96" height="56" rx="6" fill="#9a9a9a"/>
        <path d="M12 98 H108 M12 117 H108 M40 80 V98 M80 80 V98 M26 98 V117 M60 98 V117 M94 98 V117 M40 117 V136 M80 117 V136" stroke="#7d7d7d" stroke-width="2"/>
        <ellipse cx="60" cy="80" rx="48" ry="11" fill="#bdbdbd"/><ellipse cx="60" cy="80" rx="40" ry="7.5" fill="#1d2a3a"/></svg>`,
      ar: 120 / 140, k: 0.75,
    };
  }

  // Chatte vue de profil, tournée vers la droite. Poses : walk, sit, drink. Humeurs : sad, happy.
  function cat(pose, mood) {
    const c = '#f0a050', st = '#d27a2c', belly = '#fde3c4';
    const sit = pose === 'sit', drink = pose === 'drink';
    const hx = drink ? 128 : 124, hy = drink ? 72 : sit ? 34 : 44;
    const legs = sit
      ? `<ellipse cx="62" cy="98" rx="22" ry="9" fill="${c}"/><rect x="104" y="66" width="11" height="36" rx="5" fill="${c}"/><rect x="92" y="66" width="11" height="36" rx="5" fill="${c}"/>`
      : [48, 64, 98, 114].map((x, k) => `<g class="leg ${k % 2 ? 'legR' : 'legL'}" style="transform-origin:${x + 5}px 70px">
          <rect x="${x}" y="64" width="11" height="38" rx="5" fill="${k < 2 ? st : c}"/></g>`).join('');
    const body = sit
      ? `<ellipse cx="80" cy="70" rx="34" ry="30" fill="${c}"/><ellipse cx="96" cy="74" rx="14" ry="20" fill="${belly}"/>`
      : `<ellipse cx="82" cy="62" rx="48" ry="22" fill="${c}"/><ellipse cx="84" cy="72" rx="30" ry="10" fill="${belly}"/>
         <path d="M66 42 q4 12 0 22 M82 40 q4 12 0 24 M98 42 q4 12 0 22" stroke="${st}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    const ears = mood === 'sad'
      ? `<path d="M${hx - 16} ${hy - 6} l-14 4 l10 -16 Z M${hx + 8} ${hy - 12} l12 -6 l-2 16 Z" fill="${c}"/>`
      : `<path d="M${hx - 16} ${hy - 10} l-2 -20 l16 10 Z M${hx + 4} ${hy - 16} l12 -14 l2 20 Z" fill="${c}"/>
         <path d="M${hx - 14} ${hy - 12} l-1 -11 l8 6 Z M${hx + 6} ${hy - 16} l7 -8 l1 11 Z" fill="#ffb6b6"/>`;
    const eyes = mood === 'happy'
      ? `<path d="M${hx - 9} ${hy - 2} q4 -5 8 0 M${hx + 5} ${hy - 2} q4 -5 8 0" stroke="#3a1f14" stroke-width="2.5" fill="none" stroke-linecap="round"/>`
      : `<ellipse cx="${hx - 5}" cy="${hy - 2}" rx="3.5" ry="5" fill="#2d5a27"/><ellipse cx="${hx + 9}" cy="${hy - 2}" rx="3.5" ry="5" fill="#2d5a27"/>
         <circle cx="${hx - 4}" cy="${hy - 4}" r="1.3" fill="#fff"/><circle cx="${hx + 10}" cy="${hy - 4}" r="1.3" fill="#fff"/>`;
    const tear = mood === 'sad' ? `<path d="M${hx - 6} ${hy + 4} q-3 7 0 9 q3 -2 0 -9" fill="#5dade2"/>` : '';
    return {
      svg: `<svg viewBox="0 0 160 110" class="${pose === 'walk' ? 'walking' : ''}">
        <path class="tail" style="transform-origin:${sit ? 50 : 36}px ${sit ? 90 : 56}px" d="M${sit ? 50 : 36} ${sit ? 92 : 56} Q${sit ? 14 : 8} ${sit ? 96 : 50} ${sit ? 18 : 14} ${sit ? 60 : 18}" stroke="${st}" stroke-width="9" fill="none" stroke-linecap="round"/>
        ${legs}${body}${ears}
        <circle cx="${hx}" cy="${hy}" r="20" fill="${c}"/>
        <ellipse cx="${hx + 4}" cy="${hy + 9}" rx="10" ry="7" fill="${belly}"/>
        ${eyes}${tear}
        <path d="M${hx + 1} ${hy + 5} l6 0 l-3 3.5 Z" fill="#e57373"/>
        <path d="M${hx + 4} ${hy + 9} q-3 4 -6 2 M${hx + 4} ${hy + 9} q3 4 6 2" stroke="#3a1f14" stroke-width="1.6" fill="none" stroke-linecap="round"/>
        <path d="M${hx + 14} ${hy + 6} l14 -3 M${hx + 14} ${hy + 9} l14 2 M${hx - 8} ${hy + 6} l-12 -3 M${hx - 8} ${hy + 9} l-12 2" stroke="#7a5a40" stroke-width="1.2"/>
      </svg>`,
      ar: 160 / 110, k: 0.55,
    };
  }

  // Âne de profil, tourné vers la droite.
  function donkey(cls) {
    const c = '#9e9e9e', d = '#7b7b7b';
    const legs = [42, 60, 112, 130].map((x, k) => `<g class="leg ${k % 2 ? 'legR' : 'legL'}" style="transform-origin:${x + 6}px 84px">
      <rect x="${x}" y="78" width="12" height="52" rx="5" fill="${k < 2 ? d : c}"/><rect x="${x - 1}" y="124" width="14" height="9" rx="3" fill="#4a4a4a"/></g>`).join('');
    return {
      svg: `<svg viewBox="0 0 180 140" class="${cls || ''}">
        <path class="tail" style="transform-origin:34px 62px" d="M34 62 Q18 78 22 104" stroke="${d}" stroke-width="5" fill="none" stroke-linecap="round"/><ellipse cx="22" cy="106" rx="5" ry="8" fill="#555"/>
        ${legs}<ellipse cx="88" cy="70" rx="58" ry="26" fill="${c}"/><ellipse cx="90" cy="82" rx="40" ry="10" fill="#bdbdbd"/>
        <path d="M128 60 Q140 34 150 26 L166 36 Q156 54 146 74 Z" fill="${c}"/>
        <path d="M134 50 Q138 34 150 24" stroke="#555" stroke-width="7" fill="none" stroke-linecap="round"/>
        <ellipse cx="160" cy="44" rx="16" ry="12" transform="rotate(30 160 44)" fill="${c}"/><ellipse cx="168" cy="52" rx="9" ry="8" fill="#d6d6d6"/>
        <circle cx="171" cy="52" r="1.8" fill="#333"/><circle cx="154" cy="38" r="2.6" fill="#222"/>
        <ellipse cx="146" cy="14" rx="5" ry="16" transform="rotate(-12 146 14)" fill="${c}"/><ellipse cx="156" cy="16" rx="5" ry="16" transform="rotate(14 156 16)" fill="${d}"/>
        <path d="M66 46 Q88 40 110 46 L108 58 Q88 52 68 58 Z" fill="#c0392b"/></svg>`,
      ar: 180 / 140, k: 0.7,
    };
  }

  // Décors dessinés derrière la scène (le fond coloré reste celui du CSS).
  function decor(bg) {
    const v = (inner) => `<svg class="decor" viewBox="0 0 800 400" preserveAspectRatio="xMidYMax slice">${inner}</svg>`;
    const bush = (x, y, r, col = '#4caf50') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${col}"/><circle cx="${x + r * 0.8}" cy="${y + r * 0.2}" r="${r * 0.8}" fill="${col}"/><circle cx="${x - r * 0.8}" cy="${y + r * 0.25}" r="${r * 0.75}" fill="${col}"/>`;
    const flower = (x, y, col) => `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + 18}" stroke="#3e8e41" stroke-width="3"/>${[0, 72, 144, 216, 288].map((a) => `<circle cx="${x + 6 * Math.cos(a * Math.PI / 180)}" cy="${y + 6 * Math.sin(a * Math.PI / 180)}" r="5" fill="${col}"/>`).join('')}<circle cx="${x}" cy="${y}" r="4" fill="#ffd54f"/>`;
    const tree = (x, y, h, col) => `<rect x="${x - 8}" y="${y - h * 0.45}" width="16" height="${h * 0.45}" fill="#6d4c2f"/>${bush(x, y - h * 0.62, h * 0.24, col)}`;
    switch (bg) {
      case 'garden':
        return v(`
          <ellipse cx="660" cy="70" rx="60" ry="18" fill="#fff" opacity=".85"/><ellipse cx="200" cy="50" rx="50" ry="14" fill="#fff" opacity=".7"/>
          ${Array.from({ length: 21 }, (_, k) => `<rect x="${k * 40 + 4}" y="196" width="16" height="58" rx="3" fill="#fffaf0" stroke="#d8cfc0"/>`).join('')}
          <rect x="0" y="212" width="800" height="9" fill="#fffaf0" stroke="#d8cfc0"/><rect x="0" y="236" width="800" height="9" fill="#fffaf0" stroke="#d8cfc0"/>
          ${bush(120, 238, 26)}${bush(470, 240, 22, '#43a047')}${bush(720, 236, 28)}
          <path d="M330 400 Q380 320 420 248 L470 248 Q470 320 560 400 Z" fill="#e0c39a"/>
          ${flower(60, 300, '#ff6f91')}${flower(200, 330, '#ba68c8')}${flower(620, 320, '#ff8a65')}${flower(730, 300, '#ff6f91')}${flower(280, 290, '#ffd54f')}`);
      case 'house':
        return v(`
          <rect x="300" y="40" width="200" height="150" rx="8" fill="#9fdcff" stroke="#a0522d" stroke-width="10"/>
          <line x1="400" y1="40" x2="400" y2="190" stroke="#a0522d" stroke-width="7"/><line x1="300" y1="115" x2="500" y2="115" stroke="#a0522d" stroke-width="7"/>
          <path d="M290 30 Q320 120 300 200 L280 200 L280 30 Z M510 30 Q480 120 500 200 L520 200 L520 30 Z" fill="#e57373"/>
          <rect x="0" y="276" width="800" height="8" fill="#a0703f"/>
          <ellipse cx="400" cy="345" rx="250" ry="40" fill="#c0392b" opacity=".55"/><ellipse cx="400" cy="345" rx="200" ry="28" fill="none" stroke="#f5d76e" stroke-width="5" opacity=".7"/>
          <rect x="640" y="150" width="20" height="126" fill="#6d4c2f"/>${bush(650, 140, 30, '#66bb6a')}`);
      case 'forest':
        return v(`${[40, 170, 300, 560, 690].map((x, k) => tree(x, 236, 170 + (k % 2) * 40, '#2e7d32')).join('')}
          ${bush(240, 250, 22, '#388e3c')}${bush(620, 252, 20, '#388e3c')}${flower(120, 320, '#ffd54f')}${flower(500, 340, '#ff8a65')}`);
      case 'night':
        return v(`<path d="M0 300 Q200 250 400 290 T800 280 L800 400 L0 400 Z" fill="#2f4a2a"/>${bush(700, 300, 22, '#24401f')}${bush(90, 305, 18, '#24401f')}`);
      case 'road':
      case 'market':
        return v(`<path d="M0 330 Q400 280 800 330 L800 400 L0 400 Z" fill="#c9a26b"/>${bush(60, 238, 20, '#7cb342')}${bush(740, 236, 24, '#7cb342')}
          ${bg === 'market' ? `<rect x="560" y="150" width="200" height="90" fill="#f6e2b3"/><path d="M550 150 L770 150 L750 115 L570 115 Z" fill="#e74c3c"/><path d="M580 115 l20 35 M620 115 l10 35 M680 115 l-10 35 M720 115 l-20 35" stroke="#fff" stroke-width="10"/>` : ''}`);
      default: return '';
    }
  }

  // spec = "nom:pose:humeur+ailes"
  function render(spec) {
    const wings = spec.includes('+ailes');
    const [name, pose, mood] = spec.replace('+ailes', '').split(':');
    if (name === 'lion') return lion(pose === 'angry' ? 'angry' : mood, pose === 'walk' ? 'walking' : '');
    if (name === 'cat') return cat(pose || 'walk', mood);
    if (name === 'well') return well();
    if (name === 'donkey') return donkey(pose === 'walk' ? 'walking' : '');
    return person(PEOPLE[name] || PEOPLE.man, pose, mood, wings);
  }
  return { render, decor };
})();
