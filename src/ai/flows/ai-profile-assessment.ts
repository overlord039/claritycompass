'use server';

/**
 * @fileOverview AI profile assessment flow.
 *
 * - assessProfile - A function that assesses the user's profile and returns its strengths and weaknesses.
 * - AssessProfileInput - The input type for the assessProfile function.
 * - AssessProfileOutput - The return type for the assessProfile function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssessProfileInputSchema = z.object({
  educationLevel: z.string().describe('The education level of the user.'),
  degree: z.string().describe('The degree of the user.'),
  graduationYear: z.string().describe('The graduation year of the user.'),
  gpa: z.string().optional().describe('The GPA of the user.'),
  intendedDegree: z.string().describe('The intended degree of the user.'),
  fieldOfStudy: z.string().describe('The field of study of the user.'),
  targetIntakeYear: z.string().describe('The target intake year of the user.'),
  preferredCountries: z.string().describe('The preferred countries of the user.'),
  budgetRangePerYear: z.string().describe('The budget range per year of the user.'),
  fundingType: z.string().describe('The funding type of the user.'),
  ieltsStatus: z.string().describe('The IELTS status of the user.'),
  greStatus: z.string().describe('The GRE status of the user.'),
  sopStatus: z.string().describe('The SOP status of the user.'),
});
export type AssessProfileInput = z.infer<typeof AssessProfileInputSchema>;

const AssessProfileOutputSchema = z.object({
  academicStrength: z
    .string()
    .describe('The academic strength of the user (Strong, Average, Weak).'),
  examReadiness: z
    .string()
    .describe('The exam readiness of the user (Not started, In progress, Completed).'),
  sopReadiness: z.string().describe('The SOP readiness of the user (Not started, Draft, Ready).'),
  recommendations: z.string().describe('The recommendations for the user to improve their profile.'),
});
export type AssessProfileOutput = z.infer<typeof AssessProfileOutputSchema>;

export async function assessProfile(input: AssessProfileInput): Promise<AssessProfileOutput> {
  return assessProfileFlow(input);
}

const assessProfilePrompt = ai.definePrompt({
  name: 'assessProfilePrompt',
  input: {schema: AssessProfileInputSchema},
  output: {schema: AssessProfileOutputSchema},
  prompt: `You are an AI counsellor assessing a student's profile for study abroad.

  Based on the following information, assess the student's academic strength (Strong, Average, Weak), exam readiness (Not started, In progress, Completed), and SOP readiness (Not started, Draft, Ready).
  Also, provide recommendations for the student to improve their profile.

  Education Level: {{{educationLevel}}}
  Degree: {{{degree}}}
  Graduation Year: {{{graduationYear}}}
  GPA: {{{gpa}}}
  Intended Degree: {{{intendedDegree}}}
  Field of Study: {{{fieldOfStudy}}}
  Target Intake Year: {{{targetIntakeYear}}}
  Preferred Countries: {{{preferredCountries}}}
  Budget Range Per Year: {{{budgetRangePerYear}}}
  Funding Type: {{{fundingType}}}
  IELTS Status: {{{ieltsStatus}}}
  GRE Status: {{{greStatus}}}
  SOP Status: {{{sopStatus}}}

  Respond in a structured format.
  `,
});

const assessProfileFlow = ai.defineFlow(
  {
    name: 'assessProfileFlow',
    inputSchema: AssessProfileInputSchema,
    outputSchema: AssessProfileOutputSchema,
  },
  async input => {
    const {output} = await assessProfilePrompt(input);
    return output!;
  }
);
