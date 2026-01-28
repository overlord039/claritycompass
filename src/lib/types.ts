export type Profile = {
  fullName: string;
  educationLevel: string;
  degree: string;
  graduationYear: string;
  gpa?: string;
  intendedDegree: string;
  fieldOfStudy: string;
  targetIntakeYear: string;
  preferredCountries: string[];
  budgetRangePerYear: string;
  fundingType: string;
  ieltsStatus: string;
  greStatus: string;
  sopStatus: string;
};

export type ProfileStrength = {
  academicStrength: 'Strong' | 'Average' | 'Weak' | null;
  examReadiness: 'Not started' | 'In progress' | 'Completed' | null;
  sopReadiness: 'Not started' | 'Draft' | 'Ready' | null;
  recommendations: string | null;
};

export type ApplicationTask = {
  id: string;
  task: string;
  status: 'Not started' | 'In progress' | 'Completed';
};

export type User = {
  id: string;
  email: string | null;
  fullName: string | null;
  onboardingComplete: boolean;
  currentStage: 1 | 2 | 3 | 4;
  profile: Profile | null;
  profileStrength: ProfileStrength | null;
  shortlistedUniversities: string[]; // array of university names
  lockedUniversities: string[]; // array of university names
  applicationTasks: ApplicationTask[];
};

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
