const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../apps/api/src/ai/ai.service.ts');
let code = fs.readFileSync(filePath, 'utf8');

const target = `'generate session',
      userId,
    const eventObjectId = new Types.ObjectId(eventId);`;

const replacement = `'generate session',
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

code = code.replace(target, replacement);

fs.writeFileSync(filePath, code, 'utf8');
console.log('Fixed completely!');
