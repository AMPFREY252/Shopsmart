/* ================= Build: concatenate parts -> index.html, inline Tailwind ================= */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = __dirname;
const partsDir = path.join(root, 'parts');
const files = fs.readdirSync(partsDir).filter(f => f.endsWith('.html') || f.endsWith('.js')).sort();
let html = '';
for (const f of files) html += fs.readFileSync(path.join(partsDir, f), 'utf8') + '\n';

const outFile = path.join(root, 'index.html');
fs.writeFileSync(outFile, html, 'utf8');
console.log('concatenated ' + files.length + ' parts -> index.html (' + html.length + ' chars)');

const cli = (() => {
  const pkg = require('tailwindcss/package.json');
  const bin = typeof pkg.bin === 'string' ? pkg.bin : pkg.bin.tailwindcss;
  return path.join(root, 'node_modules', 'tailwindcss', bin);
})();
execFileSync(process.execPath, [cli, '-i', 'src/input.css', '-o', 'src/out.css', '--minify'], { cwd: root, stdio: 'inherit' });

const css = fs.readFileSync(path.join(root, 'src/out.css'), 'utf8');
const final = html.replace('/*__TAILWIND__*/', () => css);
fs.writeFileSync(outFile, final, 'utf8');
console.log('inlined ' + css.length + ' chars of CSS -> index.html total ' + final.length + ' chars');
