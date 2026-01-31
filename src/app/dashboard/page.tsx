'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LayoutDashboard, University, ClipboardCheck, Book, User, Compass, Lock, FileText, PartyPopper, Check } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

// Import tab content components
import { DashboardHomeTab } from '@/components/dashboard/tabs/dashboard-home-tab';
import { UniversitiesTab } from '@/components/dashboard/tabs/universities-tab';
import { TasksTab } from '@/components/dashboard/tabs/tasks-tab';
import { NotesSessionsTab } from '@/components/dashboard/tabs/notes-sessions-tab';

const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'universities', label: 'Universities', icon: University },
    { id: 'tasks', label: 'To-Do List', icon: ClipboardCheck },
    { id: 'notes', label: 'Notes & Sessions', icon: Book },
];

export default function DashboardPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const searchParams = useSearchParams();

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && navItems.some(item => item.id === tab)) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    useEffect(() => {
        if (user) {
            if (user.currentStage === 2 || user.currentStage === 3) {
                if (activeTab !== 'universities') {
                    // setActiveTab('universities');
                }
            } else if (user.currentStage === 4) {
                 if (activeTab !== 'tasks') {
                    // setActiveTab('tasks');
                 }
            }
        }
    }, [user, activeTab]);

    if (!user) {
        return (
            <div className="bg-card/60 backdrop-blur-xl border-primary/10 shadow-2xl shadow-primary/10 rounded-2xl p-6 space-y-6 h-full flex items-center justify-center">
                <Skeleton className="h-[calc(100vh-10rem)] w-full" />
            </div>
        );
    }
    
    const adjustedStages = [
        { id: 1, name: 'Build Profile', Icon: User },
        { id: 2, name: 'Discover Universities', Icon: Compass },
        { id: 3, name: 'Finalize Choices', Icon: Lock },
        { id: 4, name: 'Prepare Applications', Icon: FileText },
    ];
    
    const isPreparationCompleted = !!user.state?.applicationPreparationCompleted;
    const finalStageCompleted = user.currentStage >= 5 || isPreparationCompleted;

    return (
        <div className="bg-card/60 backdrop-blur-xl border border-border/20 shadow-xl shadow-primary/5 rounded-2xl flex flex-col md:flex-row h-full max-h-[calc(100vh-8rem)]">
            <aside className="w-full md:w-56 flex-shrink-0 p-4 border-b md:border-b-0 md:border-r border-border/30">
                <nav className="flex flex-row md:flex-col gap-2">
                    {navItems.map(item => (
                        <Button
                            key={item.id}
                            variant={activeTab === item.id ? 'secondary' : 'ghost'}
                            className={cn(
                                "justify-start w-full",
                                activeTab === item.id && "shadow-inner bg-black/5 dark:bg-white/5"
                            )}
                            onClick={() => setActiveTab(item.id)}
                        >
                            <item.icon className="mr-2 h-4 w-4" />
                            <span>{item.label}</span>
                        </Button>
                    ))}
                </nav>
            </aside>

            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-6 border-b border-border/30">
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
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'dashboard' && <DashboardHomeTab setActiveTab={setActiveTab} />}
                    {activeTab === 'universities' && <UniversitiesTab setActiveTab={setActiveTab} />}
                    {activeTab === 'tasks' && <TasksTab setActiveTab={setActiveTab} />}
                    {activeTab === 'notes' && <NotesSessionsTab />}
                </div>
            </div>
        </div>
    );
}
