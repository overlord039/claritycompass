'use client';

import { useEffect, type ReactNode, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { Header } from '@/components/header';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    } else if (!loading && user && !user.onboardingComplete) {
      router.replace('/onboarding');
    }
  }, [user, loading, router]);

  const navItems = useMemo(() => [
    { name: 'Dashboard', value: 'dashboard', href: '/dashboard' },
    { name: 'Universities', value: 'discover', href: '/dashboard/discover' },
    { name: 'To-do List', value: 'tasks', href: '/dashboard/tasks' },
    { name: 'Notes/Sessions', value: 'forums', href: '/dashboard/forums' },
  ], []);

  const currentTab = useMemo(() => {
    const segments = pathname.split('/');
    // Handles '/dashboard' and '/dashboard/'
    if (segments.length <= 2 || segments[2] === '') return 'dashboard';
    // Handles '/dashboard/discover', etc.
    return segments[2];
  }, [pathname]);

  const handleTabChange = (value: string) => {
    const item = navItems.find(item => item.value === value);
    if (item) {
        router.push(item.href);
    }
  };


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
      <Tabs value={currentTab} onValueChange={handleTabChange} className="flex flex-col flex-grow">
        <div className="border-b bg-background">
            <div className="container mx-auto px-4 md:px-6 w-full overflow-x-auto">
              <TabsList className="bg-transparent p-0">
                  {navItems.map((item) => (
                      <TabsTrigger 
                          key={item.value} 
                          value={item.value}
                          className="font-semibold shrink-0 text-muted-foreground data-[state=active]:text-foreground data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-primary transition-none px-4"
                      >
                          {item.name.toUpperCase()}
                      </TabsTrigger>
                  ))}
              </TabsList>
            </div>
        </div>
        <TabsContent value={currentTab} className="flex-grow mt-0">
          <main className={cn(
            "h-full flex-grow container mx-auto px-4 md:px-6 py-6",
            "overflow-y-auto"
          )}>
            {children}
          </main>
        </TabsContent>
      </Tabs>
    </div>
  );
}
