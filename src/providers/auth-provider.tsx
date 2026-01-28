'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useCallback } from 'react';
import type { User, Profile, ProfileStrength, ApplicationTask } from '@/lib/types';
import { useRouter } from 'next/navigation';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, name: string) => void;
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

const initialUser: User = {
  uid: 'mock-user-123',
  email: 'johndoe@example.com',
  fullName: 'John Doe',
  onboardingComplete: false,
  currentStage: 1,
  profile: null,
  profileStrength: null,
  shortlistedUniversities: [],
  lockedUniversities: [],
  applicationTasks: [],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  React.useEffect(() => {
    // Simulate checking for a logged-in user
    const storedUser = localStorage.getItem('clarity-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const persistUser = (updatedUser: User | null) => {
    if (updatedUser) {
      localStorage.setItem('clarity-user', JSON.stringify(updatedUser));
    } else {
      localStorage.removeItem('clarity-user');
    }
    setUser(updatedUser);
  };

  const login = useCallback((email: string, fullName: string) => {
    const newUser: User = { ...initialUser, email, fullName };
    persistUser(newUser);
    router.push(newUser.onboardingComplete ? '/dashboard' : '/onboarding');
  }, [router]);

  const logout = useCallback(() => {
    persistUser(null);
    router.push('/login');
  }, [router]);

  const updateProfile = useCallback((profileData: Profile) => {
    if (user) {
      const updatedUser: User = {
        ...user,
        profile: profileData,
        onboardingComplete: true,
        currentStage: 2,
      };
      persistUser(updatedUser);
    }
  }, [user]);
  
  const updateProfileStrength = useCallback((strength: ProfileStrength) => {
    if (user) {
        persistUser({ ...user, profileStrength: strength });
    }
  }, [user]);

  const setStage = useCallback((stage: 1 | 2 | 3 | 4) => {
    if (user) {
        persistUser({ ...user, currentStage: stage });
    }
  }, [user]);

  const shortlistUniversity = useCallback((universityName: string) => {
    if (user && !user.shortlistedUniversities.includes(universityName)) {
        persistUser({
        ...user,
        shortlistedUniversities: [...user.shortlistedUniversities, universityName],
      });
    }
  }, [user]);

  const removeShortlistedUniversity = useCallback((universityName: string) => {
    if (user) {
        persistUser({
        ...user,
        shortlistedUniversities: user.shortlistedUniversities.filter(
          (name) => name !== universityName
        ),
      });
    }
  }, [user]);

  const lockUniversities = useCallback((universityNames: string[]) => {
    if (user) {
        persistUser({
        ...user,
        lockedUniversities: universityNames,
        currentStage: 4,
      });
    }
  }, [user]);

  const unlockUniversities = useCallback(() => {
    if (user) {
        persistUser({
        ...user,
        lockedUniversities: [],
        currentStage: 3,
        applicationTasks: [], // Reset tasks
      });
    }
  }, [user]);

  const updateTasks = useCallback((tasks: ApplicationTask[]) => {
    if (user) {
        persistUser({ ...user, applicationTasks: tasks });
    }
  }, [user]);

  const updateTaskStatus = useCallback((taskId: string, status: ApplicationTask['status']) => {
    if (user) {
      const updatedTasks = user.applicationTasks.map(task => 
        task.id === taskId ? { ...task, status } : task
      );
      persistUser({ ...user, applicationTasks: updatedTasks });
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
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
      }}
    >
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
