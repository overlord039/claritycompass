'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { generateApplicationTasks } from '@/lib/actions';
import { StageWrapper } from './stage-wrapper';
import { Button } from '@/components/ui/button';
import { ClipboardCheck, RotateCcw } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export default function Stage4Applications() {
    const { user, updateTasks, unlockUniversities, updateTaskStatus, applicationTasks } = useAuth();
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

    const tasks = applicationTasks || [];
    const completedTasks = tasks.filter(task => task.completed).length;
    const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;


    if (loading || (user && user.lockedUniversities.length > 0 && tasks.length === 0)) {
         return (
            <StageWrapper icon={ClipboardCheck} title="Preparing Your Action Plan" description="You've locked your university choices! The AI is now generating your personalized tasks.">
                <div className="space-y-6 text-center py-8">
                    <div className="flex justify-center">
                        <Skeleton className="w-16 h-16 rounded-full" />
                    </div>
                    <Skeleton className="h-6 w-1/2 mx-auto" />
                    <Skeleton className="h-4 w-3/4 mx-auto" />
                    <div className="pt-4">
                        <Skeleton className="h-24 w-full" />
                    </div>
                </div>
            </StageWrapper>
         )
    }

    return (
        <StageWrapper icon={ClipboardCheck} title="Your Application Plan" description={`Here is your action plan for ${user?.lockedUniversities.join(', ')}. Complete these tasks to stay on track.`}>
            <div className="space-y-6">
                {tasks.length > 0 ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Progress value={progress} className="h-2" />
                            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">{completedTasks} / {tasks.length}</span>
                        </div>
                        <div className="space-y-3 rounded-lg border bg-background/30 p-4 max-h-96 overflow-y-auto">
                            {tasks.map(task => (
                                <div key={task.id} className="flex items-center space-x-3 p-3 rounded-md bg-background/50 border hover:bg-accent/50 transition-colors">
                                    <Checkbox 
                                        id={`stage-task-${task.id}`} 
                                        checked={task.completed}
                                        onCheckedChange={(checked) => updateTaskStatus(task.id, !!checked)}
                                    />
                                    <Label 
                                        htmlFor={`stage-task-${task.id}`} 
                                        className={`flex-grow cursor-pointer ${task.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}
                                    >
                                        {task.title}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground">It looks like you haven't locked any universities yet.</p>
                        <p className="text-muted-foreground">Go back to the "Finalize Choices" stage to select your universities and generate your plan.</p>
                    </div>
                )}
                
                <div className="flex justify-center gap-4 pt-4 border-t border-dashed">
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" disabled={(user?.lockedUniversities?.length ?? 0) === 0}>
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
