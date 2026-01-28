'use client';

import type { ReactNode } from 'react';
import React, from 'react';
import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import type { AppUser, UserProfile, UserState, ShortlistedUniversity, ApplicationTask } from '@/lib/types';
import { useRouter, usePathname } from 'next/navigation';
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
import { doc, setDoc, getDoc, serverTimestamp, writeBatch, collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

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
  shortlistUniversity: (universityData: Omit<ShortlistedUniversity, 'userId' | 'id'>) => Promise<void>;
  removeShortlistedUniversity: (universityId: string) => Promise<void>;
  lockUniversities: (universityIds: string[]) => Promise<void>;
  unlockUniversities: () => Promise<void>;
  updateTask: (task: ApplicationTask) => Promise<void>;
  updateTasks: (tasks: ApplicationTask[]) => Promise<void>;
  updateTaskStatus: (taskId: string, completed: boolean) => Promise<void>;
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

  // --- Mutation Functions ---
  const signup = useCallback(async (fullName: string, email: string, password: string) => {
    setAuthProviderLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const batch = writeBatch(firestore);

      const newUserDocRef = doc(firestore, 'users', user.uid);
      const newUser: Omit<AppUser, 'profile' | 'state' | 'shortlisted' | 'tasks'> = {
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
         // This case should ideally not happen if signup is correct
         await logout();
         toast({ variant: 'destructive', title: 'Login Failed', description: 'User profile not found.' });
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Login failed', description: 'Invalid email or password.' });
    } finally {
        setAuthProviderLoading(false);
    }
  }, [auth, firestore, toast, router]);

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

        const newUserBase: Omit<AppUser, 'profile' | 'state' | 'shortlisted' | 'tasks'> = {
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
        userData = { ...newUserBase, profile: null, state: newUserState, shortlisted: [], tasks: [] };
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

  const logout = useCallback(async () => {
    await signOut(auth);
    setAppUser(null);
    router.push('/login');
  }, [auth, router]);

  const updateProfile = useCallback(async (profileData: UserProfile) => {
    if (!firebaseUser) return;
    setAuthProviderLoading(true);
    const batch = writeBatch(firestore);

    const profileRef = doc(firestore, 'profiles', firebaseUser.uid);
    batch.set(profileRef, { ...profileData, lastUpdated: serverTimestamp() });
    
    const userRef = doc(firestore, 'users', firebaseUser.uid);
    batch.update(userRef, { onboardingComplete: true, currentStage: 2 });
    
    const stateRef = doc(firestore, 'user_state', firebaseUser.uid);
    batch.update(stateRef, { currentStage: 2 });
    
    await batch.commit();
    // No need to redirect here, the effect on `user` will do it.
    setAuthProviderLoading(false);
  }, [firestore, firebaseUser]);
  
  const setStage = async (stage: number) => {
    if (!firebaseUser) return;
    const batch = writeBatch(firestore);
    batch.update(doc(firestore, 'users', firebaseUser.uid), { currentStage: stage });
    batch.update(doc(firestore, 'user_state', firebaseUser.uid), { currentStage: stage });
    await batch.commit();
  };

  // Dummy implementations for now
  const shortlistUniversity = async (universityData: Omit<ShortlistedUniversity, 'userId' | 'id'>) => {};
  const removeShortlistedUniversity = async (universityId: string) => {};
  const lockUniversities = async (universityIds: string[]) => {};
  const unlockUniversities = async () => {};
  const updateTask = async (task: ApplicationTask) => {};
  const updateTasks = async (tasks: ApplicationTask[]) => {};
  const updateTaskStatus = async (taskId: string, completed: boolean) => {};


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
    updateTask,
    updateTasks,
    updateTaskStatus,
  }), [appUser, authProviderLoading, login, signup, googleSignIn, sendPasswordReset, logout, updateProfile]);

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
