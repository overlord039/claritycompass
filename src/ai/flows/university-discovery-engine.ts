'use server';

/**
 * @fileOverview This file defines the university discovery engine flow.
 *
 * It filters universities based on the user's profile and preferences.
 * - universityDiscoveryEngine - The main function to trigger the flow.
 * - UniversityDiscoveryEngineInput - Input type for the flow.
 * - UniversityDiscoveryEngineOutput - Output type for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const UniversityDiscoveryEngineInputSchema = z.object({
  educationLevel: z.string().describe('The education level of the student.'),
  degree: z.string().describe('The degree the student is pursuing.'),
  fieldOfStudy: z.string().describe('The field of study the student is interested in.'),
  targetIntakeYear: z.string().describe('The target intake year for the student.'),
  preferredCountries: z.array(z.string()).describe('The preferred countries for studying.'),
  budgetRangePerYear: z.string().describe('The budget range per year the student can afford.'),
  ieltsStatus: z.string().describe('The IELTS status of the student.'),
  greStatus: z.string().describe('The GRE/GMAT status of the student.'),
  sopStatus: z.string().describe('The SOP status of the student.'),
  universitiesData: z.string().describe('JSON string containing an array of universities objects, each with properties like country, costLevel, acceptanceChance, and fit.'),
});

export type UniversityDiscoveryEngineInput = z.infer<typeof UniversityDiscoveryEngineInputSchema>;

const UniversityDiscoveryEngineOutputSchema = z.object({
  dreamUniversities: z.array(z.string()).describe('List of dream universities.'),
  targetUniversities: z.array(z.string()).describe('List of target universities.'),
  safeUniversities: z.array(z.string()).describe('List of safe universities.'),
});

export type UniversityDiscoveryEngineOutput = z.infer<typeof UniversityDiscoveryEngineOutputSchema>;

export async function universityDiscoveryEngine(
  input: UniversityDiscoveryEngineInput
): Promise<UniversityDiscoveryEngineOutput> {
  return universityDiscoveryEngineFlow(input);
}

const prompt = ai.definePrompt({
  name: 'universityDiscoveryEnginePrompt',
  input: {schema: UniversityDiscoveryEngineInputSchema},
  output: {schema: UniversityDiscoveryEngineOutputSchema},
  prompt: `You are an expert university advisor. You will be provided with a student's profile and a list of universities.
Your task is to categorize the universities into three categories: Dream, Target, and Safe, based on the student's profile and the university's fit, cost level, and acceptance chance.

Student Profile:
Education Level: {{{educationLevel}}}
Degree: {{{degree}}}
Field of Study: {{{fieldOfStudy}}}
Target Intake Year: {{{targetIntakeYear}}}
Preferred Countries: {{#each preferredCountries}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
Budget Range Per Year: {{{budgetRangePerYear}}}
IELTS Status: {{{ieltsStatus}}}
GRE/GMAT Status: {{{greStatus}}}
SOP Status: {{{sopStatus}}}

Universities Data: {{{universitiesData}}}

Categorize the universities into Dream, Target, and Safe universities. Only include the names of the universities in the lists.
Return the output in JSON format:
{
  "dreamUniversities": ["University1", "University2"],
  "targetUniversities": ["University3", "University4"],
  "safeUniversities": ["University5", "University6"]
}
`,
});

const universityDiscoveryEngineFlow = ai.defineFlow(
  {
    name: 'universityDiscoveryEngineFlow',
    inputSchema: UniversityDiscoveryEngineInputSchema,
    outputSchema: UniversityDiscoveryEngineOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
