'use client';

import { useAuth } from '@/providers/auth-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { ProfileAnalysisCard } from '@/components/dashboard/cards/profile-analysis-card';
import { ShortlistedUniversitiesCard } from '@/components/dashboard/cards/shortlisted-universities-card';
import { NextMissionCard } from '@/components/dashboard/cards/next-mission-card';
import { AiGuidance } from '@/components/dashboard/ai-guidance';


export default function DashboardHomePage() {
    const { loading, user } = useAuth();

    if (loading || !user) {
        return (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Skeleton className="h-56 w-full" />
                    <Skeleton className="h-56 w-full" />
                </div>
                <div className="space-y-6">
                    <Skeleton className="h-56 w-full" />
                    <Skeleton className="h-56 w-full" />
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <ProfileAnalysisCard />
                <ShortlistedUniversitiesCard />
            </div>
            <div className="space-y-6">
                <NextMissionCard />
                <AiGuidance />
            </div>
        </div>
    );
}
