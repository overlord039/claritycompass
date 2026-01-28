'use client';

import { useAuth } from '@/providers/auth-provider';
import { StageIndicator } from '@/components/dashboard/stage-indicator';
import { AiGuidance } from '@/components/dashboard/ai-guidance';
import { InfoPanel } from '@/components/dashboard/info-panel';
import Stage2Discovery from '@/components/dashboard/stages/stage2-discovery';
import Stage3Finalize from '@/components/dashboard/stages/stage3-finalize';
import Stage4Applications from '@/components/dashboard/stages/stage4-applications';
import { motion } from 'framer-motion';

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
            <div className="text-center p-8 bg-card/60 backdrop-blur-lg rounded-lg">
                <p>Loading your space...</p>
            </div>
        );
    }
  };

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <main className="container mx-auto px-4 md:px-6 py-8 flex-grow">
        <motion.div 
            className="max-w-5xl mx-auto space-y-8"
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.15 }}
        >
            <motion.div variants={variants}>
                <StageIndicator currentStage={user.currentStage} />
            </motion.div>
            <motion.div variants={variants}>
                <AiGuidance />
            </motion.div>
            <motion.div variants={variants}>
                {renderStageContent()}
            </motion.div>
            <motion.div variants={variants}>
                <InfoPanel />
            </motion.div>
        </motion.div>
    </main>
  );
}
