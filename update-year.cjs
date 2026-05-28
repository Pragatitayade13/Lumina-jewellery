const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceInDir(fullPath);
        } else if (fullPath.match(/\.(js|jsx|css|html)$/)) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('2025')) {
                content = content.replace(/2025/g, '2026');
                fs.writeFileSync(fullPath, content);
                console.log('Updated: ' + fullPath);
            }
        }
    }
}

replaceInDir('./src');
