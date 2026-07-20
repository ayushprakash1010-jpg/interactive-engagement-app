const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../apps/api/src/ai/ai.service.ts');
const code = fs.readFileSync(filePath, 'utf8');
const lines = code.split(/\r?\n/);

let generateSessionIndex = -1;
let eventObjectIdIndex = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("'generate session',") && generateSessionIndex === -1) {
    generateSessionIndex = i;
  }
  if (lines[i].includes("const eventObjectId = new Types.ObjectId(eventId);") && eventObjectIdIndex === -1 && i > generateSessionIndex) {
    eventObjectIdIndex = i;
  }
}

console.log('generateSessionIndex:', generateSessionIndex);
console.log('eventObjectIdIndex:', eventObjectIdIndex);

if (generateSessionIndex !== -1 && eventObjectIdIndex !== -1) {
  const replacementLines = [
    "      'generate session',",
    "      user.id,",
    "      { retries: 2, organizationId: user.organizationId },",
    "    );",
    "  }",
    "",
    "  async summarizeLiveAnswers(eventId: string, user: { id: string; organizationId?: string }): Promise<SummarizeLiveAnswersResult> {",
    "    const userId = user.id;",
    "    if (!Types.ObjectId.isValid(eventId)) {",
    "      throw new NotFoundException(`Event ${eventId} not found`);",
    "    }",
    "",
    "    await this.eventsService.findOne(eventId, userId);",
    "",
    "    const eventObjectId = new Types.ObjectId(eventId);"
  ];

  lines.splice(generateSessionIndex, eventObjectIdIndex - generateSessionIndex + 1, ...replacementLines);

  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  console.log('Lines replaced correctly.');
} else {
  console.log('Could not find indices!');
}
