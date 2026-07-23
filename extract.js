const fs = require('fs');
const lines = fs.readFileSync('C:/Users/ayush/.gemini/antigravity-ide/brain/dc7c35e7-8397-4cda-b450-04ba61394868/.system_generated/logs/transcript_full.jsonl', 'utf8').split('\n');
for (const l of lines) {
  if (l.includes('"USER_INPUT"') && l.includes('Phase 6')) {
    const j = JSON.parse(l);
    fs.writeFileSync('phase6-prompt.txt', j.content);
    break;
  }
}
