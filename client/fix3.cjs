const fs = require('fs');
const path = require('path');

function processFile(p) {
  let c = fs.readFileSync(p, 'utf8');
  let fixed = c.replace(/\?\s*\{(<[^>]+>)\}/g, '? $1');
  fixed = fixed.replace(/:\s*\{(<[^>]+>)\}/g, ': $1');
  
  if (c !== fixed) {
    fs.writeFileSync(p, fixed, 'utf8');
    console.log('Fixed ternary in', p);
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
console.log('Done fixing ternary JSX');
