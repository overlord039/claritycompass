# **App Name**: Clarity Compass

## Core Features:

- Profile Builder: Step-by-step form to collect user's academic background, study goals, budget and exam readiness for personalized guidance. Saves data to Firestore.
- AI Profile Assessment: AI tool analyzes the user profile data from Firestore and determines the user's academic, exam, and SOP strength levels, updating the Dashboard UI accordingly. It will recommend actions based on weaknesses found, such as suggesting universities
- University Discovery Engine: Filters universities from Firestore based on the user's profile, budget, and country preferences. Groups universities into Dream, Target, and Safe categories based on AI analysis.
- University Locking: Allows users to 'lock' their final university choices, triggering the Application Guidance stage and specific tasks. Saves locked status to Firestore.
- Application Task Generator: AI tool generates and updates a dynamic to-do list in Firestore containing steps related to SOP, exams, and forms, updating dashboard progress automatically.
- Stage Gatekeeper: Controls user access to app sections, preventing premature access.
- AI Personalized guidance: Each part of the application will be enhanced by using Gemini LLM via prompts that will incorporate the details about the applicant as well as the stage they are at in their process.

## Style Guidelines:

- Primary color: Soft lavender (#E6E6FA) to evoke calmness and intelligence.
- Background color: Light pastel blue (#F0F8FF), desaturated to 20% to create a soft, futuristic feel.
- Accent color: Gentle violet (#B09FDE) to complement lavender, creating depth and focus for key interactions.
- Body font: 'Inter', sans-serif, for a modern and neutral feel; also suitable for headlines
- Use simple, line-based icons with rounded corners, animated gently on hover.
- Centered content with vertical storytelling to ensure a focused user experience.
- Fade and slide transitions on cards and components for smooth navigation and a sense of depth.