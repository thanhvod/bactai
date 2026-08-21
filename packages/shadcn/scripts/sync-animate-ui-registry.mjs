#!/usr/bin/env node
/**
 * Downloads all Animate UI registry items from https://animate-ui.com/r/registry.json
 * and writes files under packages/shadcn/src (same layout as shadcn CLI).
 *
 * Usage: node scripts/sync-animate-ui-registry.mjs
 */
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_ROOT = path.resolve(__dirname, '../src');
const REGISTRY_URL = 'https://animate-ui.com/r/registry.json';
const CONCURRENCY = 16;

/** Do not overwrite — project-specific shadcn wrappers */
const SKIP_TARGETS = new Set(['components/ui/button.tsx']);

function getJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(
        url,
        { headers: { 'User-Agent': 'wes-shadcn-sync/1.0' } },
        (res) => {
          if (res.statusCode === 301 || res.statusCode === 302) {
            const loc = res.headers.location;
            res.resume();
            if (!loc) return reject(new Error('Redirect without location'));
            return getJson(new URL(loc, url).href).then(resolve, reject);
          }
          let data = '';
          res.on('data', (c) => (data += c));
          res.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              reject(new Error(`Invalid JSON from ${url}: ${e.message}`));
            }
          });
        },
      )
      .on('error', reject);
  });
}

async function chunkPool(items, size, fn) {
  for (let i = 0; i < items.length; i += size) {
    const chunk = items.slice(i, i + size);
    await Promise.all(chunk.map(fn));
  }
}

async function main() {
  console.log('Fetching', REGISTRY_URL);
  const registry = await getJson(REGISTRY_URL);
  const names = (registry.items || [])
    .filter((it) =>
      ['registry:ui', 'registry:hook', 'registry:lib'].includes(it.type),
    )
    .map((it) => it.name);

  console.log('Registry items to fetch:', names.length);

  const allDeps = new Set();
  const written = new Map(); // target -> last source name
  const conflicts = [];

  await chunkPool(names, CONCURRENCY, async (name) => {
    let item;
    try {
      item = await getJson(`https://animate-ui.com/r/${name}.json`);
    } catch (e) {
      console.error(`FAIL ${name}:`, e.message);
      return;
    }
    for (const d of item.dependencies || []) allDeps.add(d);
    for (const d of item.devDependencies || []) allDeps.add(d);

    for (const file of item.files || []) {
      const { target, content } = file;
      if (!target || content == null) continue;
      if (SKIP_TARGETS.has(target)) {
        console.warn('SKIP (protected):', target);
        continue;
      }
      const prev = written.get(target);
      if (prev && prev !== name) {
        conflicts.push({ target, a: prev, b: name });
      }
      written.set(target, name);

      const abs = path.join(SRC_ROOT, target);
      await fs.promises.mkdir(path.dirname(abs), { recursive: true });
      await fs.promises.writeFile(abs, content, 'utf8');
    }
  });

  if (conflicts.length) {
    console.warn(
      '\nSame path from multiple registry items (last write wins):',
      conflicts.length,
    );
    for (const c of conflicts.slice(0, 20)) {
      console.warn(`  ${c.target}: ${c.a} vs ${c.b}`);
    }
    if (conflicts.length > 20) console.warn('  ...');
  }

  console.log('\nUnique dependency names mentioned by items:', allDeps.size);
  console.log([...allDeps].sort().join('\n'));

  console.log('\nDone. Files written under', SRC_ROOT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
