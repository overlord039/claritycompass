// src/ai/flows/ai-personalized-guidance.ts
'use server';

/**
 * @fileOverview Provides personalized AI guidance based on the user's profile and current stage.
 *
 * - aiPersonalizedGuidance - A function that returns guidance to the user.
 * - AIPersonalizedGuidanceInput - The input type for the aiPersonalizedGuidance function.
 * - AIPersonalizedGuidanceOutput - The return type for the aiPersonalizedGuidance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIPersonalizedGuidanceInputSchema = z.object({
  profileData: z.any().describe('The user profile data from Firestore.'),
  currentStage: z.string().describe('The current stage of the application process.'),
  shortlistedUniversities: z.array(z.string()).describe('The list of shortlisted universities.'),
  lockedUniversities: z.array(z.string()).describe('The list of locked universities.'),
});
export type AIPersonalizedGuidanceInput = z.infer<typeof AIPersonalizedGuidanceInputSchema>;

const AIPersonalizedGuidanceOutputSchema = z.object({
  guidance: z.string().describe('The personalized AI guidance for the current stage.'),
  actions: z.array(z.string()).describe('A list of AI-generated actions to take.'),
});
export type AIPersonalizedGuidanceOutput = z.infer<typeof AIPersonalizedGuidanceOutputSchema>;

export async function aiPersonalizedGuidance(input: AIPersonalizedGuidanceInput): Promise<AIPersonalizedGuidanceOutput> {
  return aiPersonalizedGuidanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiPersonalizedGuidancePrompt',
  input: {schema: AIPersonalizedGuidanceInputSchema},
  output: {schema: AIPersonalizedGuidanceOutputSchema},
  prompt: `You are an AI counsellor providing personalized guidance to students applying to universities.

You have access to the student's profile data, current stage in the application process, and lists of shortlisted and locked universities.

Based on this information, provide guidance and suggest actions to help the student progress.

Profile Data: {{{profileData}}}
Current Stage: {{{currentStage}}}
Shortlisted Universities: {{{shortlistedUniversities}}}
Locked Universities: {{{lockedUniversities}}}

Guidance:
Actions:`, // The actual prompt content needs to be updated.
});

const aiPersonalizedGuidanceFlow = ai.defineFlow(
  {
    name: 'aiPersonalizedGuidanceFlow',
    inputSchema: AIPersonalizedGuidanceInputSchema,
    outputSchema: AIPersonalizedGuidanceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
