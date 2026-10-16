import { KNOWLEDGE_QUESTIONS } from '../knowledge.js';
// Optional UI checks: npm install --no-save playwright && npx playwright install chromium
// Run with: node tests/browser.mjs
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PLANETS, ACTIVITIES, STORAGE_KEY } from '../data.js';

const require = createRequire(import.meta.url);
const { chromium } = process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES ? require(`${process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES}/playwright`) : require('playwright');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const mime = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.jpg': 'image/jpeg' };
const server = createServer(async (req, res) => {
  try {
    // Test at a nested base path, just like GitHub Pages.
    const path = new URL(req.url, 'http://localhost').pathname.replace(/^\/stjornufraedi\//, '');
    const file = resolve(root, path || 'index.html');
    if (!file.startsWith(root + '/')) throw new Error('Invalid path');
    res.writeHead(200, { 'Content-Type': mime[extname(file)] || 'text/plain' });
    res.end(await readFile(file));
  } catch { res.writeHead(404); res.end('Not found'); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}/stjornufraedi/`;
const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH, args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader'] } : {}) });
const context = await browser.newContext({ viewport: { width: 1440, height: 1100 }, acceptDownloads: true });
const page = await context.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
async function click(action, id) { await page.locator(`[data-action="${action}"]${id ? `[data-id="${id}"]` : ''}`).first().click(); }
async function home() { await page.locator('#home-btn').click(); }
async function start(kind, level) {
  await home(); await page.selectOption('#level', String(level));
  await page.locator(`.mission-card[data-id="${kind}"]`).click();
  assert.ok(await page.locator('.step-label').count() >= 2);
  await click('start', kind);
  if (kind === 'order') { assert.equal(await page.locator('.orbit-line').count(), 8); assert.equal(await page.locator('.orbit-drop:not(:disabled)').count(), level === 1 ? 4 : level === 2 ? 6 : 8); }
}
async function correctAnswer(kind) {
  if (kind === 'knowledge') {
    const stem = await page.locator('h1').innerText();
    const correct = KNOWLEDGE_QUESTIONS.find(q => q.stem === stem).correct;
    return page.locator('[data-action="answer"]').evaluateAll((els, text) => els.find(el => el.querySelector('.answer-text').textContent === text).dataset.id, correct);
  }
  if (kind === 'identify' || kind === 'sort') {
    const cls = await page.locator('.question-planet .planet-art').getAttribute('class');
    const p = PLANETS.find(p => cls.split(' ').includes(p.id));
    if (kind === 'identify') return p.id;
    const option = page.locator(`[data-action="answer"][data-id="${p.type}"]`);
    return await option.count() ? p.type : 'giant';
  }
  if (kind === 'clues') {
    const clue = await page.locator('.clue-box').innerText();
    return PLANETS.find(p => p.clues.some(c => clue.includes(c))).id;
  }
  if (kind === 'size') {
    const ids = await page.locator('[data-action="answer"]').evaluateAll(els => els.map(el => el.dataset.id));
    return [...PLANETS].filter(p => ids.includes(p.id)).sort((a, b) => b.diameter - a.diameter)[0].id;
  }
  return (await page.locator('.day-model svg').getAttribute('aria-label')).includes('á upplýstu') ? 'day' : 'night';
}
async function finishQuiz(kind) {
  for (let i = 0; i < (kind === 'knowledge' ? 10 : 5); i++) { await click('answer', await correctAnswer(kind)); await click('next'); }
  assert.match(await page.locator('h1').innerText(), /Vel gert/);
  if (kind === 'knowledge') { await page.locator('.quiz-review summary').click(); assert.equal(await page.locator('.quiz-review li').count(), 10); }
}
async function overflow(label) {
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Horizontal overflow: ${label}`);
}

try {
  await page.goto(base);
  assert.equal(await page.locator('.mission-card').count(), ACTIVITIES.length);
  await page.waitForFunction(() => [...document.images].every(img => img.complete && img.naturalWidth > 0));
  assert.match(await page.evaluate(() => getComputedStyle(document.body).backgroundImage), /starfield\.svg/);
  await page.evaluate(async () => { await Promise.all([...document.images].map(img => img.decode())); });
  await page.screenshot({ path: process.env.UI_SCREENSHOT_DIR ? `${process.env.UI_SCREENSHOT_DIR}/home-desktop.png` : '/tmp/stjornufraedi-desktop.png', fullPage: true });
  for (const level of [1, 2, 3]) for (const a of ACTIVITIES) {
    await start(a.id, level);
    if (a.id === 'order') {
      for (const p of PLANETS.slice(0, level === 1 ? 4 : level === 2 ? 6 : 8)) {
        await click('select-planet', p.id);
        await page.locator(`[data-action="slot"][data-index="${p.order - 1}"]`).click();
      }
      await click('check-order');
    } else await finishQuiz(a.id);
    assert.match(await page.locator('.result-stars').getAttribute('aria-label'), /3 af 3/);
  }
  console.log('PASS: all seven activities completed at all three levels with full credit');

  await start('identify', 2);
  const right = await correctAnswer('identify');
  const wrong = await page.locator(`[data-action="answer"]:not([data-id="${right}"])`).first().getAttribute('data-id');
  await click('answer', wrong);
  assert.match(await page.locator('#feedback').innerText(), /passar ekki/);
  await click('answer', right); await click('next');
  await click('hint');
  await click('answer', await correctAnswer('identify')); await click('next');
  for (let i = 2; i < 5; i++) { await click('answer', await correctAnswer('identify')); await click('next'); }
  assert.match(await page.locator('.result-score').innerText(), /3 af 5/);
  console.log('PASS: wrong answers and hints do not count as first-attempt mastery');

  await start('knowledge', 3);
  assert.equal(await page.locator('.quiz-review').count(), 0);
  assert.equal(await page.locator('[data-action="answer"]').count(), 4);
  const quizRight = await correctAnswer('knowledge');
  const quizWrong = await page.locator(`[data-action="answer"]:not([data-id="${quizRight}"])`).first().getAttribute('data-id');
  await click('answer', quizWrong); await click('answer', quizRight);
  assert.match(await page.locator('#feedback').innerText(), /Rétt!/);
  await click('next'); await click('hint');
  assert.match(await page.locator('#feedback').innerText(), /Vísbending/);
  if (process.env.UI_SCREENSHOT_DIR) await page.screenshot({path:`${process.env.UI_SCREENSHOT_DIR}/knowledge-question.png`,fullPage:true});
  await click('answer', await correctAnswer('knowledge')); await click('next');
  for (let i = 2; i < 10; i++) { await click('answer', await correctAnswer('knowledge')); await click('next'); }
  assert.match(await page.locator('.result-score').innerText(), /8 af 10/);
  await page.locator('.quiz-review summary').click();
  assert.equal(await page.locator('.quiz-review li').count(), 10);
  assert.match(await page.locator('.quiz-review').innerText(), /Fyrsta val þitt/);
  assert.match(await page.locator('.quiz-review').innerText(), /Rétt svar með vísbendingu/);
  if (process.env.UI_SCREENSHOT_DIR) await page.screenshot({path:`${process.env.UI_SCREENSHOT_DIR}/knowledge-answer-key.png`,fullPage:true});
  console.log('PASS: knowledge quiz hints, correction, 10-question score and end-of-round answer key');


  await start('order', 1);
  // Place two planets incorrectly; then correct them without losing earlier history.
  for (const [id, index] of [['venus', 0], ['mercury', 1], ['earth', 2], ['mars', 3]]) {
    await click('select-planet', id); await page.locator(`[data-action="slot"][data-index="${index}"]`).click();
  }
  await click('check-order'); assert.equal(await page.locator('.slot-wrong').count(), 2);
  for (const index of [0, 1]) await page.locator(`[data-action="slot"][data-index="${index}"]`).click();
  for (const p of PLANETS.slice(0, 2)) { await click('select-planet', p.id); await page.locator(`[data-action="slot"][data-index="${p.order - 1}"]`).click(); }
  await click('check-order'); assert.match(await page.locator('.result-score').innerText(), /2 af 4/);
  await page.reload(); await page.locator('#teacher-btn').click();
  assert.equal(await page.locator('tbody tr').count(), ACTIVITIES.length * 3 + 3);
  const downloadPromise = page.waitForEvent('download'); await click('export');
  const download = await downloadPromise;
  assert.match(download.suggestedFilename(), /^stjornufraedi-nidurstodur/);
  const csv = await readFile(await download.path(), 'utf8');
  assert.equal(csv.charCodeAt(0), 0xFEFF); assert.equal(csv.split('\r\n').length, ACTIVITIES.length * 3 + 4);
  await click('reset'); await page.locator('#cancel-reset').click(); assert.equal(await page.locator('tbody tr').count(), ACTIVITIES.length * 3 + 3);
  console.log('PASS: ordering feedback, persistent history, CSV and reset cancellation');

  await start('order', 3);
  await page.evaluate(async () => { await Promise.all([...document.images].map(img => img.decode())); });
  if (process.env.UI_SCREENSHOT_DIR) await page.screenshot({ path: `${process.env.UI_SCREENSHOT_DIR}/orbit-order.png`, fullPage: true });
  await page.locator('[data-action="select-planet"][data-id="mercury"]').dragTo(page.locator('[data-action="slot"][data-index="0"]'));
  assert.match(await page.locator('[data-action="slot"][data-index="0"]').innerText(), /Merkúríus/);
  const touchSource = page.locator('[data-action="select-planet"][data-id="venus"]');
  await touchSource.scrollIntoViewIfNeeded();
  const from = await touchSource.boundingBox(), to = await page.locator('[data-action="slot"][data-index="1"]').boundingBox();
  const pointer = { pointerId: 77, pointerType: 'touch', isPrimary: true, buttons: 1, clientX: from.x + from.width / 2, clientY: from.y + from.height / 2 };
  await touchSource.dispatchEvent('pointerdown', pointer);
  await page.evaluate(({ x, y }) => window.dispatchEvent(new PointerEvent('pointermove', { pointerId: 77, pointerType: 'touch', isPrimary: true, buttons: 1, clientX: x, clientY: y, bubbles: true, cancelable: true })), { x: to.x + to.width / 2, y: to.y + to.height / 2 });
  assert.equal(await page.locator('.drag-planet-ghost').count(), 1);
  assert.equal(await page.locator('.orbit-line.is-over').count(), 1);
  await page.evaluate(({ x, y }) => window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 77, pointerType: 'touch', isPrimary: true, clientX: x, clientY: y, bubbles: true })), { x: to.x + to.width / 2, y: to.y + to.height / 2 });
  assert.match(await page.locator('[data-action="slot"][data-index="1"]').innerText(), /Venus/);
  assert.equal(await page.locator('.drag-planet-ghost').count(), 0);
  console.log('PASS: eight numbered orbits, native mouse drag, touch drag and orbit highlighting');


  for (const width of [360, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 }); await home(); await overflow(`home ${width}`);
    await page.locator('#atlas-btn').click(); await overflow(`atlas ${width}`);
    for (const p of PLANETS) { await click('atlas', p.id); assert.equal(await page.locator('.planet-copy h2').innerText(), p.name); await page.waitForFunction(() => [...document.images].every(img => img.complete && img.naturalWidth > 0)); assert.match(await page.locator('.photo-credit').innerText(), /NASA/); assert.equal(await page.locator('.planet-more').getAttribute('open'), null); await page.locator('.planet-more summary').click(); assert.equal(await page.locator('.planet-longread section').count(), 3); await page.waitForFunction(() => document.querySelector('.more-label').textContent === 'Sýna minna'); await overflow(`expanded ${p.id} ${width}`); if (process.env.UI_SCREENSHOT_DIR && p.id === 'earth' && [360, 1440].includes(width)) await page.screenshot({path: `${process.env.UI_SCREENSHOT_DIR}/planet-reader-${width}.png`, fullPage:true}); await page.locator('.planet-more summary').click(); }
    await page.locator('#teacher-btn').click(); await overflow(`teacher ${width}`);
    for (const a of ACTIVITIES) { await start(a.id, 3); await overflow(`${a.id} ${width}`); }
  }
  await page.setViewportSize({ width: 360, height: 900 }); await home(); await page.locator('#text-btn').click(); await overflow('large type mobile home');
  for (const a of ACTIVITIES) { await start(a.id, 3); await overflow(`large type mobile ${a.id}`); }
  await home();
  await page.evaluate(async () => { await Promise.all([...document.images].map(img => img.decode())); });
  await page.screenshot({ path: process.env.UI_SCREENSHOT_DIR ? `${process.env.UI_SCREENSHOT_DIR}/home-mobile.png` : '/tmp/stjornufraedi-mobile.png', fullPage: true });
  await page.locator('#text-btn').click();
  // Keyboard-only placement is supported using the same buttons as pointer input.
  await start('order', 1);
  await page.locator('[data-action="select-planet"][data-id="mercury"]').focus(); await page.keyboard.press('Enter');
  await page.locator('[data-action="slot"][data-index="0"]').focus(); await page.keyboard.press('Space');
  assert.match(await page.locator('[data-action="slot"][data-index="0"]').innerText(), /Merkúríus/);
  await home(); await page.locator('.mission-card[data-id="day"]').click();
  await page.locator('#rotation').fill('180');
  assert.match(await page.locator('#model-status').innerText(), /Nótt/);
  console.log('PASS: responsive layouts, planet atlas, large text, keyboard placement and rotation slider');

  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload(); await context.setOffline(true); await page.reload();
  assert.equal(await page.locator('.mission-card').count(), ACTIVITIES.length);
  await page.locator('#atlas-btn').click();
  for (const p of PLANETS) { await click('atlas', p.id); await page.waitForFunction(() => [...document.images].every(img => img.complete && img.naturalWidth > 0)); }
  await page.locator('.planet-more summary').click(); assert.equal(await page.locator('.planet-longread section').count(), 3);
  await start('knowledge', 3); await finishQuiz('knowledge');
  await start('day', 1); await finishQuiz('day');
  await context.setOffline(false);
  await page.locator('#teacher-btn').click(); await click('reset'); await page.locator('#confirm-reset').click();
  assert.equal(await page.locator('tbody tr').count(), 0);
  assert.equal(await page.evaluate(k => JSON.parse(localStorage.getItem(k)).sessions.length, STORAGE_KEY), 0);
  console.log('PASS: offline launch and activity, explicit reset');

  const blocked = await browser.newContext();
  await blocked.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage blocked'); } }); });
  const blockedPage = await blocked.newPage(); await blockedPage.goto(base);
  assert.equal(await blockedPage.locator('.mission-card').count(), ACTIVITIES.length);
  assert.match(await blockedPage.locator('.storage-warning').innerText(), /Vistun/);
  await blocked.close();
  assert.deepEqual(errors, []);
  console.log('PASS: blocked storage fallback; no browser runtime errors');
} finally {
  await browser.close(); server.close();
}
