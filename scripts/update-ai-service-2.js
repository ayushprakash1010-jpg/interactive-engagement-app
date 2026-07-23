const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../apps/api/src/ai/ai.service.ts');
let code = fs.readFileSync(filePath, 'utf8');

// summarizeLiveAnswers call
code = code.replace(/userId, \{\n\s*retries: 2,\n\s*\}\);/g, 
  'user.id, { retries: 2, organizationId: user.organizationId });');

// modifyDraft call
code = code.replace(/modifyDraft\(activity: any, instruction: string, user: \{ id: string; organizationId\?: string \}\) \{\n\s*const userId = user\.id;\n\s*const activityType = activity\.type;\n\s*return this\.generateJson\(\n([\s\S]*?),\n\s*'modify draft',\n\s*userId,\n\s*\);/g,
  `modifyDraft(activity: any, instruction: string, user: { id: string; organizationId?: string }) {\n    const userId = user.id;\n    const activityType = activity.type;\n    return this.generateJson(\n$1,\n      'modify draft',\n      user.id,\n      { organizationId: user.organizationId },\n    );`);

fs.writeFileSync(filePath, code, 'utf8');
console.log('Fixed summarizeLiveAnswers and modifyDraft!');
