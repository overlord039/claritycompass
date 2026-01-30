'use client';
import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAIPersonalizedGuidance } from '@/lib/actions';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { PartyPopper, Lightbulb, ListChecks } from 'lucide-react';

export function NextMissionCard() {
    const { user } = useAuth();
    const [guidance, setGuidance] = useState<{ guidance: string; actions: string[] } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGuidance = async () => {
            if (!user || !user.profile) return;
            setLoading(true);
            const result = await getAIPersonalizedGuidance({
                profileData: JSON.stringify(user.profile),
                currentStage: user.currentStage.toString(),
                shortlistedUniversities: user.shortlistedUniversities || [],
                lockedUniversities: user.lockedUniversities || [],
            });
            setGuidance(result);
            setLoading(false);
        };
        fetchGuidance();
    }, [user]);

    const stageDetails: { [key: number]: { name: string; text: string; href: string; } } = {
        1: { name: "Build Profile", text: "Complete Your Profile", href: "/onboarding"},
        2: { name: "Discover Universities", text: "Discover Universities", href: "/dashboard/discover" },
        3: { name: "Finalize Choices", text: "Finalize Choices", href: "/dashboard/finalize" },
        4: { name: "Prepare Applications", text: "View Your Action Plan", href: "/dashboard/tasks" },
    };
    
    const mission = user ? stageDetails[user.currentStage] : null;

    if (loading || !user) {
        return (
            <Card className="bg-primary/10 backdrop-blur-xl border border-primary/20 shadow-lg shadow-primary/10">
                <CardHeader className="p-4">
                    <CardTitle className="flex items-center gap-2 font-headline text-base">
                        <Lightbulb className="h-4 w-4 text-primary drop-shadow-[0_0_8px_hsl(var(--primary))]" />
                        AI Counsellor
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 p-4 pt-0">
                   <Skeleton className="h-3 w-full bg-primary/20" />
                   <Skeleton className="h-3 w-3/4 bg-primary/20" />
                   <div className="pt-2">
                    <h3 className="font-semibold mb-1 flex items-center gap-2 text-xs"><ListChecks size={14} /> Next Actions:</h3>
                    <ul className="space-y-1.5">
                        <li><Skeleton className="h-3 w-1/2 bg-primary/20" /></li>
                        <li><Skeleton className="h-3 w-2/3 bg-primary/20" /></li>
                    </ul>
                   </div>
                   <Skeleton className="h-9 w-full mt-2" />
                </CardContent>
            </Card>
        );
    }
    
    if (user.currentStage >= 5) {
        return (
            <Card className="bg-primary/10 backdrop-blur-xl border border-primary/20 shadow-lg shadow-primary/10">
                <CardHeader className="p-4">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <PartyPopper className="h-5 w-5 text-primary" />
                        Application Ready
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-center gap-3 p-4 pt-0">
                    <p className="text-muted-foreground text-xs">
                        {guidance?.guidance || "You’ve completed all preparation tasks. You’re now ready to submit applications confidently."}
                    </p>
                    {guidance?.actions && guidance.actions.length > 0 && (
                        <div className="pt-2 text-left w-full">
                            <h3 className="font-semibold mb-1 flex items-center gap-2 text-xs"><ListChecks size={14} /> Next Actions:</h3>
                            <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                                {guidance.actions.map((action, index) => (
                                    <li key={index}>{action}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <Button size="sm" className="w-full mt-2" asChild>
                        <Link href="/dashboard/tasks">Review Application Strategy</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-primary/10 backdrop-blur-xl border border-primary/20 shadow-lg shadow-primary/10">
            <CardHeader className="p-4">
                <CardTitle className="flex items-center gap-2 font-headline text-base">
                    <Lightbulb className="h-4 w-4 text-primary drop-shadow-[0_0_8px_hsl(var(--primary))]" />
                    AI Counsellor
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-center gap-3 p-4 pt-0">
                <p className="text-muted-foreground text-xs">
                    {guidance?.guidance || "Loading your next step..."}
                </p>
                {guidance?.actions && guidance.actions.length > 0 && (
                  <div className="pt-1">
                    <h3 className="font-semibold mb-1 flex items-center gap-2 text-xs"><ListChecks size={14} /> Next Actions:</h3>
                    <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                      {guidance.actions.map((action, index) => (
                        <li key={index}>{action}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {mission ? (
                     <Button size="sm" className="w-full mt-2" asChild>
                        <Link href={mission.href}>{mission.text}</Link>
                     </Button>
                ) : null}
            </CardContent>
        </Card>
    );
}
