const fs = require('fs');
const path = require('path');
const dir = './src/admin/pages';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));
let changedCount = 0;

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  const regex = /([a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)+)\??\.toLowerCase\(\)\.includes\(([^)]+)\)/g;
  
  const newContent = content.replace(regex, (match, prop, term) => {
    return `String(${prop} || '').toLowerCase().includes(${term})`;
  });
  
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent);
    changedCount++;
    console.log('Fixed', file);
  }
}
console.log('Total files changed:', changedCount);
