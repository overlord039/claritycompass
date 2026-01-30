'use server';

import {
  assessProfile as assessProfileFlow,
  type AssessProfileInput,
  type AssessProfileOutput,
} from '@/ai/flows/ai-profile-assessment';
import {
  generateApplicationTasks as generateApplicationTasksFlow,
  type ApplicationTaskInput,
  type ApplicationTaskOutput,
} from '@/ai/flows/application-task-generator';
import {
  universityDiscoveryEngine as universityDiscoveryEngineFlow,
  type UniversityDiscoveryEngineInput,
  type UniversityDiscoveryEngineOutput,
} from '@/ai/flows/university-discovery-engine';
import {
    aiPersonalizedGuidance as aiPersonalizedGuidanceFlow,
    type AIPersonalizedGuidanceInput,
    type AIPersonalizedGuidanceOutput,
} from '@/ai/flows/ai-personalized-guidance';
import {
    guestChat as guestChatFlow,
    type GuestChatInput,
    type GuestChatOutput,
} from '@/ai/flows/guest-chat-flow';
import {
    aiChat as aiChatFlow,
    type AIChatInput,
    type AIChatOutput,
} from '@/ai/flows/ai-chat-flow';


export async function assessProfile(
  input: AssessProfileInput
): Promise<AssessProfileOutput | null> {
  try {
    const output = await assessProfileFlow(input);
    return output;
  } catch (error) {
    console.error('Error in assessProfile action:', error);
    return null;
  }
}

export async function generateApplicationTasks(
  input: ApplicationTaskInput
): Promise<ApplicationTaskOutput | null> {
  try {
    const output = await generateApplicationTasksFlow(input);
    return output;
  } catch (error) {
    console.error('Error in generateApplicationTasks action:', error);
    return null;
  }
}

export async function universityDiscoveryEngine(
  input: UniversityDiscoveryEngineInput
): Promise<UniversityDiscoveryEngineOutput | null> {
  try {
    const output = await universityDiscoveryEngineFlow(input);
    return output;
  } catch (error) {
    console.error('Error in universityDiscoveryEngine action:', error);
    return null;
  }
}

export async function getAIPersonalizedGuidance(
  input: AIPersonalizedGuidanceInput
): Promise<AIPersonalizedGuidanceOutput | null> {
    // A mock implementation because the prompt is not complete in the source file
    const stageGuidance: Record<string, {guidance: string, actions: string[]}> = {
        '1': {
            guidance: "Welcome! Let's start by building a strong profile. This is the foundation for your entire journey.",
            actions: ["Complete your academic background.", "Define your study goals and budget."]
        },
        '2': {
            guidance: "Your profile is set! Now for the exciting part: discovering universities that are a great fit for you. I'll analyze your profile to suggest Dream, Target, and Safe options.",
            actions: ["Review AI-suggested universities.", "Shortlist at least 3-5 universities that you like."]
        },
        '3': {
            guidance: "You have a solid shortlist. It's time to make a commitment. Finalizing your choices will allow us to create a tailored application plan for you.",
            actions: ["Compare your shortlisted universities.", "Lock your final choice to proceed."]
        },
        '4': {
            guidance: "You've locked in your choice! Let's get to work on your application. I've generated a personalized task list for you.",
            actions: ["Start working on your Statement of Purpose.", "Request Letters of Recommendation."]
        },
        '5': {
            guidance: "Congratulations on completing your preparation! You're now ready to submit your applications via the university portals. Focus on tracking their status and preparing for interviews.",
            actions: ["Submit your applications.", "Monitor application status.", "Prepare for admission interviews."]
        }
    }
    const result = stageGuidance[input.currentStage] || {guidance: "Let's figure out the next steps for you.", actions: ["Review your profile."]};

    // try {
    //   const output = await aiPersonalizedGuidanceFlow(input);
    //   return output;
    // } catch (error) {
    //   console.error('Error in getAIPersonalizedGuidance action:', error);
    //   return null;
    // }

    return result;
}

export async function guestChat(
  input: GuestChatInput
): Promise<GuestChatOutput | null> {
    try {
        const output = await guestChatFlow(input);
        return output;
    } catch (error) {
        console.error('Error in guestChat action:', error);
        return null;
    }
}

export async function aiChat(
    input: AIChatInput
  ): Promise<AIChatOutput | null> {
      try {
          const output = await aiChatFlow(input);
          return output;
      } catch (error) {
          console.error('Error in aiChat action:', error);
          return null;
      }
  }
