'use client';

import { useAuth } from '@/providers/auth-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { ProfileAnalysisCard } from '@/components/dashboard/cards/profile-analysis-card';
import { NextMissionCard } from '@/components/dashboard/cards/next-mission-card';
import { StageIndicator } from '@/components/dashboard/stage-indicator';
import { AiChatCard } from '@/components/dashboard/cards/ai-chat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RotateCcw } from 'lucide-react';
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
import { useRouter } from 'next/navigation';

export default function DashboardHomePage() {
    const { loading, user, unlockUniversities } = useAuth();
    const router = useRouter();

    const handleUnlock = async () => {
        await unlockUniversities();
        router.push('/dashboard/finalize');
    };

    if (loading || !user) {
        return (
            <Card className="bg-card/60 backdrop-blur-xl border-primary/10 shadow-2xl shadow-primary/10">
                <CardContent className="p-6 space-y-6">
                    <Skeleton className="h-24 w-full" />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <Skeleton className="h-56 w-full" />
                            <Skeleton className="h-[500px] w-full" />
                        </div>
                        <div className="space-y-6">
                            <Skeleton className="h-56 w-full" />
                            <Skeleton className="h-56 w-full" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-card/60 backdrop-blur-xl border-primary/10 shadow-2xl shadow-primary/10">
            <CardContent className="p-6 space-y-6">
                <div className="bg-background/50 rounded-lg p-6">
                    <StageIndicator currentStage={user.currentStage} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <ProfileAnalysisCard />
                        <AiChatCard />
                    </div>
                    <div className="space-y-6">
                        <NextMissionCard />
                        {user.currentStage >= 5 && (
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
            </CardContent>
        </Card>
    );
}
