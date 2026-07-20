const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../apps/api/src/ai/ai.service.ts');
let code = fs.readFileSync(filePath, 'utf8');

// For any generate* method that takes `user: { id: string; organizationId?: string }`, let's inject const userId = user.id;
code = code.replace(/(async (?:generate[A-Za-z]+|summarizeLiveAnswers|modifyDraft)\([^{]*user: \{ id: string; organizationId\?: string \}[^{]*\)\s*\{)/g, 
  '$1\n    const userId = user.id;');

// In logAiOperation, we replaced userId: string with user: { id: string... } but it expects userId.
code = code.replace(/logAiOperation\(data: \{\n\s*user: \{ id: string; organizationId\?: string \};/g, 
  'logAiOperation(data: {\n    userId: string;');

code = code.replace(/this\.logAiOperation\(\{\n\s*user: \{ id: string; organizationId\?: string \},/g,
  'this.logAiOperation({\n          userId: user.id,');

// Wait, the error TS2561 says 'userId' does not exist in type '{ user: ... }'
// This is because we changed `userId` to `user` in logAiOperation parameter, but called it with userId.
// Let's just fix logAiOperation signature back to userId: string.
// Let's reload from a fresh replacement to be safe.
code = fs.readFileSync(filePath, 'utf8');

code = code.replace(/user: \{ id: string; organizationId\?: string \}/g, 'userId: string');
code = code.replace(/const userId = user\.id;/g, '');

// Now we apply the correct replacements
code = code.replace(/async (generateQaReply|generatePoll|generateQuiz|generateSurvey|generateFeedback|generateWordCloud|generateAnalyticsReport|generateSession|summarizeLiveAnswers|modifyDraft)\(([^,]+),\s*userId: string(,\s*count = 1)?\)\s*\{/g, 
  'async $1($2, user: { id: string; organizationId?: string }$3) {\n    const userId = user.id;');

// And fix the usages of userId in those methods
// Wait, generateSession has `prompt: string, userId: string`
code = code.replace(/generateSession\(prompt: string, userId: string\)\s*\{/g, 
  'generateSession(prompt: string, user: { id: string; organizationId?: string }) {\n    const userId = user.id;');

code = code.replace(/summarizeLiveAnswers\(eventId: string, userId: string\)\s*\{/g, 
  'summarizeLiveAnswers(eventId: string, user: { id: string; organizationId?: string }) {\n    const userId = user.id;');

code = code.replace(/modifyDraft\(activity: any, instruction: string, userId: string\)\s*\{/g, 
  'modifyDraft(activity: any, instruction: string, user: { id: string; organizationId?: string }) {\n    const userId = user.id;');


fs.writeFileSync(filePath, code, 'utf8');
console.log('Done!');
