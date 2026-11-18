import assert from 'node:assert/strict';
import { test } from 'node:test';
import { normalizePersonName, personNameMaxLength } from './personName';

test('accepts Unicode letters and common separators in personal names', () => {
  assert.equal(normalizePersonName('  Joa\u0303o   Pedro D’Ávila  '), 'João Pedro D’Ávila');
  assert.equal(normalizePersonName('Ana-Maria'), 'Ana-Maria');
  assert.equal(normalizePersonName("D'Ávila"), "D'Ávila");
  assert.equal(normalizePersonName('李'), '李');
});

test('rejects numbers, symbols, broken separators and non-text metadata', () => {
  for (const invalid of ['', '   ', '123', 'Ana123', 'Ana ٢', 'Ana 🙂', 'Ana@Maria',
    'Ana--Maria', 'Ana-', 'Ana\nMaria', {}, 123, 'A'.repeat(personNameMaxLength + 1)]) {
    assert.equal(normalizePersonName(invalid), null);
  }
});
