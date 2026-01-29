'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { generateApplicationTasks } from '@/lib/actions';
import { StageWrapper } from './stage-wrapper';
import { Button } from '@/components/ui/button';
import { ClipboardCheck, CheckCircle2, RotateCcw } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';

export default function Stage4Applications() {
    const { user, updateTasks, unlockUniversities } = useAuth();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const generateTasks = async () => {
            if (user && user.profile && user.lockedUniversities.length > 0 && user.applicationTasks.length === 0) {
                setLoading(true);
                // For simplicity, we'll generate tasks for the first locked university.
                const result = await generateApplicationTasks({
                    universityName: user.lockedUniversities[0],
                    degree: user.profile.studyGoal.intendedDegree,
                    major: user.profile.studyGoal.fieldOfStudy,
                    sopStatus: user.profile.readiness.sopStatus as any,
                    ieltsStatus: user.profile.readiness.ieltsStatus as any,
                    greStatus: user.profile.readiness.greStatus as any,
                });

                if (result && result.tasks) {
                    const newTasks = result.tasks.map(task => ({
                        title: task.task,
                        completed: task.status === 'Completed',
                    }));
                    await updateTasks(newTasks);
                }
                setLoading(false);
            }
        };

        generateTasks();
    }, [user, updateTasks]);

    if (loading || (user && user.lockedUniversities.length > 0 && user.applicationTasks.length === 0)) {
         return (
            <StageWrapper icon={ClipboardCheck} title="Prepare Applications" description="You've locked your university choices! Here's your personalized plan.">
                <div className="space-y-6 text-center">
                    <div className="flex justify-center">
                        <Skeleton className="w-16 h-16 rounded-full" />
                    </div>
                    <Skeleton className="h-6 w-1/2 mx-auto" />
                    <Skeleton className="h-4 w-3/4 mx-auto" />
                    <Skeleton className="h-4 w-2/3 mx-auto" />
                    <div className="flex justify-center gap-4 pt-4">
                        <Skeleton className="h-10 w-48" />
                    </div>
                </div>
            </StageWrapper>
         )
    }

    return (
        <StageWrapper icon={ClipboardCheck} title="Prepare Applications" description="You've locked your university choices! Here's your personalized plan.">
            <div className="space-y-6 text-center">
                <div className="flex justify-center">
                    <CheckCircle2 className="w-16 h-16 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold">Your Application Plan is Ready!</h3>
                <p className="text-muted-foreground">
                    I have analyzed your profile and the requirements for{' '}
                    <span className="font-semibold text-primary">{user?.lockedUniversities.join(', ')}</span>.
                    <br />
                    Your personalized to-do list has been generated and is now available in the "Application To-Do List" section of your dashboard below.
                </p>
                <div className="flex justify-center gap-4 pt-4">
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline">
                                <RotateCcw className="mr-2 h-4 w-4"/>
                                Unlock Choices & Re-strategize
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure you want to unlock?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Unlocking your university choices will reset your application plan and all associated tasks. You will be returned to the finalization stage.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => unlockUniversities()}>Confirm and Unlock</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </StageWrapper>
    );
}
