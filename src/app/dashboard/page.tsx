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
             <div className="h-full flex flex-col gap-6">
                <div className="flex flex-row gap-6">
                    <div className="w-[45%]"><Skeleton className="h-full" /></div>
                    <div className="w-[30%]"><Skeleton className="h-full" /></div>
                    <div className="w-[25%] flex flex-col gap-6"><Skeleton className="h-32" /><Skeleton className="flex-grow" /></div>
                </div>
                <div className="flex flex-row gap-6 flex-grow">
                    <div className="w-[75%]"><Skeleton className="h-full" /></div>
                    <div className="w-[25%]"><Skeleton className="h-full" /></div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col gap-6">
            {/* Top row */}
            <div className="flex flex-row gap-6">
                <div className="w-[45%]">
                     <ProfileAnalysisCard />
                </div>
                <div className="w-[30%]">
                    <NextMissionCard />
                </div>
                <div className="w-[25%] flex flex-col gap-6">
                    <SessionsCard />
                    <JournalCard />
                </div>
            </div>

            {/* Bottom row */}
            <div className="flex flex-row gap-6 flex-grow min-h-0">
                <div className="w-[75%] flex flex-col">
                    <ShortlistedUniversitiesCard />
                </div>
                <div className="w-[25%]">
                    <AiGuidance />
                </div>
            </div>
        </div>
    );
}
