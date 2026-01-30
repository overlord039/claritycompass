'use client';

import { useAuth } from '@/providers/auth-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { ProfileAnalysisCard } from '@/components/dashboard/cards/profile-analysis-card';
import { ShortlistedUniversitiesCard } from '@/components/dashboard/cards/shortlisted-universities-card';
import { NextMissionCard } from '@/components/dashboard/cards/next-mission-card';
import { AiGuidance } from '@/components/dashboard/ai-guidance';
import { StageIndicator } from '@/components/dashboard/stage-indicator';
import { AiChatCard } from '@/components/dashboard/cards/ai-chat-card';


export default function DashboardHomePage() {
    const { loading, user } = useAuth();

    if (loading || !user) {
        return (
             <div className="space-y-6">
                <Skeleton className="h-24 w-full" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-56 w-full" />
                        <Skeleton className="h-[500px] w-full" />
                    </div>
                    <div className="space-y-6">
                        <Skeleton className="h-56 w-full" />
                        <Skeleton className="h-56 w-full" />
                        <Skeleton className="h-56 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-card/60 backdrop-blur-xl border border-white/20 rounded-lg p-6 shadow-lg shadow-primary/5">
                <StageIndicator currentStage={user.currentStage} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <ProfileAnalysisCard />
                    <AiChatCard />
                </div>
                <div className="space-y-6">
                    <NextMissionCard />
                    <AiGuidance />
                    <ShortlistedUniversitiesCard />
                </div>
            </div>
        </div>
    );
}
