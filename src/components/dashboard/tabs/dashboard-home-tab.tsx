'use client';

import { useAuth } from '@/providers/auth-provider';
import { ProfileAnalysisCard } from '@/components/dashboard/cards/profile-analysis-card';
import { NextMissionCard } from '@/components/dashboard/cards/next-mission-card';
import { AiChatCard } from '@/components/dashboard/cards/ai-chat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RotateCcw, User, Compass, Lock, FileText, Check, PartyPopper } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function DashboardHomeTab({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
    const { user, unlockUniversities } = useAuth();
    
    const handleUnlock = async () => {
        await unlockUniversities();
        setActiveTab('universities');
    };

    if (!user) return null;

    const adjustedStages = [
        { id: 1, name: 'Build Profile', Icon: User },
        { id: 2, name: 'Discover Universities', Icon: Compass },
        { id: 3, name: 'Finalize Choices', Icon: Lock },
        { id: 4, name: 'Prepare Applications', Icon: FileText },
    ];
    
    const isPreparationCompleted = !!user.state?.applicationPreparationCompleted;
    const finalStageCompleted = user.currentStage >= 5 || isPreparationCompleted;

    return (
        <div className="space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Your Journey</CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                    <div className="relative">
                        <ol role="list" className="flex items-center">
                            {adjustedStages.map((stage, stageIdx) => {
                                const isCompleted = user.currentStage > stage.id || (stage.id === 4 && finalStageCompleted);
                                const isCurrent = user.currentStage === stage.id && !finalStageCompleted;
                                const isLastStage = stageIdx === adjustedStages.length - 1;

                                return (
                                    <li key={stage.name} className={cn('relative', !isLastStage && 'flex-1')}>
                                    {!isLastStage && (
                                        <div
                                        className={cn(
                                            "absolute left-4 top-4 -ml-px mt-0.5 h-0.5 w-full",
                                            isCompleted ? "bg-primary" : "bg-border"
                                        )}
                                        aria-hidden="true"
                                        />
                                    )}
                                    
                                    <div className="relative flex flex-col items-center text-center">
                                        <div
                                        className={cn(
                                            'relative flex h-8 w-8 items-center justify-center rounded-full',
                                            isCompleted ? 'bg-primary' : 'border-2 bg-background',
                                            isCurrent ? 'border-primary animate-pulse-glow' : 'border-border'
                                        )}
                                        >
                                        {isCompleted ? (
                                            <Check className="h-5 w-5 text-primary-foreground" />
                                        ) : (
                                            <stage.Icon className={cn('h-4 w-4', isCurrent ? 'text-primary' : 'text-muted-foreground')} />
                                        )}
                                        </div>
                                        <p className={cn(
                                        "mt-2 text-[10px] sm:text-xs font-medium w-20 sm:w-auto",
                                        isCurrent ? 'text-primary' : 'text-muted-foreground',
                                        isCompleted && 'text-foreground'
                                        )}>
                                        {stage.name}
                                        </p>
                                    </div>
                                    </li>
                                );
                            })}
                        </ol>
                        {finalStageCompleted && (
                            <div className="absolute right-[-1.5rem] md:right-[-2rem] top-[-0.75rem] -mr-px flex">
                                <div className="relative flex flex-col items-center text-center ml-4">
                                     <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                                        <PartyPopper className="h-5 w-5 text-primary-foreground" />
                                    </div>
                                    <p className="mt-2 text-xs font-medium text-primary w-24">Application Ready</p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <ProfileAnalysisCard />
                    <AiChatCard />
                </div>
                <div className="space-y-6">
                    <NextMissionCard setActiveTab={setActiveTab} />
                    {user && user.currentStage >= 5 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                    <RotateCcw className="h-4 w-4" />
                                    Re-strategize
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-muted-foreground mb-4">Unlock your choices to add or change universities. This will reset your current action plan.</p>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="outline" className="w-full">Add/Change University</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Adding another university or changing your choices will reset your current preparation plan and all associated tasks.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleUnlock}>Confirm & Re-strategize</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
