'use client';

import { useAuth } from '@/providers/auth-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { ProfileAnalysisCard } from '@/components/dashboard/cards/profile-analysis-card';
import { ShortlistedUniversitiesCard } from '@/components/dashboard/cards/shortlisted-universities-card';
import { NextMissionCard } from '@/components/dashboard/cards/next-mission-card';
import { JournalCard } from '@/components/dashboard/cards/journal-card';
import { SessionsCard } from '@/components/dashboard/cards/sessions-card';
import { AiGuidance } from '@/components/dashboard/ai-guidance';

export default function DashboardHomePage() {
    const { loading, user } = useAuth();

    if (loading || !user) {
        return (
             <div className="grid grid-cols-4 grid-rows-2 gap-6 h-full">
                <Skeleton className="col-span-2 row-span-1" />
                <Skeleton className="col-span-1 row-span-1" />
                <div className="col-span-1 row-span-1 flex flex-col gap-6">
                    <Skeleton className="flex-grow" />
                    <Skeleton className="flex-grow" />
                </div>
                <Skeleton className="col-span-3 row-span-1" />
                <Skeleton className="col-span-1 row-span-1" />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-4 grid-rows-2 gap-6 h-full">
            <div className="col-span-2 row-span-1">
                <ProfileAnalysisCard />
            </div>
            <div className="col-span-1 row-span-1">
                <NextMissionCard />
            </div>
            <div className="col-span-1 row-span-1 flex flex-col gap-6">
                <SessionsCard />
                <JournalCard />
            </div>
            <div className="col-span-3 row-span-1">
                <ShortlistedUniversitiesCard />
            </div>
            <div className="col-span-1 row-span-1">
                <AiGuidance />
            </div>
        </div>
    );
}
