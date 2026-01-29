'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { generateApplicationTasks } from '@/lib/actions';
import { StageWrapper } from './stage-wrapper';
import { Button } from '@/components/ui/button';
import { ClipboardCheck, RotateCcw, CalendarDays, FileText, ListChecks, Lightbulb, Lock } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useFirestore } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function Stage4Applications() {
    const { user, updateTasks, unlockUniversities, updateTaskStatus, applicationTasks } = useAuth();
    const [loading, setLoading] = useState(false);
    const firestore = useFirestore();

    useEffect(() => {
        const generateTasks = async () => {
            // Generate plan only if universities are locked but there's no plan yet.
            if (user && user.profile && user.lockedUniversities.length > 0 && !user.state?.actionPlan) {
                setLoading(true);
                // For simplicity, we'll generate tasks for the first locked university.
                const result = await generateApplicationTasks({
                    universityName: user.lockedUniversities[0],
                    userProfile: JSON.stringify(user.profile),
                    recommendations: user.state?.recommendations || 'No specific recommendations provided.',
                });

                if (result) {
                    const { tasks, applicationStrategy } = result;

                    // Persist the action plan to user's state document
                    if (firestore && user.uid) {
                        const userStateRef = doc(firestore, 'user_state', user.uid);
                        await setDoc(userStateRef, { actionPlan: applicationStrategy }, { merge: true });
                    }


                    if (tasks) {
                        const newTasks = tasks.map(task => ({
                            title: task.title,
                            completed: false, // New tasks always start as not completed
                        }));
                        await updateTasks(newTasks);
                    }
                }
                setLoading(false);
            }
        };

        generateTasks();
    }, [user, updateTasks, firestore]);

    const actionPlan = user?.state?.actionPlan;
    const tasks = applicationTasks || [];
    const completedTasks = tasks.filter(task => task.completed).length;
    const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;


    if (loading || (user && user.lockedUniversities.length > 0 && !actionPlan)) {
         return (
            <StageWrapper 
                icon={ClipboardCheck} 
                title="Preparing Your Action Plan" 
                description={`You've locked your university choices! The AI is now generating your personalized strategy and tasks.`}
            >
                <div className="space-y-8 py-4">
                    {user?.lockedUniversities && user.lockedUniversities.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><Lock className="h-5 w-5 text-primary" /> Locked Universities</h3>
                            <div className="grid grid-cols-1 gap-2">
                                {user.lockedUniversities.map((uni, index) => (
                                    <div key={index} className="p-3 rounded-md bg-background/50 border">
                                        <p className="font-semibold text-foreground">{uni}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {user?.state?.recommendations && (
                        <div>
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><Lightbulb className="h-5 w-5 text-primary" /> Key Recommendations</h3>
                            <p className="text-muted-foreground text-sm whitespace-pre-line">{user.state.recommendations}</p>
                        </div>
                    )}
                    
                    <div className="pt-4 border-t border-dashed">
                        <p className='text-center text-muted-foreground text-sm mb-4'>Generating your detailed timeline, document list, and to-do items...</p>
                        <div className="space-y-4">
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-32 w-full" />
                        </div>
                    </div>
                </div>
            </StageWrapper>
         )
    }

    return (
        <StageWrapper icon={ClipboardCheck} title="Your Application Plan" description={`Here is your action plan for ${user?.lockedUniversities.join(', ')}. Complete these tasks to stay on track.`}>
            <div className="space-y-8">
                {actionPlan?.summary && (
                     <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><Lightbulb className="h-5 w-5 text-primary" /> Application Strategy</h3>
                        <p className="text-muted-foreground text-sm">{actionPlan.summary}</p>
                    </div>
                )}
                {actionPlan?.timeline && actionPlan.timeline.length > 0 && (
                     <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><CalendarDays className="h-5 w-5 text-primary" /> Application Timeline</h3>
                        <div className="space-y-4 border-l-2 border-primary/20 border-dashed pl-6 ml-2">
                            {actionPlan.timeline.map((item, index) => (
                                <div key={index} className="relative">
                                    <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-primary ring-4 ring-background" />
                                    <p className="font-semibold text-foreground">{item.phase}: {item.focus}</p>
                                    <p className="text-sm text-muted-foreground">Est. Duration: {item.duration}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {actionPlan?.requiredDocuments && actionPlan.requiredDocuments.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Required Documents</h3>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 list-disc list-inside text-muted-foreground pl-2">
                            {actionPlan.requiredDocuments.map((doc, index) => (
                                <li key={index}>{doc}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {tasks.length > 0 ? (
                     <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><ListChecks className="h-5 w-5 text-primary" /> Your To-Do List</h3>
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
