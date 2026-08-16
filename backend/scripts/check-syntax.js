const { spawnSync } = require('child_process');
const { readdirSync } = require('fs');
const { join } = require('path');

const root = join(__dirname, '..');
const excluded = new Set(['node_modules']);

const collect = (directory) => readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  if (excluded.has(entry.name)) return [];
  const path = join(directory, entry.name);
  if (entry.isDirectory()) return collect(path);
  return entry.isFile() && entry.name.endsWith('.js') ? [path] : [];
});

for (const file of collect(root)) {
  const result = spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
}

console.log('Backend syntax check passed');
