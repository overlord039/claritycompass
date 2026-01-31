'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { Header } from '@/components/header';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    } else if (!loading && user && !user.onboardingComplete) {
      router.replace('/onboarding');
    }
  }, [user, loading, router]);

  if (loading || !user || !user.onboardingComplete) {
    return (
        <div className="flex flex-col min-h-screen">
            <header className="sticky top-0 z-40 w-full border-b bg-background/60 backdrop-blur-lg">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                    <Skeleton className='h-8 w-48' />
                    <Skeleton className='h-10 w-10 rounded-full' />
                </div>
            </header>
            <main className="container mx-auto px-4 md:px-6 py-8 flex-grow">
                <div className="max-w-4xl mx-auto space-y-8">
                    <Skeleton className='h-24 w-full' />
                    <Skeleton className='h-64 w-full' />
                    <Skeleton className='h-48 w-full' />
                </div>
            </main>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-muted/20">
      <Header />
      <main className="flex-grow container mx-auto px-4 md:px-6 py-6">
        {children}
      </main>
    </div>
  );
}
