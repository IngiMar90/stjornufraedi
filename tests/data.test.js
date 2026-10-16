import test from 'node:test';
import { KNOWLEDGE_QUESTIONS } from '../knowledge.js';
import assert from 'node:assert/strict';
import { PLANETS, ACTIVITIES, makeQuestions, orderPool, isDay, groupFor, scoreStars, readProgress } from '../data.js';

test('Eight unique planets in solar order with consistent categories and diameters', () => {
  assert.equal(PLANETS.length, 8);
  assert.equal(new Set(PLANETS.map(p => p.id)).size, 8);
  assert.deepEqual(PLANETS.map(p => p.order), [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.deepEqual(PLANETS.map(p => p.type), ['rock', 'rock', 'rock', 'rock', 'gas', 'gas', 'ice', 'ice']);
  assert.deepEqual([...PLANETS].sort((a, b) => a.diameter - b.diameter).map(p => p.id), ['mercury', 'mars', 'venus', 'earth', 'neptune', 'uranus', 'saturn', 'jupiter']);
});
test('Each difficulty has an appropriate ordering pool', () => {
  for (const [level, size] of [[1, 4], [2, 6], [3, 8]]) {
    assert.equal(orderPool(level).length, size);
    assert.equal(orderPool(level)[0].id, 'mercury');
  }
});
test('Generated quizzes always have one correct option, five distinct targets, and valid answers', () => {
  for (let n = 0; n < 150; n++) for (const level of [1, 2, 3]) for (const kind of ACTIVITIES.map(a => a.id).filter(id => id !== 'order')) {
    const questions = makeQuestions(kind, level);
    const length = kind === 'knowledge' ? 10 : 5;
    assert.equal(questions.length, length);
    assert.equal(new Set(questions.map(q => q.id || q.planet || q.angle)).size, length);
    if (kind === 'identify' || kind === 'clues') {
      const positions = questions.map(q => q.options.indexOf(q.answer));
      assert.equal(new Set(positions).size, level + 1, 'vary the correct answer position across the round');
    }
    for (const q of questions) {
      assert.equal(q.options.filter(id => id === q.answer).length, 1);
      assert.equal(new Set(q.options).size, q.options.length);
      if (kind === 'identify' || kind === 'clues') assert.equal(q.options.length, level + 1);
      if (kind === 'sort') assert.equal(q.answer, groupFor(PLANETS.find(p => p.id === q.planet), level));
      if (kind === 'size') {
        const [a, b] = q.options.map(id => PLANETS.find(p => p.id === id));
        assert.equal(q.answer, a.diameter > b.diameter ? a.id : b.id);
        if (level === 1) assert.ok(Math.max(a.diameter, b.diameter) / Math.min(a.diameter, b.diameter) >= 2);
      }
      if (kind === 'knowledge') {
        assert.equal(q.options.length, level + 1);
        assert.equal(q.labels[q.answer], q.correct);
        assert.equal(new Set(Object.values(q.labels)).size, q.options.length);
        assert.ok(q.hint && q.explanation);
        assert.equal(q.level, level);
      }
      if (kind === 'day') {
        assert.equal(q.answer, isDay(q.angle) ? 'day' : 'night');
        assert.ok(![90, 270].includes(q.angle), 'avoid ambiguous sunrise/sunset positions');
      }
    }
  }
});
test('Day-night matches the lit left hemisphere in the diagram', () => {
  for (const a of [0, 45, 60, 300, 315, 360]) assert.equal(isDay(a), true);
  for (const a of [120, 135, 180, 225, 240]) assert.equal(isDay(a), false);
});
test('Stars reward completion and first-attempt mastery', () => {
  assert.equal(scoreStars(0, 5), 1);
  assert.equal(scoreStars(2, 5), 1);
  assert.equal(scoreStars(3, 5), 2);
  assert.equal(scoreStars(4, 5), 2);
  assert.equal(scoreStars(5, 5), 3);
});
test('Invalid or outdated storage cannot break the app; valid history is capped', () => {
  for (const raw of [null, '{}', 'broken', '{"version":2,"sessions":[]}', '{"version":1,"sessions":[null]}']) {
    assert.deepEqual(readProgress(raw), { version: 1, sessions: [] });
  }
  const good = { kind: 'size', level: 2, correct: 3, total: 5, hints: 1, date: new Date().toISOString() };
  const invalid = [{ ...good, kind: 'unknown' }, { ...good, correct: 6 }, { ...good, date: '<img>' }, { ...good, hints: -1 }];
  assert.deepEqual(readProgress(JSON.stringify({ version: 1, sessions: [...invalid, good] })).sessions, [good]);
  assert.equal(readProgress(JSON.stringify({ version: 1, sessions: Array(350).fill(good) })).sessions.length, 300);
});

test('Planet knowledge bank has 36 unique questions and balances answer positions on every level', () => {
  assert.equal(KNOWLEDGE_QUESTIONS.length, 36);
  assert.equal(new Set(KNOWLEDGE_QUESTIONS.map(q => q.id)).size, 36);
  assert.equal(new Set(KNOWLEDGE_QUESTIONS.map(q => q.stem)).size, 36);
  for (const q of KNOWLEDGE_QUESTIONS) {
    assert.equal(q.wrong.length, 3);
    assert.equal(new Set([q.correct, ...q.wrong]).size, 4);
    assert.ok(q.topic === 'solar-system' || PLANETS.some(p => p.id === q.topic));
  }
  for (const level of [1, 2, 3]) {
    assert.equal(KNOWLEDGE_QUESTIONS.filter(q => q.level === level).length, 12);
    for (let n = 0; n < 100; n++) {
      const round = makeQuestions('knowledge', level);
      const counts = Array(level + 1).fill(0);
      for (const q of round) counts[q.options.indexOf(q.answer)]++;
      assert.ok(Math.max(...counts) - Math.min(...counts) <= 1);
    }
  }
});
