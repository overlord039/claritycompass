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
  degree: z.string().describe('The intended degree of the student.'),
  major: z.string().describe('The major of the student.'),
  sopStatus: z
    .enum(['Not started', 'Draft', 'Ready'])
    .describe('The status of the student\'s SOP.'),
  ieltsStatus: z
    .enum(['Not started', 'In progress', 'Completed'])
    .describe('The IELTS status of the student.'),
  greStatus: z
    .enum(['Not started', 'In progress', 'Completed'])
    .describe('The GRE status of the student.'),
});
export type ApplicationTaskInput = z.infer<typeof ApplicationTaskInputSchema>;

const ApplicationTaskOutputSchema = z.object({
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
Based on the student's profile and chosen university, generate a list of tasks that the student needs to complete.

University: {{universityName}}
Degree: {{degree}}
Major: {{major}}
SOP Status: {{sopStatus}}
IELTS Status: {{ieltsStatus}}
GRE Status: {{greStatus}}

Tasks should include things like:
- Writing the statement of purpose
- Taking the IELTS/GRE
- Filling out the application form
- Requesting letters of recommendation
- Submitting transcripts

Return the tasks in a JSON format.
Tasks should have a status of "Not started" by default.
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
