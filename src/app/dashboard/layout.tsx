'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { Header } from '@/components/header';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading, setStage } = useAuth();
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

  const handleBack = () => {
      if (user.currentStage > 2) {
          setStage(user.currentStage - 1);
      } else {
          router.push('/');
      }
  };

  const handleNext = () => {
      if (user.currentStage < 4) {
          // This logic is simplified, as locking universities is a complex action
          setStage(user.currentStage + 1);
      }
  };


  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 md:px-6 py-8">
        {children}
      </main>
       <footer className="sticky bottom-0 z-40 mt-auto w-full border-t bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
            <Button variant="ghost" onClick={handleBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
            </Button>
            <Button onClick={handleNext} disabled={user.currentStage >= 4}>
                Next Step
                <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        </div>
      </footer>
    </div>
  );
}
