import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from '../server.mjs';

function storedEntries(zip) {
  const entries = new Map();
  let offset = 0;
  while (zip.readUInt32LE(offset) === 0x04034b50) {
    const size = zip.readUInt32LE(offset + 18);
    const nameLength = zip.readUInt16LE(offset + 26);
    const extraLength = zip.readUInt16LE(offset + 28);
    const start = offset + 30 + nameLength + extraLength;
    const name = zip.subarray(offset + 30, offset + 30 + nameLength).toString();
    entries.set(name, zip.subarray(start, start + size).toString());
    offset = start + size;
  }
  assert.equal(zip.readUInt32LE(offset), 0x02014b50);
  return entries;
}

test('submission ZIP contains current answers and runnable source, excluding private data', async () => {
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const endpoint = 'http://127.0.0.1:' + server.address().port + '/api/export';
  try {
    const report = { id: 'zip-test', missions: [{ id: 1, answers: { reasoning: 'Mitt svar' } }] };
    const response = await fetch(endpoint, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({report, html: '<h1>Mitt svar</h1>'}) });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type'), 'application/zip');
    const files = storedEntries(Buffer.from(await response.arrayBuffer()));
    assert.deepEqual(JSON.parse(files.get('rapport/resultat.json')), report);
    assert.equal(files.get('rapport/resultat.html'), '<h1>Mitt svar</h1>');
    assert.ok(files.has('projekt/public/missions/01/app.js'));
    assert.ok(files.has('projekt/server.mjs'));
    assert.ok(files.has('projekt/zip.mjs'));
    assert.ok([...files.keys()].every(name => !/data\/|node_modules\/|\.git\//.test(name)));
    const invalid = await fetch(endpoint, {method:'POST', headers:{'Content-Type':'application/json'}, body:'{}'});
    assert.equal(invalid.status, 422);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
