'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { User as AppUser, Profile, ProfileStrength, ApplicationTask } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { 
    useUser, 
    useFirestore, 
    useAuth as useFirebaseAuth, 
    useDoc, 
    useMemoFirebase,
    setDocumentNonBlocking,
} from '@/firebase';
import { 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut,
    sendPasswordResetEmail,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

type AuthContextType = {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => void;
  signup: (fullName: string, email: string, password: string) => void;
  googleSignIn: () => void;
  sendPasswordReset: (email: string) => void;
  logout: () => void;
  updateProfile: (profileData: Profile) => void;
  updateProfileStrength: (strength: ProfileStrength) => void;
  setStage: (stage: 1 | 2 | 3 | 4) => void;
  shortlistUniversity: (universityName: string) => void;
  removeShortlistedUniversity: (universityName: string) => void;
  lockUniversities: (universityNames: string[]) => void;
  unlockUniversities: () => void;
  updateTasks: (tasks: ApplicationTask[]) => void;
  updateTaskStatus: (taskId: string, status: ApplicationTask['status']) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const { user: firebaseUser, isUserLoading: isAuthLoading } = useUser();
  const auth = useFirebaseAuth();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => 
    firestore && firebaseUser ? doc(firestore, 'users', firebaseUser.uid) : null
  , [firestore, firebaseUser]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<AppUser>(userProfileRef);

  useEffect(() => {
      const isSystemLoading = isAuthLoading || (firebaseUser && isProfileLoading);
      setLoading(isSystemLoading);
      if (!isSystemLoading && firebaseUser && userProfile) {
          setAppUser(userProfile);
      } else if (!isSystemLoading && !firebaseUser) {
          setAppUser(null);
      }
  }, [firebaseUser, userProfile, isAuthLoading, isProfileLoading]);

  const login = useCallback(async (email: string, password: string) => {
    if (loading) return;
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const existingUser = userDocSnap.data() as AppUser;
            setAppUser(existingUser);
            router.push(existingUser.onboardingComplete ? '/dashboard' : '/onboarding');
        } else {
            await signOut(auth);
            toast({ variant: 'destructive', title: 'Login failed', description: 'Your user profile could not be found. Please try signing up again.' });
        }
    } catch (error: any) {
        let description = 'An unexpected error occurred. Please try again.';
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            description = 'Invalid email or password. Please try again.';
        }
        toast({ variant: 'destructive', title: 'Login failed', description });
    }
  }, [auth, firestore, router, toast, loading]);

  const signup = useCallback(async (fullName: string, email: string, password: string) => {
      if (loading) return;
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const initialUser: AppUser = {
            id: user.uid,
            email: user.email,
            fullName: fullName,
            onboardingComplete: false,
            currentStage: 1,
            profile: null,
            profileStrength: null,
            shortlistedUniversities: [],
            lockedUniversities: [],
            applicationTasks: [],
        };
        await setDoc(doc(firestore, 'users', user.uid), initialUser);
        setAppUser(initialUser);
        router.push('/onboarding');
      } catch (error: any) {
          if (error.code === 'auth/email-already-in-use') {
            toast({ variant: 'destructive', title: 'Sign up failed', description: 'This email is already registered. Please login.' });
          } else {
            toast({ variant: 'destructive', title: 'Sign up failed', description: 'An unexpected error occurred. Please try again.' });
          }
      }
  }, [auth, firestore, router, toast, loading]);

  const googleSignIn = useCallback(async () => {
    if (loading) return;
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
             const initialUser: AppUser = {
                id: user.uid,
                email: user.email,
                fullName: user.displayName,
                onboardingComplete: false,
                currentStage: 1,
                profile: null,
                profileStrength: null,
                shortlistedUniversities: [],
                lockedUniversities: [],
                applicationTasks: [],
            };
            await setDoc(userDocRef, initialUser);
            setAppUser(initialUser);
            router.push('/onboarding');
        } else {
            const existingUser = userDocSnap.data() as AppUser;
            setAppUser(existingUser);
            router.push(existingUser.onboardingComplete ? '/dashboard' : '/onboarding');
        }
    } catch(error: any) {
        toast({ variant: 'destructive', title: 'Google Sign-In failed', description: 'An unexpected error occurred. Please try again.' });
    }
  }, [auth, firestore, router, toast, loading]);
  
  const sendPasswordReset = useCallback(async (email: string) => {
    try {
        await sendPasswordResetEmail(auth, email);
        toast({ title: 'Password Reset Email Sent', description: 'Check your inbox for a password reset link.' });
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred. Please try again.' });
    }
  }, [auth, toast]);

  const logout = useCallback(async () => {
    await signOut(auth);
    setAppUser(null);
    router.push('/login');
  }, [auth, router]);

  const updateUser = (data: Partial<AppUser>) => {
      if (appUser) {
          const updatedUser = { ...appUser, ...data };
          setDocumentNonBlocking(doc(firestore, 'users', appUser.id), updatedUser, { merge: true });
          setAppUser(updatedUser); // Optimistic update
      }
  };

  const updateProfile = useCallback((profileData: Profile) => {
    if (!appUser) return;
    const updatedUser = { ...appUser, profile: profileData, onboardingComplete: true, currentStage: 2 as const };
    setDocumentNonBlocking(doc(firestore, 'users', appUser.id), updatedUser, { merge: true });
    setAppUser(updatedUser);
    router.push('/dashboard');
  }, [appUser, firestore, router]);
  
  const updateProfileStrength = useCallback((strength: ProfileStrength) => {
    updateUser({ profileStrength: strength });
  }, [appUser]);

  const setStage = useCallback((stage: 1 | 2 | 3 | 4) => {
    updateUser({ currentStage: stage });
  }, [appUser]);

  const shortlistUniversity = useCallback((universityName: string) => {
    if (appUser && !appUser.shortlistedUniversities.includes(universityName)) {
        updateUser({ shortlistedUniversities: [...appUser.shortlistedUniversities, universityName] });
    }
  }, [appUser]);

  const removeShortlistedUniversity = useCallback((universityName: string) => {
    if (appUser) {
        updateUser({ shortlistedUniversities: appUser.shortlistedUniversities.filter(name => name !== universityName) });
    }
  }, [appUser]);

  const lockUniversities = useCallback((universityNames: string[]) => {
    updateUser({ lockedUniversities: universityNames, currentStage: 4 });
  }, [appUser]);

  const unlockUniversities = useCallback(() => {
    updateUser({ lockedUniversities: [], currentStage: 3, applicationTasks: [] });
  }, [appUser]);

  const updateTasks = useCallback((tasks: ApplicationTask[]) => {
    updateUser({ applicationTasks: tasks });
  }, [appUser]);

  const updateTaskStatus = useCallback((taskId: string, status: ApplicationTask['status']) => {
    if (appUser) {
      const updatedTasks = appUser.applicationTasks.map(task => 
        task.id === taskId ? { ...task, status } : task
      );
      updateUser({ applicationTasks: updatedTasks });
    }
  }, [appUser]);

  const value = {
    user: appUser,
    loading,
    login,
    signup,
    googleSignIn,
    sendPasswordReset,
    logout,
    updateProfile,
    updateProfileStrength,
    setStage,
    shortlistUniversity,
    removeShortlistedUniversity,
    lockUniversities,
    unlockUniversities,
    updateTasks,
    updateTaskStatus,
  };

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
