'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import type { AppUser, UserProfile, UserState, ShortlistedUniversity, ApplicationTask, ProfileStrength } from '@/lib/types';
import type { AssessProfileOutput } from '@/ai/flows/ai-profile-assessment';
import { useRouter } from 'next/navigation';
import { 
    useUser, 
    useFirestore, 
    useAuth as useFirebaseAuth, 
    useDoc,
    useCollection,
    useMemoFirebase,
} from '@/firebase';
import { 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut,
    sendPasswordResetEmail,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, writeBatch, collection, deleteDoc, updateDoc, deleteField } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { assessProfile } from '@/lib/actions';

type AuthContextType = {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (fullName: string, email: string, password: string) => Promise<void>;
  googleSignIn: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profileData: UserProfile) => Promise<void>;
  setStage: (stage: number) => Promise<void>;
  shortlistUniversity: (universityName: string) => Promise<void>;
  removeShortlistedUniversity: (universityName: string) => Promise<void>;
  lockUniversities: (universityNames: string[]) => Promise<void>;
  unlockUniversities: () => Promise<void>;
  updateTasks: (tasks: {title: string, completed: boolean}[]) => Promise<void>;
  updateTaskStatus: (taskId: string, completed: boolean) => Promise<void>;
  shortlistedUniversities: string[];
  lockedUniversities: string[];
  applicationTasks: ApplicationTask[];
  profileStrength: ProfileStrength | null;
  updateProfileStrength: (strength: AssessProfileOutput) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [authProviderLoading, setAuthProviderLoading] = useState(true);

  const router = useRouter();
  const { toast } = useToast();

  const { user: firebaseUser, isUserLoading: isAuthLoading } = useUser();
  const auth = useFirebaseAuth();
  const firestore = useFirestore();

  // --- Data Fetching Hooks ---
  const userBaseRef = useMemoFirebase(() => firestore && firebaseUser ? doc(firestore, 'users', firebaseUser.uid) : null, [firestore, firebaseUser]);
  const userProfileRef = useMemoFirebase(() => firestore && firebaseUser ? doc(firestore, 'profiles', firebaseUser.uid) : null, [firestore, firebaseUser]);
  const userStateRef = useMemoFirebase(() => firestore && firebaseUser ? doc(firestore, 'user_state', firebaseUser.uid) : null, [firestore, firebaseUser]);
  const shortlistedUniversitiesRef = useMemoFirebase(() => firestore && firebaseUser ? collection(firestore, 'users', firebaseUser.uid, 'shortlisted_universities') : null, [firestore, firebaseUser]);
  const tasksRef = useMemoFirebase(() => firestore && firebaseUser ? collection(firestore, 'users', firebaseUser.uid, 'tasks') : null, [firestore, firebaseUser]);
  
  const { data: userBase, isLoading: loadingBase } = useDoc<AppUser>(userBaseRef);
  const { data: userProfile, isLoading: loadingProfile } = useDoc<UserProfile>(userProfileRef);
  const { data: userState, isLoading: loadingState } = useDoc<UserState>(userStateRef);
  const { data: shortlisted, isLoading: loadingShortlisted } = useCollection<ShortlistedUniversity>(shortlistedUniversitiesRef);
  const { data: tasks, isLoading: loadingTasks } = useCollection<ApplicationTask>(tasksRef);

  // --- State Composition Effect ---
  useEffect(() => {
    const isSystemLoading = isAuthLoading || loadingBase || loadingProfile || loadingState || loadingShortlisted || loadingTasks;
    setAuthProviderLoading(isSystemLoading);

    if (isSystemLoading || !firebaseUser) {
      if (!isAuthLoading && !firebaseUser) setAppUser(null);
      return;
    }

    if (userBase) {
      const combinedUser: AppUser = {
        ...userBase,
        profile: userProfile || null,
        state: userState || null,
        shortlisted: shortlisted || [],
        tasks: tasks || [],
        // for convenience
        shortlistedUniversities: (shortlisted || []).map(u => u.universityId),
        lockedUniversities: (shortlisted || []).filter(u => u.locked).map(u => u.universityId),
        applicationTasks: tasks || [],
      };
      setAppUser(combinedUser);
    }
  }, [
    firebaseUser, userBase, userProfile, userState, shortlisted, tasks,
    isAuthLoading, loadingBase, loadingProfile, loadingState, loadingShortlisted, loadingTasks
  ]);

  const handleRedirect = (user: AppUser) => {
    router.push(user.onboardingComplete ? '/dashboard' : '/onboarding');
  };

  const updateProfileStrength = useCallback(async (strength: AssessProfileOutput) => {
    if (!firebaseUser) return;
    const stateRef = doc(firestore, 'user_state', firebaseUser.uid);
    const dataToUpdate = {
      profileStrength: {
        academics: strength.academicStrength as ProfileStrength['academics'],
        exams: strength.examReadiness as ProfileStrength['exams'],
        sop: strength.sopReadiness as ProfileStrength['sop'],
      },
      recommendations: strength.recommendations,
    };
    await setDoc(stateRef, dataToUpdate, { merge: true });
  }, [firestore, firebaseUser]);

   // --- AI Profile Assessment Effect ---
   useEffect(() => {
    const runInitialAssessment = async () => {
      // Run assessment only if we have a user, a profile, but no strength data yet.
      if (appUser && appUser.profile && (!appUser.state?.profileStrength?.academics || !appUser.state?.profileStrength?.exams)) {
        toast({ title: 'Analyzing Profile...', description: 'The AI is running an initial analysis.' });

        const result = await assessProfile({
          educationLevel: appUser.profile.academic.educationLevel,
          degree: appUser.profile.academic.degree,
          graduationYear: appUser.profile.academic.graduationYear,
          gpa: appUser.profile.academic.gpa,
          intendedDegree: appUser.profile.studyGoal.intendedDegree,
          fieldOfStudy: appUser.profile.studyGoal.fieldOfStudy,
          targetIntakeYear: appUser.profile.studyGoal.targetIntakeYear,
          preferredCountries: appUser.profile.studyGoal.preferredCountries.join(', '),
          budgetRangePerYear: appUser.profile.budget.budgetRangePerYear,
          fundingType: appUser.profile.budget.fundingType,
          ieltsStatus: appUser.profile.readiness.ieltsStatus,
          greStatus: appUser.profile.readiness.greStatus,
          sopStatus: appUser.profile.readiness.sopStatus,
        });

        if (result) {
          await updateProfileStrength(result);
          toast({ title: 'AI Analysis Complete', description: 'Your profile strength is ready.' });
        }
      }
    };

    if (!authProviderLoading && appUser) {
      runInitialAssessment();
    }
  }, [appUser, authProviderLoading, updateProfileStrength, toast]);

  // --- Mutation Functions ---
  const logout = useCallback(async () => {
    await signOut(auth);
    setAppUser(null);
    router.push('/login');
  }, [auth, router]);
  
  const signup = useCallback(async (fullName: string, email: string, password: string) => {
    setAuthProviderLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const batch = writeBatch(firestore);

      const newUserDocRef = doc(firestore, 'users', user.uid);
      const newUser: Omit<AppUser, 'profile' | 'state' | 'shortlisted' | 'tasks' | 'shortlistedUniversities' | 'lockedUniversities' | 'applicationTasks'> = {
        id: user.uid,
        email: user.email,
        fullName: fullName,
        onboardingComplete: false,
        currentStage: 1,
        createdAt: serverTimestamp(),
      };
      batch.set(newUserDocRef, newUser);

      const newUserStateRef = doc(firestore, 'user_state', user.uid);
      const newUserState: UserState = {
        currentStage: 1,
        profileStrength: { academics: null, exams: null, sop: null },
        recommendations: null,
      };
      batch.set(newUserStateRef, newUserState);

      await batch.commit();
      router.push('/onboarding');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        toast({ variant: 'destructive', title: 'Sign up failed', description: 'This email is already registered. Please login.' });
      } else {
        toast({ variant: 'destructive', title: 'Sign up failed', description: 'An unexpected error occurred. Please try again.' });
      }
    } finally {
        setAuthProviderLoading(false);
    }
  }, [auth, firestore, router, toast]);

  const login = useCallback(async (email: string, password: string) => {
    setAuthProviderLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data() as AppUser;
        handleRedirect(userData);
      } else {
         await logout();
         toast({ variant: 'destructive', title: 'Login Failed', description: 'User profile not found.' });
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Login failed', description: 'Invalid email or password.' });
    } finally {
        setAuthProviderLoading(false);
    }
  }, [auth, firestore, toast, router, logout]);

  const googleSignIn = useCallback(async () => {
    setAuthProviderLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      let userData: AppUser;
      if (!userDocSnap.exists()) {
        const batch = writeBatch(firestore);

        const newUserBase: Omit<AppUser, 'profile' | 'state' | 'shortlisted' | 'tasks'| 'shortlistedUniversities' | 'lockedUniversities' | 'applicationTasks'> = {
          id: user.uid,
          email: user.email,
          fullName: user.displayName,
          onboardingComplete: false,
          currentStage: 1,
          createdAt: serverTimestamp(),
        };
        batch.set(userDocRef, newUserBase);

        const newUserStateRef = doc(firestore, 'user_state', user.uid);
        const newUserState: UserState = {
          currentStage: 1,
          profileStrength: { academics: null, exams: null, sop: null },
          recommendations: null,
        };
        batch.set(newUserStateRef, newUserState);

        await batch.commit();
        userData = { ...newUserBase, profile: null, state: newUserState, shortlisted: [], tasks: [], shortlistedUniversities: [], lockedUniversities: [], applicationTasks: [] };
      } else {
        userData = userDocSnap.data() as AppUser;
      }
      handleRedirect(userData);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Google Sign-In failed', description: 'Could not complete sign-in.' });
    } finally {
        setAuthProviderLoading(false);
    }
  }, [auth, firestore, toast, router]);

  const sendPasswordReset = useCallback(async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast({ title: 'Password Reset Email Sent', description: 'Check your inbox for a password reset link.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not send password reset email.' });
    }
  }, [auth, toast]);

  const updateProfile = useCallback(async (profileData: UserProfile) => {
    if (!firebaseUser) return;
    setAuthProviderLoading(true);
    try {
      // 1. Save core profile data
      const batch = writeBatch(firestore);
      const profileRef = doc(firestore, 'profiles', firebaseUser.uid);
      batch.set(profileRef, { ...profileData, lastUpdated: serverTimestamp() }, { merge: true });

      const isFirstOnboarding = appUser && !appUser.onboardingComplete;
      if (isFirstOnboarding) {
        const userRef = doc(firestore, 'users', firebaseUser.uid);
        batch.update(userRef, { onboardingComplete: true, currentStage: 2 });
        const stateRef = doc(firestore, 'user_state', firebaseUser.uid);
        batch.set(stateRef, { currentStage: 2 }, { merge: true });
      }
      await batch.commit();
      toast({ title: 'Profile Updated', description: 'Re-analyzing your profile with AI...' });

      // 2. Trigger AI assessment
      const result = await assessProfile({
        educationLevel: profileData.academic.educationLevel,
        degree: profileData.academic.degree,
        graduationYear: profileData.academic.graduationYear,
        gpa: profileData.academic.gpa,
        intendedDegree: profileData.studyGoal.intendedDegree,
        fieldOfStudy: profileData.studyGoal.fieldOfStudy,
        targetIntakeYear: profileData.studyGoal.targetIntakeYear,
        preferredCountries: profileData.studyGoal.preferredCountries.join(', '),
        budgetRangePerYear: profileData.budget.budgetRangePerYear,
        fundingType: profileData.budget.fundingType,
        ieltsStatus: profileData.readiness.ieltsStatus,
        greStatus: profileData.readiness.greStatus,
        sopStatus: profileData.readiness.sopStatus,
      });

      // 3. Update strength in Firestore
      if (result) {
        await updateProfileStrength(result);
        toast({ title: 'AI Analysis Complete', description: 'Your profile strength has been updated.' });
      } else {
         toast({ variant: 'destructive', title: 'AI Analysis Failed', description: 'Could not assess profile strength.' });
      }

      // 4. Redirect if it was the first time
      if (isFirstOnboarding) {
        router.push('/dashboard');
      }

    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Update Failed', description: 'Could not save your profile.' });
    } finally {
      setAuthProviderLoading(false);
    }
  }, [firestore, firebaseUser, appUser, toast, router, updateProfileStrength]);
  
  const setStage = async (stage: number) => {
    if (!firebaseUser) return;
    const batch = writeBatch(firestore);
    batch.update(doc(firestore, 'users', firebaseUser.uid), { currentStage: stage });
    batch.set(doc(firestore, 'user_state', firebaseUser.uid), { currentStage: stage }, { merge: true });
    await batch.commit();
  };

  const shortlistUniversity = useCallback(async (universityName: string) => {
    if (!firebaseUser) return;
    const newShortlistRef = doc(collection(firestore, 'users', firebaseUser.uid, 'shortlisted_universities'));
    await setDoc(newShortlistRef, {
      id: newShortlistRef.id,
      userId: firebaseUser.uid,
      universityId: universityName,
      locked: false,
    });
  }, [firestore, firebaseUser]);

  const removeShortlistedUniversity = useCallback(async (universityName: string) => {
    if (!firebaseUser || !appUser) return;
    const uniDoc = appUser.shortlisted.find(u => u.universityId === universityName);
    if (uniDoc) {
      await deleteDoc(doc(firestore, 'users', firebaseUser.uid, 'shortlisted_universities', uniDoc.id));
    }
  }, [firestore, firebaseUser, appUser]);

  const lockUniversities = useCallback(async (universityNames: string[]) => {
    if (!firebaseUser || !appUser) return;
    const batch = writeBatch(firestore);
    appUser.shortlisted
      .filter(u => universityNames.includes(u.universityId))
      .forEach(u => {
        const docRef = doc(firestore, 'users', firebaseUser.uid, 'shortlisted_universities', u.id);
        batch.update(docRef, { locked: true });
      });
    
    batch.update(doc(firestore, 'users', firebaseUser.uid), { currentStage: 4 });
    batch.set(doc(firestore, 'user_state', firebaseUser.uid), { currentStage: 4 }, { merge: true });

    await batch.commit();
  }, [firestore, firebaseUser, appUser]);
  
  const unlockUniversities = useCallback(async () => {
    if (!firebaseUser || !appUser) return;
    const batch = writeBatch(firestore);

    appUser.shortlisted.forEach(u => {
      if (u.locked) {
        const docRef = doc(firestore, 'users', firebaseUser.uid, 'shortlisted_universities', u.id);
        batch.update(docRef, { locked: false });
      }
    });

    appUser.tasks.forEach(t => {
        const taskRef = doc(firestore, 'users', firebaseUser.uid, 'tasks', t.id);
        batch.delete(taskRef);
    });

    batch.update(doc(firestore, 'users', firebaseUser.uid), { currentStage: 3 });
    // Also clear the action plan from state
    batch.set(doc(firestore, 'user_state', firebaseUser.uid), { 
        currentStage: 3,
        actionPlan: deleteField() 
    }, { merge: true });
    
    await batch.commit();
  }, [firestore, firebaseUser, appUser]);

  const updateTasks = useCallback(async (newTasks: {title: string, completed: boolean}[]) => {
    if (!firebaseUser) return;
    const batch = writeBatch(firestore);
    newTasks.forEach(task => {
        const taskRef = doc(collection(firestore, 'users', firebaseUser.uid, 'tasks'));
        batch.set(taskRef, {
            id: taskRef.id,
            userId: firebaseUser.uid,
            title: task.title,
            stage: 4,
            completed: task.completed,
            generatedBy: 'AI',
            createdAt: serverTimestamp(),
        });
    });
    await batch.commit();
  }, [firestore, firebaseUser]);

  const updateTaskStatus = useCallback(async (taskId: string, completed: boolean) => {
    if (!firebaseUser) return;
    const taskRef = doc(firestore, 'users', firebaseUser.uid, 'tasks', taskId);
    await updateDoc(taskRef, { completed });
  }, [firestore, firebaseUser]);


  const value = useMemo(() => ({
    user: appUser,
    loading: authProviderLoading,
    login,
    signup,
    googleSignIn,
    sendPasswordReset,
    logout,
    updateProfile,
    setStage,
    shortlistUniversity,
    removeShortlistedUniversity,
    lockUniversities,
    unlockUniversities,
    updateTasks,
    updateTaskStatus,
    shortlistedUniversities: appUser?.shortlistedUniversities || [],
    lockedUniversities: appUser?.lockedUniversities || [],
    applicationTasks: appUser?.applicationTasks || [],
    profileStrength: appUser?.state?.profileStrength || null,
    updateProfileStrength,
  }), [appUser, authProviderLoading, login, signup, googleSignIn, sendPasswordReset, logout, updateProfile, setStage, shortlistUniversity, removeShortlistedUniversity, lockUniversities, unlockUniversities, updateTasks, updateTaskStatus, updateProfileStrength]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
