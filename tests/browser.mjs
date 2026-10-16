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
const mime = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
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
}
async function correctAnswer(kind) {
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
  for (let i = 0; i < 5; i++) { await click('answer', await correctAnswer(kind)); await click('next'); }
  assert.match(await page.locator('h1').innerText(), /Vel gert/);
}
async function overflow(label) {
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Horizontal overflow: ${label}`);
}

try {
  await page.goto(base);
  assert.equal(await page.locator('.mission-card').count(), 6);
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
  console.log('PASS: all six activities completed at all three levels with full credit');

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
  assert.equal(await page.locator('tbody tr').count(), 20);
  const downloadPromise = page.waitForEvent('download'); await click('export');
  const download = await downloadPromise;
  assert.match(download.suggestedFilename(), /^stjornufraedi-nidurstodur/);
  const csv = await readFile(await download.path(), 'utf8');
  assert.equal(csv.charCodeAt(0), 0xFEFF); assert.equal(csv.split('\r\n').length, 21);
  await click('reset'); await page.locator('#cancel-reset').click(); assert.equal(await page.locator('tbody tr').count(), 20);
  console.log('PASS: ordering feedback, persistent history, CSV and reset cancellation');

  for (const width of [360, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 }); await home(); await overflow(`home ${width}`);
    await page.locator('#atlas-btn').click(); await overflow(`atlas ${width}`);
    for (const p of PLANETS) { await click('atlas', p.id); assert.equal(await page.locator('.planet-copy h2').innerText(), p.name); }
    await page.locator('#teacher-btn').click(); await overflow(`teacher ${width}`);
    for (const a of ACTIVITIES) { await start(a.id, 3); await overflow(`${a.id} ${width}`); }
  }
  await page.setViewportSize({ width: 360, height: 900 }); await home(); await page.locator('#text-btn').click(); await overflow('large type mobile home');
  for (const a of ACTIVITIES) { await start(a.id, 3); await overflow(`large type mobile ${a.id}`); }
  await home();
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
  assert.equal(await page.locator('.mission-card').count(), 6);
  await start('day', 1); await finishQuiz('day');
  await context.setOffline(false);
  await page.locator('#teacher-btn').click(); await click('reset'); await page.locator('#confirm-reset').click();
  assert.equal(await page.locator('tbody tr').count(), 0);
  assert.equal(await page.evaluate(k => JSON.parse(localStorage.getItem(k)).sessions.length, STORAGE_KEY), 0);
  console.log('PASS: offline launch and activity, explicit reset');

  const blocked = await browser.newContext();
  await blocked.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage blocked'); } }); });
  const blockedPage = await blocked.newPage(); await blockedPage.goto(base);
  assert.equal(await blockedPage.locator('.mission-card').count(), 6);
  assert.match(await blockedPage.locator('.storage-warning').innerText(), /Vistun/);
  await blocked.close();
  assert.deepEqual(errors, []);
  console.log('PASS: blocked storage fallback; no browser runtime errors');
} finally {
  await browser.close(); server.close();
}
