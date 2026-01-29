'use client';

import { useAuth } from '@/providers/auth-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { ProfileAnalysisCard } from '@/components/dashboard/cards/profile-analysis-card';
import { ShortlistedUniversitiesCard } from '@/components/dashboard/cards/shortlisted-universities-card';
import { NextMissionCard } from '@/components/dashboard/cards/next-mission-card';
import { JournalCard } from '@/components/dashboard/cards/journal-card';
import { SessionsCard } from '@/components/dashboard/cards/sessions-card';

export default function DashboardHomePage() {
    const { loading, user } = useAuth();

    if (loading || !user) {
        return (
            <div className="space-y-6">
                <Skeleton className='h-64 w-full' />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Skeleton className='h-80 w-full' />
                    <Skeleton className='h-80 w-full lg:col-span-2' />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-headline">Welcome, {user.fullName?.split(' ')[0]}!</h1>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-3">
                    <ProfileAnalysisCard />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:col-span-3 gap-6">
                    <div className="md:col-span-1">
                        <NextMissionCard />
                    </div>
                    <div className="md:col-span-1">
                         <ShortlistedUniversitiesCard />
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 xl:col-span-3 gap-6">
                    <JournalCard />
                    <SessionsCard />
                </div>
            </div>
        </div>
    );
}
