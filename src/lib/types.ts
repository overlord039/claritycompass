

// From users/{uid}
export type UserBase = {
  id: string;
  fullName: string | null;
  email: string | null;
  onboardingComplete: boolean;
  currentStage: number;
  createdAt: any; // Firestore Timestamp
};

// From profiles/{uid}
export type UserProfile = {
  academic: {
    educationLevel: string;
    degree: string;
    graduationYear: string;
    gpa?: string;
  };
  studyGoal: {
    intendedDegree: string;
    fieldOfStudy: string;
    targetIntakeYear: string;
    preferredCountries: string[];
  };
  budget: {
    budgetRangePerYear: string;
    fundingType: string;
  };
  readiness: {
    ieltsStatus: string;
    greStatus: string;
    sopStatus: string;
  };
};

// From user_state/{uid}
export type UserState = {
  currentStage: number; // Redundant but part of the plan
  profileStrength: {
    academics: 'Strong' | 'Average' | 'Weak' | null;
    exams: 'Not started' | 'In progress' | 'Completed' | null;
    sop: 'Not started' | 'Draft' | 'Ready' | null;
  };
  recommendations: string | null;
};

// from users/{uid}/shortlisted_universities/{docId}
export type ShortlistedUniversity = {
    id: string; // docId
    userId: string;
    universityId: string; // university name or master ID
    locked: boolean;
}

// from users/{uid}/tasks/{taskId}
export type ApplicationTask = {
  id: string;
  userId: string;
  title: string;
  stage: number;
  completed: boolean;
  generatedBy: 'AI' | 'User';
  createdAt: any; // Firestore Timestamp
};

// The composite user object provided by AuthContext
export type AppUser = UserBase & {
  profile: UserProfile | null;
  state: UserState | null;
  shortlisted: ShortlistedUniversity[];
  tasks: ApplicationTask[];
  // Convenience properties for components
  shortlistedUniversities: string[];
  lockedUniversities: string[];
  applicationTasks: ApplicationTask[];
};

// Original types, kept for reference if needed by other components temporarily
export type Profile = UserProfile;
export type ProfileStrength = UserState['profileStrength'];
export type University = {
  id: string;
  name: string;
  country: string;
  costLevel: 'Low' | 'Medium' | 'High';
  acceptanceChance: 'Low' | 'Medium' | 'High';
  fit: string;
  risks: string;
  imageUrl: string;
  imageHint: string;
};
