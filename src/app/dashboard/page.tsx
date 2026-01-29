'use client';

import { useAuth } from '@/providers/auth-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { ProfileAnalysisCard } from '@/components/dashboard/cards/profile-analysis-card';
import { ShortlistedUniversitiesCard } from '@/components/dashboard/cards/shortlisted-universities-card';
import { NextMissionCard } from '@/components/dashboard/cards/next-mission-card';
import { AiGuidance } from '@/components/dashboard/ai-guidance';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Calendar, Book, Plus } from 'lucide-react';


export default function DashboardHomePage() {
    const { loading, user } = useAuth();

    if (loading || !user) {
        return (
             <div className="grid grid-cols-4 grid-rows-2 gap-6 h-full">
                <Skeleton className="col-span-2 row-span-1" />
                <Skeleton className="col-span-1 row-span-1" />
                <div className="col-span-1 row-span-1">
                    <Skeleton className="h-full" />
                </div>
                <Skeleton className="col-span-3 row-span-1" />
                <Skeleton className="col-span-1 row-span-1" />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-4 grid-rows-2 gap-6 h-full">
            <div className="col-span-2 row-span-1">
                <ProfileAnalysisCard />
            </div>
            <div className="col-span-1 row-span-1">
                <NextMissionCard />
            </div>
            <div className="col-span-1 row-span-1">
                <Card className="h-full flex flex-col">
                    {/* Sessions Part */}
                    <div className="p-4">
                        <div className="flex flex-row items-center justify-between mb-2">
                            <h3 className="flex items-center gap-2 text-base font-semibold">
                                <Calendar className="h-4 w-4" />
                                Sessions
                            </h3>
                            <Button variant="link" size="sm" className="p-0 h-auto text-xs">Schedule</Button>
                        </div>
                        <div className="text-center text-xs text-muted-foreground p-3 rounded-lg bg-background/50">
                            No upcoming sessions.
                        </div>
                    </div>

                    <Separator />

                    {/* Journal Part */}
                    <div className="p-4 flex-grow flex flex-col">
                        <h3 className="flex items-center gap-2 text-base font-semibold mb-2">
                            <Book className="h-4 w-4" />
                            Journal & Notes
                        </h3>
                        <div className="relative flex-grow rounded-lg bg-background/50 p-3">
                            <Textarea placeholder="What's on your mind?" className="h-full bg-transparent border-0 pr-8 resize-none text-xs focus-visible:ring-0 focus-visible:ring-offset-0" rows={1}/>
                            <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6">
                                <Plus className="h-4 w-4"/>
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
            <div className="col-span-3 row-span-1">
                <ShortlistedUniversitiesCard />
            </div>
            <div className="col-span-1 row-span-1">
                <AiGuidance />
            </div>
        </div>
    );
}
