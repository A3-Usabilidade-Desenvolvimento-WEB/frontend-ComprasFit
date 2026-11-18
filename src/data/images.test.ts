import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

test('cada foto do catálogo corresponde ao ID da receita e tem conteúdo exclusivo', () => {
  // No Expo, Metro resolve as importações de imagens. Aqui precisamos do caminho do JPG.
  const asFile = (module: NodeModule, filename: string) => { module.exports = filename; };
  require.extensions['.jpg'] = asFile;
  require.extensions['.png'] = asFile;
  const { recipePhotos } = require('./images') as typeof import('./images');
  const directory = path.resolve(__dirname, '../../assets/recipes');
  const files = readdirSync(directory).filter(name => name.endsWith('.jpg')).sort();
  assert.ok(files.length > 0);
  assert.deepEqual(Object.keys(recipePhotos).map(id => id + '.jpg').sort(), files);
  const hashes = new Set<string>();
  for (const [id, photo] of Object.entries(recipePhotos)) {
    assert.equal(photo?.source, path.join(directory, id + '.jpg'));
    const digest = createHash('sha256').update(readFileSync(path.join(directory, id + '.jpg'))).digest('hex');
    assert.ok(!hashes.has(digest), `Imagem repetida para ${id}`);
    hashes.add(digest);
  }
});
