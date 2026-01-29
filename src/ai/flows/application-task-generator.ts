'use server';

/**
 * @fileOverview This file defines the application task generator flow.
 *
 * It generates a to-do list of application tasks based on the user's chosen university.
 *
 * @exported
 * - `generateApplicationTasks`: The main function to generate application tasks.
 * - `ApplicationTaskInput`: The input type for the `generateApplicationTasks` function.
 * - `ApplicationTaskOutput`: The output type for the `generateApplicationTasks` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ApplicationTaskInputSchema = z.object({
  universityName: z.string().describe('The name of the chosen university.'),
  userProfile: z.string().describe('A JSON string representing the complete user profile, including academic background, study goals, and readiness.'),
  recommendations: z.string().describe('The AI-generated recommendations for profile improvement.'),
});
export type ApplicationTaskInput = z.infer<typeof ApplicationTaskInputSchema>;

const ApplicationTaskOutputSchema = z.object({
  applicationStrategy: z.object({
    summary: z.string().describe("A concise, strategic summary for the application, addressing the background transition."),
    requiredDocuments: z.array(z.string()).describe("A realistic list of required application documents."),
    timeline: z.array(
      z.object({
        phase: z.string().describe("The name of the application phase (e.g., 'Phase 1: Foundation')."),
        focus: z.string().describe("The primary focus of this phase."),
        duration: z.string().describe("An estimated duration for the phase (e.g., '2-3 Weeks').")
      })
    ).describe("A high-level, phased timeline for the application process.")
  }),
  tasks: z.array(
    z.object({
      title: z.string().describe("The specific, actionable task to complete."),
      type: z.string().describe("The category of the task (e.g., 'SOP', 'Profile Building', 'Research')."),
      priority: z.enum(['High', 'Medium', 'Low']).describe("The priority level of the task.")
    })
  ).describe("A list of AI-generated tasks to guide the student.")
});
export type ApplicationTaskOutput = z.infer<typeof ApplicationTaskOutputSchema>;

export async function generateApplicationTasks(
  input: ApplicationTaskInput
): Promise<ApplicationTaskOutput> {
  return applicationTaskFlow(input);
}

const prompt = ai.definePrompt({
  name: 'applicationTaskPrompt',
  input: {schema: ApplicationTaskInputSchema},
  output: {schema: ApplicationTaskOutputSchema},
  prompt: `You are a senior university counsellor providing calm, realistic, and supportive application guidance.
Your task is to generate a tailored application plan for a student who has locked in their university choice.

**STUDENT CONTEXT:**
The student has a non-traditional background for their target field and is applying to a highly competitive university. Your guidance must address this gap and focus on building a strong, coherent narrative.

Student Profile: {{{userProfile}}}
Locked University: {{universityName}}

**AI RECOMMENDATIONS TO ACTION:**
Based on the following prior recommendations, generate concrete tasks to help the student execute on them.
{{{recommendations}}}

**YOUR TASK:**
Generate a structured application plan in JSON format.
The plan must include:
1.  **applicationStrategy**: An object containing a strategic summary, a list of required documents, and a high-level phased timeline.
2.  **tasks**: An array of specific, actionable to-do items with types and priorities, derived directly from the AI recommendations and student context.

**RULES:**
- Your entire response MUST be valid JSON conforming to the output schema.
- The \`applicationStrategy.summary\` should acknowledge the student's background transition (e.g., Arts to AI) and outline the core strategy to position their application for success.
- \`requiredDocuments\` should be a realistic list for a competitive international application.
- The \`timeline\` should be broken into logical phases with a focus and estimated duration (e.g., "2-3 Weeks"). Do NOT use specific dates.
- \`tasks\` should be practical and achievable. Prioritize tasks that strengthen the student's narrative and address potential weaknesses, such as the Statement of Purpose (SOP) and profile positioning.
- Set task \`priority\` based on urgency and impact.
- Keep the tone professional, organized, and supportive.
`,
});

const applicationTaskFlow = ai.defineFlow(
  {
    name: 'applicationTaskFlow',
    inputSchema: ApplicationTaskInputSchema,
    outputSchema: ApplicationTaskOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
