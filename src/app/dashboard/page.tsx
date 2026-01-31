'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LayoutDashboard, University, ClipboardCheck, Book } from 'lucide-react';
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
