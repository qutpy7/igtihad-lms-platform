const fs = require('fs');
const path = require('path');

function processFile(p) {
  let c = fs.readFileSync(p, 'utf8');
  let fixed = c.replace(/(\w+):\s*\{(<[^>]+>)\}/g, '$1: $2');
  if (c !== fixed) {
    fs.writeFileSync(p, fixed, 'utf8');
    console.log('Fixed', p);
  }
}

function walk(d) {
  fs.readdirSync(d).forEach(f => {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) {
      walk(p);
    } else if (p.endsWith('.jsx')) {
      processFile(p);
    }
  });
}

walk('src');
console.log('Done fixing emojis props');
