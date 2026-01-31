'use server';

/**
 * @fileOverview A personalized AI counsellor chat flow for the dashboard.
 *
 * - aiChat - A function that handles conversation with an authenticated user.
 * - AIChatInput - The input type for the aiChat function.
 * - AIChatOutput - The return type for the aiChat function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const AIChatInputSchema = z.object({
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'model']),
        content: z.array(z.object({ text: z.string() })),
      })
    )
    .describe('The conversation history.'),
  currentStage: z.number().describe("The user's current stage in the application process."),
  userProfile: z.string().describe('JSON string of the complete user profile.'),
  userState: z.string().describe('JSON string of the user\'s current state.'),
  shortlistedUniversities: z.array(z.string()).describe('List of shortlisted university names.'),
  lockedUniversities: z.array(z.string()).describe('List of locked university names.'),
});
export type AIChatInput = z.infer<typeof AIChatInputSchema>;

const AIChatOutputSchema = z.object({
  response: z.string().describe("The AI counsellor's response."),
});
export type AIChatOutput = z.infer<typeof AIChatOutputSchema>;

export async function aiChat(input: AIChatInput): Promise<AIChatOutput> {
  return aiChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiChatPrompt',
  input: { schema: AIChatInputSchema },
  output: { schema: AIChatOutputSchema },
  prompt: `You are a personalized AI counsellor for Clarity Compass. Your role is to guide the user through their study abroad journey.
You must act as a supportive, knowledgeable, and professional advisor.

The user is currently at Stage {{currentStage}}.

Here are your instructions for each stage:
- **Stage 1 (Build Profile):** Help the user complete their profile. Answer questions about what different fields mean. Do NOT give university recommendations yet.
- **Stage 2 (Discover Universities):** Explain the profile strength and university recommendations. Explain 'Dream', 'Target', 'Safe' categories. Help them shortlist universities.
- **Stage 3 (Finalize Choices):** Help the user compare shortlisted universities to make a final decision. Guide them toward locking their choices.
- **Stage 4 (Prepare Applications):** Explain the application tasks and strategy that have been generated. Answer questions about why tasks are important (e.g., "Why do I need an SOP?"). Do not invent new tasks.
- **Stage 5 (Application Ready):** Provide post-application support. Answer questions about tracking applications, preparing for interviews, or handling offers. Encourage patience.

**STRICTLY ADHERE to the user's current stage.** Do not give advice for a different stage.

USER'S DATA:
- Profile: {{{userProfile}}}
- State: {{{userState}}}
- Shortlisted: {{#if shortlistedUniversities}}{{#each shortlistedUniversities}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None{{/if}}
- Locked: {{#if lockedUniversities}}{{#each lockedUniversities}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None{{/if}}

CONVERSATION HISTORY:
{{#each history}}
- {{role}}: {{#each content}}{{text}}{{/each}}
{{/each}}

Based on the user's last message and the guidance for Stage {{currentStage}}, provide a helpful and friendly response.
Your response MUST be a JSON object with a single key "response".
`,
});

const aiChatFlow = ai.defineFlow(
  {
    name: 'aiChatFlow',
    inputSchema: AIChatInputSchema,
    outputSchema: AIChatOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
