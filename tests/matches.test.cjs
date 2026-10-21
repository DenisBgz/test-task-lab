const { test } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const data = require('../data/matches.json');
const { filterMatches, formatStart, parseMatchesResponse, statusLabel } = require('../.test-dist/matches.js');

test('Все сохраняет каждый матч, порядок и исходный массив', () => {
  const snapshot = JSON.stringify(data);
  assert.deepEqual(filterMatches(data.matches, 'all'), data.matches);
  filterMatches(data.matches, 'upcoming');
  assert.equal(JSON.stringify(data), snapshot);
});

test('Предстоящие включают перенесённый матч без даты, но не live', () => {
  assert.deepEqual(filterMatches(data.matches, 'upcoming').map(m => m.id), ['m5', 'm6', 'm7', 'm8']);
});

test('Завершённые включают нулевую ничью и исключают live', () => {
  const matches = filterMatches(data.matches, 'finished');
  assert.deepEqual(matches.map(m => m.id), ['m1', 'm2', 'm3']);
  assert.deepEqual(matches[1].score, { home: 0, away: 0 });
});

test('Неизвестный статус остаётся во Все и получает русскую подпись', () => {
  const match = { ...data.matches[0], status: 'cancelled' };
  assert.deepEqual(filterMatches([match], 'all'), [match]);
  assert.deepEqual(filterMatches([match], 'upcoming'), []);
  assert.deepEqual(filterMatches([match], 'finished'), []);
  assert.equal(statusLabel(match), 'Статус уточняется');
});

test('Пустые данные допустимы для каждого фильтра', () => {
  assert.deepEqual(parseMatchesResponse({ round: 12, matches: [] }).matches, []);
  for (const filter of ['all', 'upcoming', 'finished']) {
    assert.deepEqual(filterMatches([], filter), []);
  }
});

test('Проверка ответа сохраняет null и 0:0', () => {
  assert.deepEqual(parseMatchesResponse(data), data);
});

test('Некорректный ответ и дубли id дают понятную ошибку', () => {
  for (const value of [null, {}, { round: 12, matches: null },
    { round: 12, matches: [{ ...data.matches[0], home: null }] },
    { round: 12, matches: [data.matches[0], data.matches[0]] },
    { round: 12, matches: [{ ...data.matches[0], score: { home: -1, away: 0 } }] }]) {
    assert.throws(() => parseMatchesResponse(value), /некорректные данные/);
  }
});

test('Отсутствующая или некорректная дата не превращается в 1970 год', () => {
  assert.equal(formatStart(null), 'Дата уточняется');
  assert.equal(formatStart('invalid'), 'Дата уточняется');
});

test('Дата отображается в часовом поясе процесса, включая переход суток', () => {
  const modulePath = require.resolve('../.test-dist/matches.js');
  const script = `process.stdout.write(require(${JSON.stringify(modulePath)}).formatStart('2026-10-11T23:30:00Z'))`;
  const formatIn = (tz) => execFileSync(process.execPath, ['-e', script], {
    env: { ...process.env, TZ: tz }, encoding: 'utf8',
  });
  assert.match(formatIn('UTC'), /11 октября.*23:30/);
  assert.match(formatIn('Europe/Moscow'), /12 октября.*02:30/);
});

test('Текущий матч поддерживает нулевую и неизвестную минуту', () => {
  assert.equal(statusLabel({ ...data.matches[3], minute: 0 }), 'Идёт матч · 0′');
  assert.equal(statusLabel({ ...data.matches[3], minute: undefined }), 'Идёт матч');
});
