const fs = require('fs');
const filePath = 'apps/web/src/lib/ai/types/index.ts';
let content = fs.readFileSync(filePath, 'utf8');
content = content.replace(/e\0x\0p\0o\0r\0t\0 \0\*\0 \0f\0r\0o\0m\0 \0'\0\.\0\/\0l\0i\0b\0r\0a\0r\0y\0'\0;\0 \0\r\0\n\0 \0\r\0\n\0/g, '');
fs.writeFileSync(filePath, content, 'utf8');
