'use client';

import { useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { StageWrapper } from '@/components/dashboard/stages/stage-wrapper';
import { Button } from '@/components/ui/button';
import { ClipboardCheck, RotateCcw, CalendarDays, FileText, ListChecks, Lightbulb, Lock, ArrowLeft } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useFirestore } from '@/firebase';
import { doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { universities as allUniversities } from '@/lib/data';
import type { AppUser } from '@/lib/types';

const PreparingSkeleton = ({ user }: { user: AppUser | null }) => (
    <StageWrapper 
        icon={ClipboardCheck} 
        title="Preparing Your Action Plan" 
        description={`You've locked your university choices! The system is now generating your personalized strategy and tasks.`}
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
);


export default function TasksPage() {
    const { user, loading: authLoading, unlockUniversities, updateTaskStatus, applicationTasks } = useAuth();
    const firestore = useFirestore();
    const router = useRouter();

    useEffect(() => {
        const generateTasks = async () => {
             if (!user || !user.profile || !firestore) return;
             if (user.lockedUniversities.length === 0) return;
             if (user.state?.actionPlan) return;

            const lockedUniversityName = user.lockedUniversities[0];
            const lockedUniversity = allUniversities.find(u => u.name === lockedUniversityName);

            if (!lockedUniversity) {
                console.error("Locked university or user profile not found");
                return;
            }
            
            const baseDocuments = ["Statement of Purpose (SOP)", "Academic Transcripts", "Resume / CV", "Passport Copy"];
            const documents = [...baseDocuments];
            if (lockedUniversity.ielts_required) documents.push("IELTS Score Report");
            if (lockedUniversity.gre_required) documents.push("GRE Score Report");
            if (user.profile.studyGoal.intendedDegree === "masters-mba") documents.push("Work Experience Certificate");
             if (user.profile.studyGoal.fieldOfStudy === "MBBS") {
                documents.push("Medical Fitness Certificate");
                documents.push("Eligibility Certificate");
            }
            if (user.profile.budget.fundingType !== "self-funded") documents.push("Financial Documents");

            const timeline = [
                { phase: "Phase 1", focus: "Profile & Document Preparation", duration: "1-2 Weeks" },
                { phase: "Phase 2", focus: "SOP Drafting and Refinement", duration: "2-3 Weeks" },
                { phase: "Phase 3", focus: "Exam Completion (if required)", duration: "4-6 Weeks" },
                { phase: "Phase 4", focus: "Application Form Submission", duration: "1 Week" },
                { phase: "Phase 5", focus: "Post-Submission Tracking", duration: "Ongoing" },
            ];

            const generatedTasks: { id: string, title: string, completed: boolean }[] = [];
            generatedTasks.push({ id: "task_sop", title: "Draft Statement of Purpose", completed: user.profile.readiness.sopStatus === "Ready" });
            generatedTasks.push({ id: "task_transcripts", title: "Collect academic transcripts", completed: false });
            generatedTasks.push({ id: "task_resume", title: "Prepare academic resume", completed: false });
            generatedTasks.push({ id: "task_application_form", title: "Review and fill university application form", completed: false });
            if (lockedUniversity.ielts_required && user.profile.readiness.ieltsStatus !== 'Completed') {
                generatedTasks.push({ id: "task_ielts", title: "Prepare and complete IELTS exam", completed: false });
            }
            if (lockedUniversity.gre_required && user.profile.readiness.greStatus !== 'Completed') {
                generatedTasks.push({ id: "task_gre", title: "Prepare and complete GRE exam", completed: false });
            }
            if (user.profile.budget.fundingType === "loan-dependent") {
                generatedTasks.push({ id: "task_loan", title: "Initiate education loan process", completed: false });
            }
            if (user.profile.budget.fundingType === "scholarship-dependent") {
                generatedTasks.push({ id: "task_scholarship", title: "Research and apply for scholarships", completed: false });
            }
            if (user.profile.studyGoal.intendedDegree === "masters-mba") {
                generatedTasks.push({ id: "task_experience_docs", title: "Collect work experience documents", completed: false });
            }
            if (user.profile.studyGoal.fieldOfStudy === "MBBS") {
                generatedTasks.push({ id: "task_medical_docs", title: "Prepare medical fitness & eligibility documents", completed: false });
            }

            const applicationStrategy = {
                summary: `This is your personalized action plan for applying to ${lockedUniversity.name}. Follow these steps to build a strong application.`,
                requiredDocuments: documents,
                timeline: timeline
            };

            const batch = writeBatch(firestore);
            const userStateRef = doc(firestore, 'user_state', user.uid);
            batch.set(userStateRef, { actionPlan: applicationStrategy }, { merge: true });

            generatedTasks.forEach(task => {
                const taskRef = doc(firestore, 'users', user.uid, 'tasks', task.id);
                batch.set(taskRef, {
                    id: task.id,
                    userId: user.uid,
                    title: task.title,
                    stage: 4,
                    completed: task.completed,
                    generatedBy: 'AI',
                    createdAt: serverTimestamp(),
                });
            });

            await batch.commit();
        };

        generateTasks();
    }, [user, firestore]);

    const handleUnlock = async () => {
        await unlockUniversities();
        router.push('/dashboard/finalize');
    }

    if (authLoading) {
        return <PreparingSkeleton user={user} />;
    }

    const actionPlan = user?.state?.actionPlan;
    
    if (user && user.lockedUniversities.length > 0 && !actionPlan) {
        return <PreparingSkeleton user={user} />;
    }

    const tasks = applicationTasks || [];
    const completedTasks = tasks.filter(task => task.completed).length;
    const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

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
                
                <div className="flex justify-center items-center gap-4 pt-4 border-t border-dashed">
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
                                <AlertDialogAction onClick={handleUnlock}>Confirm and Unlock</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <Button variant="outline" asChild>
                        <Link href="/dashboard">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Link>
                    </Button>
                </div>
            </div>
        </StageWrapper>
    );
}
