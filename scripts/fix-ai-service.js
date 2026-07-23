const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../apps/api/src/ai/ai.service.ts');
let code = fs.readFileSync(filePath, 'utf8');

// I need to replace from `'generate session',` up to `const eventObjectId = new Types.ObjectId(eventId);`
// with the correct lines.

const target = `\`,
      'generate session',
      userId,
    const eventObjectId = new Types.ObjectId(eventId);`;

const replacement = `\`,
      'generate session',
      user.id,
      { retries: 2, organizationId: user.organizationId },
    );
  }

  async summarizeLiveAnswers(eventId: string, user: { id: string; organizationId?: string }): Promise<SummarizeLiveAnswersResult> {
    const userId = user.id;
    if (!Types.ObjectId.isValid(eventId)) {
      throw new NotFoundException(\`Event \${eventId} not found\`);
    }

    await this.eventsService.findOne(eventId, userId);

    const eventObjectId = new Types.ObjectId(eventId);`;

// The replace tool left:
// `,
//       'generate session',
//       userId,
//     const eventObjectId = new Types.ObjectId(eventId);

code = code.replace(/\`,\n\s*'generate session',\n\s*userId,\n\s*const eventObjectId = new Types\.ObjectId\(eventId\);/g, replacement);

fs.writeFileSync(filePath, code, 'utf8');
console.log('Fixed!');
