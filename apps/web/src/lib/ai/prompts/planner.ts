export const PLANNER_PROMPT = {
  id: 'planner',
  version: '1.0.0',
  description: 'Generates a session plan and interactive activities from event config',
  owner: 'ai-team',
  lastUpdated: new Date().toISOString(),
  text: `
You are an expert event producer and instructional designer. 
Generate a comprehensive Session Plan and interactive Draft Activities for the following event request:

Event Config:
{{config}}

Rules:
1. Provide a realistic, well-paced timeline (agenda).
2. Generate Draft Activities (polls, wordclouds, quizzes, etc.) that match the agenda.
3. Every activity referenced in the agenda must exist in the drafts array (link via activityId/id).
4. Do not include extra commentary, return ONLY the JSON object.
`
};
