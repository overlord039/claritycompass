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
});
export type ApplicationTaskInput = z.infer<typeof ApplicationTaskInputSchema>;

const ApplicationTaskOutputSchema = z.object({
  requiredDocuments: z.array(z.string()).describe('A list of required documents for the application.'),
  timeline: z.array(
    z.object({
      milestone: z.string().describe('A key milestone in the application timeline.'),
      deadline: z.string().describe('The suggested deadline for this milestone (e.g., "Mid-October", "2 weeks from now").'),
    })
  ).describe('A high-level timeline for the application process.'),
  tasks: z.array(
    z.object({
      task: z.string().describe('A specific task to complete for the application.'),
      status: z.enum(['Not started', 'In progress', 'Completed']).describe('The status of the task.'),
    })
  ).describe('A list of tasks required to complete the application.'),
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
  prompt: `You are an AI assistant that helps students with their university applications.
Based on the student's full profile and their chosen university, generate a personalized action plan. This plan should include a list of required documents, a high-level timeline with milestones, and a specific to-do list.

The plan should be tailored to the user's specific situation. For example, if their SOP is already a draft, a task should be to "Finalize SOP draft", not "Start SOP". If their GRE is not started but required for the university, this should be a high-priority task with an early deadline.

Chosen University: {{universityName}}
User Profile: {{{userProfile}}}

Generate:
1.  A list of required documents (e.g., "Official Transcripts", "Letters of Recommendation", "Passport Copy").
2.  A high-level timeline with key milestones and suggested deadlines (e.g., "Mid-October", "2 weeks from now").
3.  A list of specific to-do tasks.

Tasks should include things like:
- Writing the statement of purpose (consider the current SOP status from the profile)
- Preparing for and taking the IELTS/GRE (consider current exam status)
- Filling out the application form for the chosen university
- Requesting letters of recommendation from professors
- Arranging for official transcript submission

Return the response in a structured JSON format.
The status of each generated task should reflect the user's profile (e.g., 'Not started', 'In progress', or 'Completed').
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
