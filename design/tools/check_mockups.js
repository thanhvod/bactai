// Screenshot mockups and report clipped content.
// Usage: OUT=/tmp/shots node design/tools/check_mockups.js WM-ORD-01 DA-HOME-01 ...
//        (no ids = every file in design/mockups)
// Requires the global `playwright` npm package (Chromium at /opt/pw-browsers).
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const { chromium } = require(execSync('npm root -g').toString().trim() + '/playwright');

const MOCK = path.join(__dirname, '..', 'mockups');
const OUT = process.env.OUT || '/tmp/bta-shots';
fs.mkdirSync(OUT, { recursive: true });
let ids = process.argv.slice(2);
if (!ids.length) ids = fs.readdirSync(MOCK).filter(f => f.endsWith('.html') && f !== 'index.html').map(f => f.replace('.html', ''));

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1700, height: 1000 } });
  let bad = 0;
  for (const id of ids) {
    await p.goto('file://' + path.join(MOCK, id + '.html'));
    const issues = await p.evaluate(() => {
      const root = document.querySelector('.frame > div');
      const out = [];
      for (const el of root.querySelectorAll('*')) {
        const cs = getComputedStyle(el);
        if (cs.textOverflow === 'ellipsis') continue;
        if (cs.overflow === 'hidden' || cs.overflowY === 'hidden' || cs.overflowX === 'auto') {
          const v = el.scrollHeight - el.clientHeight;
          const hz = el.scrollWidth - el.clientWidth;
          if (v > 2 && el.tagName !== 'svg') out.push(`clipped-y ${v}px in <${el.tagName.toLowerCase()}> "${(el.innerText || '').slice(0, 40).replace(/\s+/g, ' ')}"`);
          if (hz > 2 && el.tagName !== 'svg') out.push(`clipped-x ${hz}px in <${el.tagName.toLowerCase()}> "${(el.innerText || '').slice(0, 40).replace(/\s+/g, ' ')}"`);
        }
      }
      const v = root.scrollHeight - root.clientHeight;
      if (v > 2) out.push(`root clipped-y ${v}px`);
      return out.slice(0, 8);
    });
    if (issues.length) bad++;
    console.log(id, issues.length ? 'ISSUES:\n  ' + issues.join('\n  ') : 'ok');
    await (await p.$('.frame > div')).screenshot({ path: path.join(OUT, id + '.png') });
  }
  await b.close();
  console.log(`checked ${ids.length}, with issues: ${bad}. screenshots in ${OUT}`);
})();
