'use client';

import { useAuth } from '@/providers/auth-provider';
import { StageIndicator } from '@/components/dashboard/stage-indicator';
import { AiGuidance } from '@/components/dashboard/ai-guidance';
import { InfoPanel } from '@/components/dashboard/info-panel';
import Stage2Discovery from '@/components/dashboard/stages/stage2-discovery';
import Stage3Finalize from '@/components/dashboard/stages/stage3-finalize';
import Stage4Applications from '@/components/dashboard/stages/stage4-applications';

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  const renderStageContent = () => {
    switch (user.currentStage) {
      case 2:
        return <Stage2Discovery />;
      case 3:
        return <Stage3Finalize />;
      case 4:
        return <Stage4Applications />;
      default:
        // Stage 1 is onboarding, user should not be here with stage 1
        return (
            <div className="text-center p-8 bg-card rounded-lg">
                <p>Loading your space...</p>
            </div>
        );
    }
  };

  return (
    <main className="container mx-auto px-4 md:px-6 py-8 flex-grow">
        <div className="max-w-5xl mx-auto space-y-8">
            <StageIndicator currentStage={user.currentStage} />
            <AiGuidance />
            {renderStageContent()}
            <InfoPanel />
        </div>
    </main>
  );
}
