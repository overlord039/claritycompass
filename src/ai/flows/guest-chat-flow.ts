// src/ai/flows/guest-chat-flow.ts
'use server';

/**
 * @fileOverview A guest-facing AI chatbot flow.
 *
 * - guestChat - A function that handles the conversation with a guest user.
 * - GuestChatInput - The input type for the guestChat function.
 * - GuestChatOutput - The return type for the guestChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GuestChatInputSchema = z.object({
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.array(z.object({ text: z.string() })),
  })).describe('The conversation history.'),
});
export type GuestChatInput = z.infer<typeof GuestChatInputSchema>;

const GuestChatOutputSchema = z.object({
  response: z.string().describe("The AI's response."),
});
export type GuestChatOutput = z.infer<typeof GuestChatOutputSchema>;


export async function guestChat(input: GuestChatInput): Promise<GuestChatOutput> {
  return guestChatFlow(input);
}

const guestChatPrompt = ai.definePrompt({
  name: 'guestChatPrompt',
  input: {schema: GuestChatInputSchema},
  output: {schema: GuestChatOutputSchema},
  prompt: `You are a friendly and helpful AI assistant for Clarity Compass, a platform that helps students with their study abroad applications.

Your goal is to answer questions from guest users who are not logged in. You do not have access to any user data.

Keep your answers concise and encouraging. Guide users to sign up to get personalized advice.

Conversation History:
{{#each history}}
- {{role}}: {{#each content}}{{text}}{{/each}}
{{/each}}

Based on the conversation history, provide a helpful and friendly response to the user's last message.

Your response MUST be in a JSON object with a single key "response".
`,
});

const guestChatFlow = ai.defineFlow(
  {
    name: 'guestChatFlow',
    inputSchema: GuestChatInputSchema,
    outputSchema: GuestChatOutputSchema,
  },
  async (input) => {
    const {output} = await guestChatPrompt(input);
    return output!;
  }
);
