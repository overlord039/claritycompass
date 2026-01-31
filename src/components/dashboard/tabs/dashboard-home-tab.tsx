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
        { id: 1, name: 'Build Profile', Icon: User, description: 'Complete your profile to unlock AI recommendations.' },
        { id: 2, name: 'Discover Universities', Icon: Compass, description: 'Explore universities matched to your profile.' },
        { id: 3, name: 'Finalize Choices', Icon: Lock, description: 'Shortlist and lock your final university choices.' },
        { id: 4, name: 'Prepare Applications', Icon: FileText, description: 'Follow your personalized application plan.' },
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
                    <ol className="relative border-l border-border/20 ml-4">
                        {adjustedStages.map((stage) => {
                            const isCompleted = user.currentStage > stage.id || (stage.id === 4 && finalStageCompleted);
                            const isCurrent = user.currentStage === stage.id && !finalStageCompleted;

                            return (
                                <li key={stage.id} className="mb-8 ml-8">
                                    <span
                                        className={cn(
                                            "absolute -left-[18px] flex items-center justify-center w-9 h-9 rounded-full ring-8 ring-background",
                                            isCompleted ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                                            isCurrent && 'border-2 border-primary animate-pulse-glow bg-primary/10 text-primary'
                                        )}
                                    >
                                        {isCompleted ? <Check className="h-5 w-5" /> : <stage.Icon className="h-5 w-5" />}
                                    </span>
                                    <div className='-mt-1'>
                                        <h3 className={cn("font-semibold", isCurrent || isCompleted ? "text-foreground" : "text-muted-foreground")}>
                                            {stage.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">{stage.description}</p>
                                    </div>
                                </li>
                            );
                        })}
                        {finalStageCompleted && (
                            <li className="ml-8">
                                <span className="absolute -left-[18px] flex items-center justify-center w-9 h-9 bg-primary text-primary-foreground rounded-full ring-8 ring-background">
                                    <PartyPopper className="h-5 w-5" />
                                </span>
                                <div className='-mt-1'>
                                    <h3 className="font-semibold text-primary">Application Ready</h3>
                                    <p className="text-sm text-muted-foreground">Congratulations! You're ready to submit your applications.</p>
                                </div>
                            </li>
                        )}
                    </ol>
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
