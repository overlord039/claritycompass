'use client';

import { useAuth } from '@/providers/auth-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { InfoPanel } from '@/components/dashboard/info-panel';
import { AiGuidance } from '@/components/dashboard/ai-guidance';
import Stage2Discovery from '@/components/dashboard/stages/stage2-discovery';
import Stage3Finalize from '@/components/dashboard/stages/stage3-finalize';
import Stage4Applications from '@/components/dashboard/stages/stage4-applications';
import { StageWrapper } from '@/components/dashboard/stages/stage-wrapper';
import { User } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Stage 1 is handled by redirecting to onboarding, but we can have a fallback view.
function Stage1BuildProfile() {
    return (
        <StageWrapper
            icon={User}
            title="Build Your Profile"
            description="Complete your profile to unlock personalized university recommendations from your AI Counsellor."
        >
            <div className="text-center py-10">
                <p className="text-muted-foreground mb-4">
                    Your journey begins with a strong profile. Let's get started.
                </p>
                <Button asChild>
                    <Link href="/onboarding">
                        Go to Onboarding
                    </Link>
                </Button>
            </div>
        </StageWrapper>
    )
}

export default function DashboardPage() {
    const { user, loading } = useAuth();

    if (loading || !user) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Skeleton className='h-96 w-full' />
                </div>
                <div className="space-y-6">
                    <Skeleton className='h-80 w-full' />
                    <Skeleton className='h-64 w-full' />
                </div>
            </div>
        );
    }
    
    const renderCurrentStage = () => {
        switch (user.currentStage) {
            case 1:
                return <Stage1BuildProfile />;
            case 2:
                return <Stage2Discovery />;
            case 3:
                return <Stage3Finalize />;
            case 4:
                return <Stage4Applications />;
            default:
                return <div>Unknown Stage: {user.currentStage}</div>;
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
                {renderCurrentStage()}
            </div>
            <div className="space-y-6 sticky top-24">
                <InfoPanel />
                <AiGuidance />
            </div>
        </div>
    );
}
