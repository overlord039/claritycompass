'use client';

import { useEffect, useMemo } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { StageWrapper } from './stage-wrapper';
import { Button } from '@/components/ui/button';
import { ClipboardCheck, RotateCcw, CalendarDays, FileText, ListChecks, Lightbulb, Lock, Check, Info, CheckCircle2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useFirestore } from '@/firebase';
import { doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { universities as allUniversities } from '@/lib/data';
import type { AppUser } from '@/lib/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';


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


const CompletionView = () => {
    const { markPreparationComplete, unlockUniversities, user } = useAuth();
    const router = useRouter();

    const handleUnlock = async () => {
        await unlockUniversities();
        router.push('/dashboard/finalize');
    };

    const isMarkedComplete = user?.state?.applicationPreparationCompleted;

    return (
        <StageWrapper icon={CheckCircle2} title="You're Ready to Apply" description="You’ve completed all preparation tasks for your locked universities. Your profile is now application-ready.">
            <div className="space-y-8 text-center">
                <div className="p-6 bg-green-500/10 rounded-lg border border-green-500/20">
                    <h3 className="font-semibold text-lg text-green-700 dark:text-green-300">All Preparation Tasks Completed</h3>
                    <Progress value={100} className="mt-2 h-2" />
                </div>

                <div className="text-left bg-background/50 p-6 rounded-lg border">
                    <h4 className="font-semibold mb-3 flex items-center gap-2"><Info className="h-5 w-5 text-primary" /> What this means</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                        <li>Your required documents list is prepared.</li>
                        <li>Your exam requirements are understood and tracked.</li>
                        <li>Your application strategy is complete.</li>
                        <li>You can now confidently proceed with the actual applications on the official university portals.</li>
                    </ul>
                </div>

                <div className="pt-6 border-t border-dashed">
                     <h4 className="font-semibold mb-4 text-lg">Your Next Move</h4>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-lg border bg-background/50 flex flex-col items-center">
                             <h5 className="font-semibold mb-2">Finalize Preparation</h5>
                             <p className="text-xs text-muted-foreground mb-4">Mark this stage as complete to lock your progress and move to a post-application monitoring view.</p>
                             <Button onClick={markPreparationComplete} disabled={isMarkedComplete} className="w-full mt-auto">
                                {isMarkedComplete ? <><Check className="mr-2"/>Completed</> : "Mark Preparation Complete"}
                            </Button>
                        </div>
                        <div className="p-4 rounded-lg border bg-background/50 flex flex-col items-center">
                             <h5 className="font-semibold mb-2">Re-strategize</h5>
                             <p className="text-xs text-muted-foreground mb-4">Unlock your choices to add or change universities. This will reset your current action plan.</p>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline" className="w-full mt-auto">Add/Change University</Button>
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
                        </div>
                        <div className="p-4 rounded-lg border bg-background/50 flex flex-col items-center">
                            <h5 className="font-semibold mb-2">Review Dashboard</h5>
                            <p className="text-xs text-muted-foreground mb-4">Return to your main dashboard to review your profile summary, notes, and overall journey.</p>
                            <Button variant="outline" asChild className="w-full mt-auto">
                                <Link href="/dashboard">Back to Dashboard</Link>
                            </Button>
                        </div>
                     </div>
                </div>
            </div>
        </StageWrapper>
    );
};


export default function Stage4Applications() {
    const { user, loading: authLoading, unlockUniversities, updateTaskStatus, applicationTasks } = useAuth();
    const firestore = useFirestore();

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
            const userStateRef = doc(firestore, 'user_state', user.id);
            batch.set(userStateRef, { actionPlan: applicationStrategy }, { merge: true });
            
            generatedTasks.forEach(task => {
                const taskRef = doc(firestore, 'users', user.id, 'tasks', task.id);
                batch.set(taskRef, {
                    id: task.id,
                    userId: user.id,
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
    const allTasksCompleted = useMemo(() => tasks.length > 0 && tasks.every(task => task.completed), [tasks]);
    const preparationCompleted = user?.state?.applicationPreparationCompleted;

    if (preparationCompleted || allTasksCompleted) {
        return <CompletionView />;
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
