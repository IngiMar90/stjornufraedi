import { PLANET_DETAILS } from './planet-details.js';
import { PLANET_IMAGES } from './imagery.js';
import { PLANETS, TYPES, LEVELS, ACTIVITIES, STORAGE_KEY, shuffle, planet, orderPool, isDay, groupFor, makeQuestions, scoreStars, readProgress } from './data.js';

const main = document.querySelector('main');
let progress = { version: 1, sessions: [] };
let level = 1;
let storageOK = true;
try {
  progress = readProgress(localStorage.getItem(STORAGE_KEY));
  level = Number(localStorage.getItem('stjornufraedi-level')) || 1;
  if (![1, 2, 3].includes(level)) level = 1;
  document.body.classList.toggle('large-text', localStorage.getItem('stjornufraedi-large') === 'true');
} catch { storageOK = false; }
let run = null;
let view = 'home';
let noticeTimer;
let focusBack;
let pointerDrag = null;
let suppressPointerClickUntil = 0;

const fmt = n => new Intl.NumberFormat('is-IS').format(n);
function notify(text) {
  const el = document.querySelector('#notice');
  el.textContent = text;
  el.hidden = false;
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => { el.hidden = true; }, 6500);
}
function save(key, value) {
  try { localStorage.setItem(key, value); return true; }
  catch { storageOK = false; notify('Ekki tókst að vista í vafranum. Niðurstöður haldast aðeins meðan forritið er opið.'); return false; }
}
function art(id, size = 90, labelled = false, diameter = false) {
  const p = planet(id), photo = PLANET_IMAGES[id];
  const [x, y, side] = diameter && photo.globeFrame ? photo.globeFrame : photo.frame;
  const style = `width:${photo.width / side * 100}%;left:${-x / side * 100}%;top:${-y / side * 100}%;`;
  return `<span class="planet-art ${id} photo${diameter ? ' diameter-view' : ''}" style="--size:${size}px" ${labelled ? `role="img" aria-label="Geimmynd: ${p.name}"` : 'aria-hidden="true"'}><span class="sphere"></span><span class="photo-window"><img class="planet-photo" src="./assets/planets/${id}.jpg" style="${style}" alt="" draggable="false" decoding="async"></span></span>`;
}
function sun(size = 70) { return `<span class="sun" style="--size:${size}px" aria-hidden="true"></span>`; }
function breadcrumb(label) { return `<button class="back text-button" data-action="home">← Öll verkefni</button><span class="eyebrow">${label}</span>`; }
function readButton() { return `<button class="secondary read-btn" data-action="read">◖)) Lesa upp</button>`; }
function mount(html, current, focus = true) {
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  main.innerHTML = html;
  view = current;
  document.title = `${main.querySelector('h1')?.textContent || 'Stjörnufræði'} · Stjörnufræði`;
  document.querySelectorAll('.nav-button').forEach(b => b.setAttribute('aria-current', (current === 'atlas' && b.id === 'atlas-btn') || (current === 'teacher' && b.id === 'teacher-btn') || (b.id === 'home-btn' && ['home', 'prep', 'game', 'result'].includes(current)) ? 'page' : 'false'));
  if (focus) { main.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: 'instant' }); }
}
function bestStars(kind, atLevel = level) {
  return Math.max(0, ...progress.sessions.filter(s => s.kind === kind && s.level === atLevel).map(s => scoreStars(s.correct, s.total)));
}
function totalStars() { return ACTIVITIES.reduce((sum, a) => sum + [1, 2, 3].reduce((n, l) => n + bestStars(a.id, l), 0), 0); }

function home(focus = true) {
  run = null;
  const completed = ACTIVITIES.filter(a => bestStars(a.id)).length;
  mount(`<section class="hero">
    <div class="hero-copy"><span class="eyebrow"><span class="live-dot"></span> VELKOMIN Í GEIMFERÐ</span><h1>Sólkerfið bíður.<br><span class="mint">Förum að kanna það.</span></h1><p>Raðaðu plánetum, leystu geimgátur og uppgötvaðu heimana átta í kringum sólina.</p><div class="button-row"><button class="primary" data-action="prep" data-id="order">Hefja leiðangur <span aria-hidden="true">↗</span></button><button class="secondary" data-action="atlas">Opna plánetubók</button></div><div class="hero-meta"><span>✦ Á þínum hraða</span><span>◖)) Hægt að lesa upp</span><span>◎ Án innskráningar</span></div></div>
    <div class="hero-scene" aria-hidden="true"><span class="orbit o1"></span><span class="orbit o2"></span><span class="orbit o3"></span><div class="hero-sun">${sun(108)}</div><div class="hero-earth">${art('earth', 58)}</div><div class="hero-saturn">${art('saturn', 115)}</div><div class="hero-mars">${art('mars', 35)}</div><span class="scene-label label-earth">JÖRÐIN</span><span class="scene-label label-saturn">SATÚRNUS</span><span class="scene-note">Átta plánetur. Ótal uppgötvanir.</span></div>
  </section>
  <section class="journey-strip" aria-label="Árangur"><div><span class="medal" aria-hidden="true">✦</span><span><strong>Þinn leiðangur</strong><small>${completed} af 6 verkefnum prófuð á þessu stigi</small></span></div><div class="mini-progress" aria-hidden="true">${ACTIVITIES.map(a => `<i class="${bestStars(a.id) ? 'done' : ''}"></i>`).join('')}</div><span class="star-count">★ ${totalStars()} <small>/ 54 stjörnur</small></span></section>
  <section aria-labelledby="missions-title"><div class="section-top"><div><span class="eyebrow">LÆRUM MEÐ ÞVÍ AÐ PRÓFA</span><h2 id="missions-title">Veldu þitt verkefni</h2></div><label class="level-label" for="level">Erfiðleikastig<select id="level">${LEVELS.map(l => `<option value="${l.id}" ${l.id === level ? 'selected' : ''}>${l.id}. ${l.name}</option>`).join('')}</select></label></div><p class="level-help">${LEVELS[level - 1].text} Engin tímamörk. Þú mátt alltaf reyna aftur.</p><div class="mission-grid">${ACTIVITIES.map((a, i) => `<button class="mission-card ${a.color}" data-action="prep" data-id="${a.id}"><span class="card-top"><span class="mission-icon" aria-hidden="true">${a.icon}</span><span class="card-stars" aria-label="${bestStars(a.id)} af 3 stjörnum">${'★'.repeat(bestStars(a.id))}${'☆'.repeat(3 - bestStars(a.id))}</span></span><small>LEIÐANGUR 0${i + 1} · ${a.skill}</small><h3>${a.title}</h3><p>${a.text}</p><span class="card-bottom">${a.id === 'order' ? `${orderPool(level).length} plánetur` : '5 verkefni'}<span aria-hidden="true">↗</span></span></button>`).join('')}</div></section>
  <section class="atlas-banner"><div class="banner-planets" aria-hidden="true">${art('jupiter', 63)}${art('neptune', 45)}</div><div><span class="eyebrow">FORVITIN/N?</span><h2>Kíktu í plánetubókina</h2><p>Skoðaðu allar átta pláneturnar áður en þú leggur af stað.</p></div><button class="secondary" data-action="atlas">Skoða plánetur →</button></section>${!storageOK ? '<p class="storage-warning">Vistun er ekki tiltæk. Árangur helst aðeins meðan forritið er opið.</p>' : ''}`, 'home', focus);
}

function solarStrip() {
  return `<div class="solar-strip">${sun(46)}<span class="strip-arrow" aria-hidden="true">→</span>${PLANETS.map(p => `<button class="solar-planet" data-action="atlas" data-id="${p.id}" aria-label="${p.order}. ${p.name}">${art(p.id, 38)}<span>${p.name}</span><small>${p.order}</small></button>`).join('')}</div><p class="caption">Röð frá sólinni. Myndir, stærðir og bil eru einfölduð og ekki í réttum hlutföllum.</p>`;
}
function atlas(id = 'earth') {
  run = null;
  const p = planet(id) || PLANETS[2];
  mount(`${breadcrumb('PLÁNETUBÓK')}<div class="page-heading"><div><h1>Kynnumst plánetunum</h1><p>Veldu plánetu til að skoða hana nánar.</p></div>${readButton()}</div>${solarStrip()}<section class="planet-detail readable"><div class="planet-portrait">${art(p.id, 220, true)}<span class="portrait-tag">${p.tag}</span><a class="photo-credit" href="${PLANET_IMAGES[p.id].source}" target="_blank" rel="noopener">Mynd: ${PLANET_IMAGES[p.id].credit} ↗</a></div><div class="planet-copy"><span class="eyebrow">${p.order}. FRÁ SÓLINNI · ${TYPES[p.type]}</span><h2>${p.name}</h2><p class="intro-text">${p.intro}</p><dl class="fact-grid"><div><dt>Þvermál, um það bil</dt><dd>${fmt(p.diameter)} km</dd></div><div><dt>Einn hringur um sólina</dt><dd>${p.year}</dd></div><div><dt>Meðalfjarlægð frá sólu</dt><dd>${p.distance}</dd></div></dl><ul class="fact-list">${p.facts.map(f => `<li>${f}</li>`).join('')}</ul><details class="planet-more"><summary><span class="more-label">Nánar um ${p.name}</span><span class="more-chevron" aria-hidden="true">⌄</span></summary><div class="planet-longread" id="planet-longread"><div class="longread-heading"><span class="eyebrow">FYRIR FORVITNA · Á ÍSLENSKU</span><button class="secondary read-btn" data-action="read-section">◖)) Lesa þennan texta upp</button></div>${PLANET_DETAILS[p.id].map(section => `<section><h3>${section.title}</h3><p>${section.text}</p></section>`).join('')}<p class="reading-source">Unnið á einföldu máli upp úr fræðsluefni NASA. <a href="${p.source}" target="_blank" rel="noopener">Heimild (enska) ↗</a></p></div></details></div></section><div class="info-note"><strong>Sólin er stjarna.</strong> Tunglið er fylgihnöttur jarðar. Plútó er dvergreikistjarna og telst ekki ein af átta plánetunum.</div><div class="button-row end-actions"><button class="primary" data-action="prep" data-id="identify">Prófaðu þekkinguna →</button><button class="secondary" data-action="home">Til baka í verkefni</button></div>`, 'atlas');
  main.querySelector(`[data-id="${p.id}"]`)?.setAttribute('aria-current', 'true');
}

function dayDiagram(angle, interactive = false) {
  const rad = angle * Math.PI / 180;
  const boundary = Math.abs(Math.cos(rad)) < 1e-8;
  const state = boundary ? 'Á mörkum dags og nætur' : isDay(angle) ? 'Dagur á merkta staðnum' : 'Nótt á merkta staðnum';
  const detail = boundary ? 'Staðurinn er á mörkum birtu og skugga: sólarupprás eða sólsetur.' : isDay(angle) ? '☀ Dagur: staðurinn snýr að sólinni.' : '☾ Nótt: staðurinn snýr frá sólinni.';
  const x = 284 - 79 * Math.cos(rad), y = 120 - 79 * Math.sin(rad);
  return `<div class="day-model"><svg viewBox="0 0 430 245" role="img" aria-label="Sól vinstra megin. Vinstri helmingur jarðar er upplýstur. Merkti staðurinn er ${boundary ? 'á mörkum birtu og skugga' : isDay(angle) ? 'á upplýstu hliðinni' : 'í skugga'}."><defs><radialGradient id="solar"><stop stop-color="#ffe5a2"/><stop offset="1" stop-color="#f69a4f"/></radialGradient><linearGradient id="earth-shade"><stop stop-color="#4a9dd2"/><stop offset=".495" stop-color="#347cb7"/><stop offset=".505" stop-color="#13283f"/><stop offset="1" stop-color="#0a192b"/></linearGradient></defs><circle cx="53" cy="120" r="37" fill="url(#solar)"/><g stroke="#f9bd70" stroke-width="2" opacity=".7"><path d="M103 80h70m-70 40h70m-70 40h70"/><path d="m166 75 8 5-8 5m0 30 8 5-8 5m0 30 8 5-8 5"/></g><circle cx="284" cy="120" r="86" fill="url(#earth-shade)" stroke="#6894b5" stroke-width="2"/><ellipse cx="284" cy="120" rx="40" ry="86" fill="none" stroke="#99d9e0" opacity=".25"/><path d="M198 120h172" stroke="#99d9e0" opacity=".25"/><circle cx="${x}" cy="${y}" r="12" fill="#fff" stroke="#0b1425" stroke-width="4"/><circle cx="${x}" cy="${y}" r="4" fill="#eea354"/><text x="53" y="184" text-anchor="middle" fill="#e5eaf2" font-size="16">Sólin</text><text x="284" y="229" text-anchor="middle" fill="#e5eaf2" font-size="16">Jörðin séð ofan frá norðurpól</text></svg><p class="caption">Hvíti punkturinn merkir stað á miðbaug. Einfalt líkan; stærðir og fjarlægðir eru ekki í réttum hlutföllum.</p>${interactive ? `<label class="slider-label" for="rotation">Snúðu jörðinni <output id="rotation-label">${state}</output></label><input id="rotation" type="range" min="0" max="360" value="${angle}" step="5" aria-valuetext="${angle} gráður"><p id="model-status" class="model-status" aria-live="polite">${detail}</p>` : ''}</div>`;
}
function prep(kind) {
  const a = ACTIVITIES.find(a => a.id === kind);
  if (!a) return home();
  run = null;
  const exampleArt = kind === 'order' ? `<div class="order-example">${sun(56)}<span aria-hidden="true">→</span>${art('mercury', 64)}<span>1. Merkúríus</span></div>` : kind === 'day' ? dayDiagram(0, true) : `<div class="example-planets">${art(kind === 'size' ? 'jupiter' : 'earth', 100)}${kind === 'size' ? art('earth', 30) : ''}</div>`;
  mount(`${breadcrumb('UNDIRBÚNINGUR')}<div class="page-heading"><div><span class="eyebrow">STIG ${level} · ${LEVELS[level - 1].name}</span><h1>${a.title}</h1></div>${readButton()}</div><div class="prep-grid"><section class="panel readable"><span class="step-label">1 · STUTT ÚTSKÝRING</span><h2>Gott að vita</h2><p>${a.lesson}</p><span class="step-label">2 · SÝNIDÆMI</span>${exampleArt}<p class="example-answer">${a.example}</p></section><section class="panel start-panel readable"><span class="mission-icon ${a.color}" aria-hidden="true">${a.icon}</span><span class="step-label">3 · NÚ ER RÖÐIN AÐ ÞÉR</span><h2>Þannig virkar það</h2><p>${a.task}</p><ul class="simple-list"><li>✓ ${kind === 'order' ? `${orderPool(level).length} plánetur` : '5 stutt verkefni'}</li><li>✓ Engin tímamörk</li><li>✓ Hægt að fá vísbendingu</li></ul><button class="primary wide" data-action="start" data-id="${kind}">Ég er tilbúin/n →</button></section></div>`, 'prep');
}

function start(kind) {
  if (!ACTIVITIES.some(a => a.id === kind)) return;
  run = { kind, level, index: 0, correct: 0, hints: 0, answered: false, tried: false, assisted: false, hintCount: 0, wrong: [], saved: false, feedback: '' };
  if (kind === 'order') {
    run.pool = shuffle(orderPool(level)); run.slots = Array(run.pool.length).fill(null); run.selected = null; run.first = Array(run.pool.length).fill(null); run.helpedSlots = new Set(); run.checked = false;
  } else run.questions = makeQuestions(kind, level);
  renderGame();
}
function optionText(id) { return TYPES[id] || ({ day: 'Dagur', night: 'Nótt' })[id] || planet(id)?.name || ''; }
function questionTitle(q) {
  if (run.kind === 'identify') return 'Hvaða pláneta er þetta?';
  if (run.kind === 'clues') return 'Hvaða pláneta er ég?';
  if (run.kind === 'sort') return `Í hvaða flokk fer ${planet(q.planet).name}?`;
  if (run.kind === 'size') return 'Hvor plánetan er stærri?';
  return 'Er dagur eða nótt á merkta staðnum?';
}
function gameTop(total) {
  const a = ACTIVITIES.find(a => a.id === run.kind);
  return `${breadcrumb(`STIG ${run.level} · ${a.title}`)}<div class="game-top"><span>${run.kind === 'order' ? 'Raðaðu frá sólinni og út' : `Verkefni ${run.index + 1} af ${total}`}</span><span>✦ ${run.kind === 'order' ? 'Taktu þér tíma' : 'Þú ert á réttri leið'}</span></div><div class="progress-track" role="progressbar" aria-label="Framvinda verkefnis" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${run.kind === 'order' ? run.slots.filter(Boolean).length : run.index}"><span style="width:${(run.kind === 'order' ? run.slots.filter(Boolean).length : run.index) / total * 100}%"></span></div>`;
}
function renderGame(focus = true) {
  if (!run) return home();
  if (run.kind === 'order') return renderOrder(focus);
  const q = run.questions[run.index], p = planet(q.planet);
  let visual = '';
  if (run.kind === 'identify') visual = `<div class="question-planet" role="img" aria-label="Ónefnd pláneta. Skoðaðu lit og einkenni myndarinnar.">${art(p.id, 170)}</div><p class="caption">Geimmynd. Veldu heiti sem passar við myndina.</p>`;
  if (run.kind === 'clues') {
    const visible = Math.min(3, (run.level === 1 ? 2 : 1) + run.hintCount);
    visual = `<div class="clue-box"><span class="clue-icon" aria-hidden="true">✧</span>${p.clues.slice(0, visible).map((c, i) => `<p><span>${i + 1}</span> „${c}“</p>`).join('')}</div>`;
  }
  if (run.kind === 'sort') visual = `<div class="question-planet">${art(p.id, 145)}<strong>${p.name}</strong></div>`;
  if (run.kind === 'size') visual = `<p class="caption">${run.level === 3 ? 'Myndirnar eru jafn stórar. Berðu saman tölurnar fyrir þvermál.' : 'Útlínur hringjanna sýna þvermál hnattanna í réttum hlutföllum. Hringakerfi eru ekki talin með.'}</p>`;
  if (run.kind === 'day') visual = dayDiagram(q.angle);
  const maxD = run.kind === 'size' ? Math.max(...q.options.map(id => planet(id).diameter)) : 1;
  const options = q.options.map((id, i) => {
    const pl = planet(id);
    let label = optionText(id);
    if (run.kind === 'size') label = `<span class="size-art">${art(id, run.level === 3 ? 100 : 170 * pl.diameter / maxD, false, true)}</span><strong>${pl.name}</strong>${run.level >= 2 ? `<small>Þvermál: um ${fmt(pl.diameter)} km</small>` : ''}`;
    return `<button class="answer ${run.kind === 'size' ? 'size-answer' : ''} ${run.wrong.includes(id) ? 'incorrect' : ''} ${run.answered && id === q.answer ? 'correct' : ''}" data-action="answer" data-id="${id}" ${run.answered || run.wrong.includes(id) ? 'disabled' : ''}><span class="answer-letter" aria-hidden="true">${String.fromCharCode(65 + i)}</span>${label}${run.answered && id === q.answer ? '<span class="answer-check" aria-hidden="true">✓</span>' : ''}</button>`;
  }).join('');
  mount(`${gameTop(5)}<section class="game-panel"><div class="question-heading"><h1>${questionTitle(q)}</h1>${readButton()}</div><div class="readable">${visual}</div><div class="answer-grid ${run.kind === 'size' ? 'size-grid' : ''}" aria-label="Svarmöguleikar">${options}</div><div id="feedback" class="feedback ${run.answered ? 'success' : run.feedback ? 'retry' : ''}" role="status" tabindex="-1">${run.feedback}</div><div class="game-actions">${run.answered ? `<button class="primary" data-action="next">${run.index === 4 ? 'Sjá árangur' : 'Næsta verkefni'} →</button>` : `<button class="secondary" data-action="hint">✧ Fá vísbendingu</button><p>Þú mátt prófa aftur.</p>`}</div></section>`, 'game', focus);
}
function explanation(q) {
  const p = planet(q.answer);
  if (run.kind === 'identify' || run.kind === 'clues') return `${p.name}. ${p.intro}`;
  if (run.kind === 'sort') return `${planet(q.planet).name} er ${optionText(q.answer).toLowerCase()}. ${run.level === 1 ? 'Innri pláneturnar fjórar eru bergplánetur; ytri pláneturnar fjórar eru risaplánetur.' : 'Júpíter og Satúrnus eru gasrisar. Úranus og Neptúnus eru ísrisar.'}`;
  if (run.kind === 'size') return `${p.name} hefur meira þvermál, um ${fmt(p.diameter)} km.`;
  return q.answer === 'day' ? 'Það er dagur. Merkti staðurinn snýr að sólinni.' : 'Það er nótt. Merkti staðurinn snýr frá sólinni og er í skugga.';
}
function answer(id) {
  if (!run || run.kind === 'order' || run.answered) return;
  const q = run.questions[run.index];
  if (!q.options.includes(id) || run.wrong.includes(id)) return;
  if (id === q.answer) {
    if (!run.tried && !run.assisted) run.correct++;
    run.answered = true;
    run.feedback = `✓ Rétt! ${explanation(q)}`;
  } else {
    run.tried = true; run.wrong.push(id);
    run.feedback = 'Þetta passar ekki alveg. Skoðaðu aftur eða fáðu vísbendingu.';
  }
  renderGame(false);
  main.querySelector('#feedback').focus({ preventScroll: true });
}
function hint() {
  if (!run || run.answered) return;
  run.hints++; run.assisted = true; run.hintCount++;
  if (run.kind === 'order') {
    const index = run.slots.findIndex((id, i) => id !== orderPool(run.level)[i].id);
    if (index < 0) { run.feedback = 'Allar pláneturnar virðast vera á réttum stað. Veldu „Athuga röðina“.'; }
    else { run.helpedSlots.add(index); run.feedback = `Vísbending: Á sporbraut ${index + 1} á ${orderPool(run.level)[index].name} að vera.`; }
    renderOrder(false);
  } else {
    const q = run.questions[run.index], p = planet(q.planet);
    if (run.kind === 'identify') run.feedback = `Vísbending: ${p.clues[0]}`;
    if (run.kind === 'clues') run.feedback = run.hintCount >= 2 ? `Vísbending: Skoðaðu ${p.name} í huganum og berðu saman vísbendingarnar.` : 'Ný vísbending birtist hér fyrir ofan.';
    if (run.kind === 'sort') run.feedback = `Vísbending: ${p.name} er ${optionText(groupFor(p, run.level)).toLowerCase()}.`;
    if (run.kind === 'size') run.feedback = `Vísbending: ${planet(q.answer).name} hefur meira þvermál.`;
    if (run.kind === 'day') run.feedback = 'Vísbending: Ljós kemur frá sólinni vinstra megin. Hvíti punkturinn sýnir staðinn. Á upplýstu hliðinni er dagur, í skugganum er nótt.';
    renderGame(false);
  }
  main.querySelector('#feedback')?.focus({ preventScroll: true });
}
function next() {
  if (!run?.answered) return;
  if (run.index === 4) return finish();
  run.index++; run.answered = false; run.tried = false; run.assisted = false; run.hintCount = 0; run.wrong = []; run.feedback = '';
  renderGame();
}

function orbitScene() {
  const angles = [-45, 36, -35, 30, -30, 28, -25, 22];
  const orbits = PLANETS.map((p, i) => {
    const rx = 100 + 55 * i, ry = 65 + 28 * i;
    const cx = 85 + Math.sqrt(rx * rx - ry * ry), angle = angles[i] * Math.PI / 180;
    return { rx, ry, cx, x: cx + rx * Math.cos(angle), y: 280 + ry * Math.sin(angle), active: i < run.slots.length };
  });
  return `<div class="orbit-scroll" tabindex="0" role="region" aria-label="Sólkerfið. Á litlum skjá má fletta til hliðar til að sjá allar sporbrautir."><div class="orbit-board"><span class="orbit-board-title">SÓLKERFIÐ ÞITT</span><svg class="orbit-lines" viewBox="0 0 1000 560" aria-hidden="true">${orbits.map((o, i) => `<ellipse class="orbit-line ${o.active ? 'active-orbit' : 'later-orbit'}" data-orbit="${i}" cx="${o.cx}" cy="280" rx="${o.rx}" ry="${o.ry}"/>`).join('')}</svg><div class="orbit-sun">${sun(88)}<strong>Sólin</strong></div>${orbits.map((o, i) => {
    const id = run.slots[i];
    const status = run.checked && o.active ? id === orderPool(run.level)[i].id ? 'slot-right' : 'slot-wrong' : '';
    return `<button class="order-slot orbit-drop ${id ? 'occupied' : ''} ${status} ${o.active ? '' : 'later-slot'}" data-action="slot" data-index="${i}" style="left:${o.x / 10}%;top:${o.y / 5.6}%" ${o.active ? '' : 'disabled'} aria-label="Sporbraut ${i + 1}${!o.active ? '. Ekki æfð á þessu stigi.' : id ? `: ${planet(id).name}. Veldu til að taka úr sporbraut.` : ': tóm. Settu plánetu hér.'}"><span class="slot-number">${i + 1}</span>${id ? `${art(id, 57)}<strong>${planet(id).name}</strong>` : `<span class="landing-dot" aria-hidden="true"></span><small>${o.active ? 'Sleppa hér' : 'Síðar'}</small>`}</button>`;
  }).join('')}</div></div>`;
}
function renderOrder(focus = true) {
  const used = run.slots.filter(Boolean);
  const scroll = main.querySelector('.orbit-scroll')?.scrollLeft || 0;
  mount(`${gameTop(run.pool.length)}<section class="game-panel orbit-panel"><div class="question-heading"><h1>Settu pláneturnar á rétta sporbraut</h1>${readButton()}</div><p class="readable order-help">Dragðu plánetu á punktinn á réttri sporbraut. Þú getur líka valið plánetu og síðan punkt. ${run.pool.length < 8 ? `Á þessu stigi raðarðu innstu ${run.pool.length} plánetunum; hinar sporbrautirnar bíða.` : 'Raðaðu öllum átta plánetunum frá sólinni og út.'}</p>${orbitScene()}<p class="orbit-scroll-hint">↔ Á litlum skjá má fletta sólkerfinu til hliðar.</p><div class="planet-bank-heading"><h2>Pláneturnar þínar</h2><span>Veldu eða dragðu á sporbraut</span></div><div class="planet-bank" aria-label="Plánetur til að raða">${run.pool.map(p => `<button class="bank-planet ${run.selected === p.id ? 'selected' : ''}" data-action="select-planet" data-id="${p.id}" aria-pressed="${run.selected === p.id}" draggable="${!used.includes(p.id)}" ${used.includes(p.id) ? 'disabled' : ''}>${art(p.id, 55)}<strong>${p.name}</strong></button>`).join('')}</div><div id="feedback" class="feedback ${run.feedback ? 'retry' : ''}" role="status" tabindex="-1">${run.feedback}</div><div class="game-actions"><button class="primary" data-action="check-order">Athuga sporbrautirnar ✓</button><button class="secondary" data-action="hint">✧ Fá vísbendingu</button></div><p class="caption">Sporbrautirnar eru ýktar til að auðvelda röðun. Stærðir og fjarlægðir eru ekki í réttum hlutföllum. Veldu plánetu á sporbraut til að taka hana úr.</p></section>`, 'game', focus);
  main.querySelector('.orbit-scroll').scrollLeft = scroll;
}

function place(index) {
  if (!run || run.kind !== 'order' || index < 0 || index >= run.slots.length) return;
  let status;
  if (run.selected) {
    if (run.slots.includes(run.selected)) return;
    status = `${planet(run.selected).name} sett á sporbraut ${index + 1}.`;
    run.slots[index] = run.selected; run.selected = null;
  } else if (run.slots[index]) {
    status = `${planet(run.slots[index]).name} tekin af sporbraut ${index + 1}.`;
    run.slots[index] = null;
  } else { status = 'Veldu fyrst plánetu neðar á síðunni.'; }
  run.checked = false; run.feedback = status;
  renderOrder(false);
  main.querySelector(`[data-action="slot"][data-index="${index}"]`)?.focus({ preventScroll: true });
}
function checkOrder() {
  if (!run || run.kind !== 'order') return;
  if (run.slots.some(id => !id)) { run.feedback = 'Settu plánetu á hvern virkan punkt áður en þú athugar röðina.'; renderOrder(false); main.querySelector('#feedback').focus(); return; }
  const correct = run.slots.map((id, i) => id === orderPool(run.level)[i].id);
  correct.forEach((right, i) => { if (run.first[i] === null) run.first[i] = right && !run.helpedSlots.has(i); });
  if (correct.every(Boolean)) { run.correct = run.first.filter(Boolean).length; finish(); }
  else { run.checked = true; run.feedback = `✓ ${correct.filter(Boolean).length} af ${correct.length} eru rétt. Sporbrautirnar merktar ✓ eru réttar. Endurskoðaðu hinar.`; renderOrder(false); main.querySelector('#feedback').focus(); }
}
function finish() {
  if (!run || run.saved) return;
  const total = run.kind === 'order' ? run.pool.length : 5;
  const session = { kind: run.kind, level: run.level, correct: run.correct, total, hints: run.hints, date: new Date().toISOString() };
  progress.sessions.push(session); progress.sessions = progress.sessions.slice(-300);
  const persisted = save(STORAGE_KEY, JSON.stringify(progress));
  run.saved = true;
  const stars = scoreStars(run.correct, total);
  const a = ACTIVITIES.find(a => a.id === run.kind);
  mount(`${breadcrumb('LEIÐANGRI LOKIÐ')}<section class="result-panel"><span class="result-icon" aria-hidden="true">✦</span><span class="eyebrow">${a.title} · STIG ${run.level}</span><h1>Vel gert, geimfari!</h1><div class="result-stars" aria-label="${stars} af 3 stjörnum">${'★'.repeat(stars)}<span>${'☆'.repeat(3 - stars)}</span></div><p>Þú kláraðir öll verkefnin.</p><p class="result-score"><strong>${run.correct} af ${total}</strong> rétt í fyrstu tilraun án vísbendingar.</p><p class="caption">Ein stjarna fyrir að klára. Tvær fyrir að minnsta kosti 60% rétt í fyrstu tilraun án vísbendingar. Þrjár fyrir allt rétt í fyrstu tilraun án vísbendingar.</p><p class="save-note">${persisted ? '✓ Árangurinn er vistaður í þessum vafra á þessu tæki.' : 'Árangurinn helst aðeins meðan forritið er opið. Vistun í vafra tókst ekki.'}</p><div class="button-row"><button class="primary" data-action="start" data-id="${run.kind}">Prófa aftur ↻</button><button class="secondary" data-action="home">Velja annað verkefni</button></div></section>`, 'result');
}

function teacher() {
  run = null;
  mount(`${breadcrumb('KENNARASVÆÐI')}<div class="page-heading"><div><h1>Yfirlit yfir leiðangra</h1><p>Árangur í þessum vafra á þessu tæki.</p></div><button class="secondary" data-action="export" ${progress.sessions.length ? '' : 'disabled'}>Sækja niðurstöður (CSV) ↓</button></div><div class="info-note"><strong>Fyrir sameiginleg tæki:</strong> Niðurstöður eru ekki tengdar nafni nemanda og samstillast ekki milli tækja. Sæktu niðurstöður og hreinsaðu árangur áður en annar nemandi tekur við. Kennarasvæðið er opið og hefur engan aðgangskóða.</div><section class="teacher-summary"><div class="panel"><small>LOKNAR LOTUR</small><strong>${progress.sessions.length}</strong></div><div class="panel"><small>STJÖRNUR, BESTI ÁRANGUR Á HVERT STIG</small><strong>${totalStars()} <span>/ 54</span></strong></div><div class="panel"><small>ÁHERSLA</small><strong class="summary-text">Skilningur á eigin hraða</strong></div></section><section class="panel"><h2>Velja erfiðleikastig</h2><div class="level-cards">${LEVELS.map(l => `<button class="level-card ${l.id === level ? 'active' : ''}" data-action="set-level" data-level="${l.id}" aria-pressed="${l.id === level}"><strong>${l.id}. ${l.name}</strong><span>${l.text}</span></button>`).join('')}</div><p>Röðun: 4, 6 eða 8 plánetur. Plánetugreining og geimspæjari: 2, 3 eða 4 svör. Stærðarsamanburður: myndir, myndir með tölum eða tölur með jafn stórum myndum. Dagur og nótt hafa tvö svör á öllum stigum.</p></section><section class="panel history"><h2>Síðustu niðurstöður</h2>${progress.sessions.length ? `<div class="table-scroll"><table><thead><tr><th scope="col">Dagsetning</th><th scope="col">Verkefni</th><th scope="col">Stig</th><th scope="col">Fyrsta tilraun án hjálpar</th><th scope="col">Vísbendingar</th><th scope="col">Stjörnur</th></tr></thead><tbody>${[...progress.sessions].reverse().slice(0, 30).map(s => `<tr><td>${new Date(s.date).toLocaleString('is-IS', { dateStyle: 'short', timeStyle: 'short' })}</td><td>${ACTIVITIES.find(a => a.id === s.kind).title}</td><td>${s.level}</td><td>${s.correct} / ${s.total}</td><td>${s.hints}</td><td>${scoreStars(s.correct, s.total)} / 3</td></tr>`).join('')}</tbody></table></div><p class="caption">Sýnir síðustu 30 lotur. CSV-skráin inniheldur allar vistaðar lotur, að hámarki 300.</p>` : '<p class="empty-state">Engum leiðangri er lokið enn. Niðurstöður birtast hér þegar verkefni er klárað.</p>'}</section><section class="panel teacher-tips"><h2>Hugmynd að kennslustund</h2><p>Byrjið saman í plánetubókinni. Skoðið tvær til fjórar plánetur, prófið röðun og veljið svo eitt annað verkefni. Ræðið röng svör og leyfið nemendum að nota vísbendingar.</p><p><strong>Upplestur:</strong> Notar íslenska rödd tækisins þegar hún er til staðar. Aðgengi að röddum fer eftir tæki og vafra. Veldu AA ef nemandi þarf stærra letur.</p><button class="danger" data-action="reset" ${progress.sessions.length ? '' : 'disabled'}>Hreinsa árangur á þessu tæki</button></section>`, 'teacher');
}
function exportCSV() {
  if (!progress.sessions.length) return;
  const quote = v => `"${String(v).replaceAll('"', '""')}"`;
  const rows = [['Dagsetning', 'Verkefni', 'Stig', 'Rétt í fyrstu tilraun án hjálpar', 'Fjöldi verkefna', 'Vísbendingar', 'Stjörnur'], ...progress.sessions.map(s => [s.date, ACTIVITIES.find(a => a.id === s.kind).title, s.level, s.correct, s.total, s.hints, scoreStars(s.correct, s.total)])];
  const blob = new Blob(['\uFEFF' + rows.map(r => r.map(quote).join(';')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = `stjornufraedi-nidurstodur-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function sources() {
  run = null;
  mount(`${breadcrumb('UM FORRITIÐ')}<section class="panel sources"><h1>Stjörnufræði fyrir forvitna nemendur</h1><p>Sex gagnvirkar æfingar og plánetubók á íslensku. Engin tímamörk, engin innskráning og engar auglýsingar. Plánetumyndir eru frá NASA og samstarfsaðilum. Sumar eru samsettar úr mörgum tökum eða með auknum litaskilum til að sýna einkenni. Stjörnubakgrunnurinn er skrautmynd en ekki kort af stjörnuhimninum. Dag- og næturlíkanið er einfölduð teikning.</p><h2>Heimildir og vísindaleg atriði</h2><p>Grunnupplýsingar voru yfirfarnar með fræðsluefni NASA við gerð útgáfunnar. Stærðir og fjarlægðir eru námundaðar. Fjarlægð frá sólu er meðaltal; brautir eru ekki fullkomnir hringir. Nákvæmur fjöldi tungla er ekki gefinn upp þar sem ný tungl finnast.</p><ul>${PLANETS.map(p => `<li><a href="${p.source}" target="_blank" rel="noopener">${p.name} – staðreyndir hjá NASA (enska) ↗</a></li>`).join('')}<li><a href="https://science.nasa.gov/solar-system/planets/" target="_blank" rel="noopener">NASA: Átta plánetur sólkerfisins ↗</a></li></ul><h2>Myndheimildir</h2><ul>${PLANETS.map(p => `<li><a href="${PLANET_IMAGES[p.id].source}" target="_blank" rel="noopener">${p.name}</a>: ${PLANET_IMAGES[p.id].credit}.</li>`).join('')}</ul><h2>Aðgengi og vistun</h2><p>Öll röðunarverkefni má leysa með því að velja eða með lyklaborði. Drag og slepp er viðbót. Tab færir milli hnappa, Enter eða bilslá velur. Engin rétt svör byggja eingöngu á að greina liti.</p><p>Árangur vistast í vafranum. Hægt er að sækja hann sem CSV eða eyða honum á kennarasvæði. Engin nöfn eru skráð og forritið sendir ekki niðurstöður á netþjón. Hýsingaraðili kann að skrá venjulegar heimsóknir á vefinn.</p><p>Forritið reynir að vista kjarnaskrár til notkunar án nets eftir fyrstu heimsókn með nettengingu á HTTPS eða localhost. Upplestur án nets fer eftir röddum tækisins. Ytri NASA-hlekkir þurfa nettengingu.</p><a href="https://github.com/IngiMar90/stjornufraedi" target="_blank" rel="noopener" class="text-link">Skoða verkefnið á GitHub ↗</a></section>`, 'sources');
}

function read(target = null) {
  if (!('speechSynthesis' in window)) { notify('Þessi vafri styður ekki upplestur.'); return; }
  const voice = speechSynthesis.getVoices().find(v => /^is([-_]|$)/i.test(v.lang));
  if (!voice) { notify('Íslensk rödd er ekki tiltæk. Bættu við íslenskri rödd í stillingum tækisins eða notaðu innbyggðan skjálesara.'); return; }
  speechSynthesis.cancel();
  const relevant = target ? target.innerText : view === 'game' ? [main.querySelector('h1')?.textContent, ...[...main.querySelectorAll('.readable, .answer-grid')].map(el => el.innerText)].join('. ') : [...main.querySelectorAll('.readable')].map(el => el.innerText).join('. ');
  const utterance = new SpeechSynthesisUtterance(relevant || main.innerText);
  utterance.lang = 'is-IS'; utterance.voice = voice; utterance.rate = 0.85;
  utterance.onerror = () => notify('Upplestur tókst ekki á þessu tæki.');
  speechSynthesis.speak(utterance);
}
function setLevel(value) {
  if (![1, 2, 3].includes(value)) return;
  level = value; save('stjornufraedi-level', String(value));
  view === 'teacher' ? teacher() : home(false);
}
main.addEventListener('error', event => {
  if (event.target.matches?.('.planet-photo')) event.target.closest('.planet-art').classList.add('photo-failed');
}, true);
main.addEventListener('click', event => {
  if (event.detail > 0 && ['touch', 'pen'].includes(event.pointerType) && performance.now() < suppressPointerClickUntil) return;
  const b = event.target.closest('button[data-action]');
  if (!b || b.disabled) return;
  const action = b.dataset.action, id = b.dataset.id;
  if (action === 'home') home();
  if (action === 'atlas') atlas(id);
  if (action === 'prep') prep(id);
  if (action === 'start') start(id);
  if (action === 'answer') answer(id);
  if (action === 'hint') hint();
  if (action === 'next') next();
  if (action === 'select-planet' && run?.kind === 'order') {
    run.selected = run.selected === id ? null : id;
    run.feedback = run.selected ? `${planet(id).name} valin. Veldu nú sæti.` : 'Valið var tekið af.';
    renderOrder(false);
    main.querySelector(`[data-action="select-planet"][data-id="${id}"]`)?.focus({ preventScroll: true });
  }
  if (action === 'slot') place(Number(b.dataset.index));
  if (action === 'check-order') checkOrder();
  if (action === 'read') read();
  if (action === 'read-section') read(main.querySelector('#planet-longread'));
  if (action === 'set-level') setLevel(Number(b.dataset.level));
  if (action === 'export') exportCSV();
  if (action === 'reset') { focusBack = b; document.querySelector('#confirm-dialog').showModal(); document.querySelector('#cancel-reset').focus(); }
});
main.addEventListener('toggle', e => {
  if (!e.target.matches('.planet-more')) return;
  e.target.querySelector('.more-label').textContent = e.target.open ? 'Sýna minna' : `Nánar um ${main.querySelector('.planet-copy h2').textContent}`;
}, true);
main.addEventListener('change', e => { if (e.target.id === 'level') { setLevel(Number(e.target.value)); main.querySelector('#level')?.focus(); } });
main.addEventListener('input', e => {
  if (e.target.id !== 'rotation') return;
  const angle = Number(e.target.value), model = main.querySelector('.day-model'), day = isDay(angle);
  const holder = document.createElement('div'); holder.innerHTML = dayDiagram(angle);
  model.querySelector('svg').replaceWith(holder.querySelector('svg'));
  const boundary = Math.abs(Math.cos(angle * Math.PI / 180)) < 1e-8;
  model.querySelector('output').textContent = boundary ? 'Á mörkum dags og nætur' : day ? 'Dagur á merkta staðnum' : 'Nótt á merkta staðnum';
  model.querySelector('#model-status').textContent = boundary ? 'Staðurinn er á mörkum birtu og skugga: sólarupprás eða sólsetur.' : day ? '☀ Dagur: staðurinn snýr að sólinni.' : '☾ Nótt: staðurinn snýr frá sólinni.';
  e.target.setAttribute('aria-valuetext', `${angle} gráður`);
});
main.addEventListener('dragstart', e => {
  const b = e.target.closest('[data-action="select-planet"]');
  if (!b || b.disabled || !e.dataTransfer) return;
  e.dataTransfer.setData('text/plain', b.dataset.id); e.dataTransfer.effectAllowed = 'move';
  b.classList.add('is-dragging');
});
main.addEventListener('dragover', e => { const slot = e.target.closest('.order-slot:not(:disabled)'); if (slot) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; highlightOrbit(slot); } else highlightOrbit(null); });
main.addEventListener('dragleave', e => { if (!main.contains(e.relatedTarget)) highlightOrbit(null); });
main.addEventListener('dragend', () => { highlightOrbit(null); main.querySelector('.is-dragging')?.classList.remove('is-dragging'); });
main.addEventListener('drop', e => {
  const slot = e.target.closest('.order-slot');
  if (!slot || slot.disabled || run?.kind !== 'order') return;
  e.preventDefault(); const id = e.dataTransfer.getData('text/plain');
  if (!run.pool.some(p => p.id === id) || run.slots.includes(id)) return;
  run.selected = id; place(Number(slot.dataset.index));
});
function highlightOrbit(slot) {
  main.querySelectorAll('.is-over').forEach(el => el.classList.remove('is-over'));
  if (!slot || slot.disabled) return;
  slot.classList.add('is-over');
  main.querySelector(`[data-orbit="${slot.dataset.index}"]`)?.classList.add('is-over');
}
function endPointerDrag() {
  pointerDrag?.ghost?.remove();
  pointerDrag?.source?.classList.remove('is-dragging');
  pointerDrag = null;
  highlightOrbit(null);
}
main.addEventListener('pointerdown', e => {
  if (!['touch', 'pen'].includes(e.pointerType) || run?.kind !== 'order') return;
  const source = e.target.closest('.bank-planet:not(:disabled)');
  if (!source) return;
  pointerDrag = { id: source.dataset.id, pointerId: e.pointerId, x: e.clientX, y: e.clientY, source, ghost: null };
});
window.addEventListener('pointermove', e => {
  const drag = pointerDrag;
  if (!drag || drag.pointerId !== e.pointerId || run?.kind !== 'order') return;
  if (!drag.ghost && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 10) return;
  e.preventDefault();
  if (!drag.ghost) {
    drag.ghost = document.createElement('div');
    drag.ghost.className = 'drag-planet-ghost'; drag.ghost.setAttribute('aria-hidden', 'true');
    drag.ghost.innerHTML = `${art(drag.id, 64)}<strong>${planet(drag.id).name}</strong>`;
    document.body.append(drag.ghost); drag.source.classList.add('is-dragging');
  }
  drag.ghost.style.left = `${e.clientX}px`; drag.ghost.style.top = `${e.clientY}px`;
  highlightOrbit(document.elementFromPoint(e.clientX, e.clientY)?.closest('.orbit-drop:not(:disabled)'));
}, { passive: false });
window.addEventListener('pointerup', e => {
  const drag = pointerDrag;
  if (!drag || drag.pointerId !== e.pointerId) return;
  const wasDragging = Boolean(drag.ghost), id = drag.id;
  const slot = document.elementFromPoint(e.clientX, e.clientY)?.closest('.orbit-drop:not(:disabled)');
  const index = slot ? Number(slot.dataset.index) : -1;
  endPointerDrag();
  if (!wasDragging || run?.kind !== 'order') return;
  suppressPointerClickUntil = performance.now() + 500;
  run.selected = id;
  if (index >= 0) place(index);
  else { run.feedback = 'Slepptu plánetunni á merktan punkt. Þú getur líka valið punkt með því að ýta á hann.'; renderOrder(false); }
});
window.addEventListener('pointercancel', endPointerDrag);
document.querySelector('.brand').addEventListener('click', e => { e.preventDefault(); home(); });
document.querySelector('#home-btn').onclick = () => home();
document.querySelector('#atlas-btn').onclick = () => atlas();
document.querySelector('#teacher-btn').onclick = teacher;
document.querySelector('#sources-btn').onclick = sources;
document.querySelector('#text-btn').onclick = () => {
  const large = document.body.classList.toggle('large-text'); save('stjornufraedi-large', String(large));
  document.querySelector('#text-btn').setAttribute('aria-pressed', String(large));
  document.querySelector('#text-btn').setAttribute('aria-label', large ? 'Nota venjulega leturstærð' : 'Stækka letur');
};
document.querySelector('#text-btn').setAttribute('aria-pressed', String(document.body.classList.contains('large-text')));
document.querySelector('#fullscreen-btn').onclick = async () => {
  try { if (document.fullscreenElement) await document.exitFullscreen(); else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen(); else notify('Vafrinn styður ekki að fylla skjá.'); }
  catch { notify('Ekki tókst að fylla skjá í þessum vafra.'); }
};
document.querySelector('#cancel-reset').onclick = () => { document.querySelector('#confirm-dialog').close(); focusBack?.focus(); };
document.querySelector('#confirm-reset').onclick = () => {
  progress = { version: 1, sessions: [] }; save(STORAGE_KEY, JSON.stringify(progress));
  document.querySelector('#confirm-dialog').close(); teacher(); notify('Niðurstöður hafa verið hreinsaðar.');
};
home(false);
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
  navigator.serviceWorker.register('./sw.js').catch(() => { /* App remains usable online. */ });
}
