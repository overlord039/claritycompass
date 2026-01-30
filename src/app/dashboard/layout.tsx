'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { Header } from '@/components/header';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

function DashboardNav() {
    const pathname = usePathname();
    const navItems = [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Universities', href: '/dashboard/discover' },
        { name: 'To-do List', href: '/dashboard/tasks' },
        { name: 'Notes/Sessions', href: '/dashboard/forums' },
    ];

    return (
        <nav className="flex items-center space-x-2">
            {navItems.map((item) => (
                <Button
                    key={item.name}
                    asChild
                    variant={pathname === item.href ? 'secondary' : 'ghost'}
                    className={cn(
                        "font-semibold",
                        pathname === item.href ? "text-foreground" : "text-muted-foreground"
                    )}
                >
                    <Link href={item.href}>{item.name.toUpperCase()}</Link>
                </Button>
            ))}
        </nav>
    );
}


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
      <div className="border-b bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <DashboardNav />
          </div>
      </div>
      <main className={cn(
        "flex-grow container mx-auto px-4 md:px-6 py-6",
        "overflow-y-auto"
      )}>
        {children}
      </main>
    </div>
  );
}
