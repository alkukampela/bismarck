const fs = require('fs');
const path = require('path');

// Matches: from './foo' or from "../bar" (but not from 'foo' or from 'foo.js')
const importRegex = /(from\s+['"])(\.{1,2}\/[^'"]+?)(['"])/g;

function rewriteImports(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      rewriteImports(fullPath);
    } else if (file.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      content = content.replace(importRegex, (match, p1, p2, p3) => {
        // If already has an extension, leave as is
        if (/\.[a-zA-Z0-9]+$/.test(p2)) return match;
        return `${p1}${p2}.js${p3}`;
      });
      fs.writeFileSync(fullPath, content);
    }
  }
}

rewriteImports(path.join(__dirname, 'dist'));
