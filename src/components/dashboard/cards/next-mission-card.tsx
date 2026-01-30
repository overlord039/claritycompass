'use client';
import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAIPersonalizedGuidance } from '@/lib/actions';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { PartyPopper } from 'lucide-react';

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
            <Card>
                <CardHeader className="p-4">
                    <Skeleton className="h-5 w-3/4" />
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center text-center gap-3 p-4 flex-grow">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                     <Skeleton className="h-9 w-full mt-2" />
                </CardContent>
            </Card>
        );
    }
    
    if (user.currentStage >= 5) {
        return (
            <Card className="flex flex-col items-center justify-center text-center">
                <CardHeader className="p-4">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <PartyPopper className="h-5 w-5 text-primary" />
                        Application Ready
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col items-center justify-center gap-2 p-4 pt-0">
                    <p className="text-muted-foreground text-xs px-2">
                        You’ve completed all preparation tasks. You’re now ready to submit applications confidently.
                    </p>
                    <Button size="sm" className="w-full mt-2" asChild>
                        <Link href="/dashboard/tasks">Review Application Strategy</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="flex flex-col items-center justify-center text-center">
            <CardHeader className="p-4">
                <CardTitle className="text-base font-semibold">
                    {mission ? `Stage ${user.currentStage}: ${mission.name}` : '✨ Next Mission'}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col items-center justify-center gap-2 p-4">
                <p className="text-muted-foreground text-xs px-2">
                    {guidance?.guidance || "Loading your next step..."}
                </p>
                {mission ? (
                     <Button size="sm" className="w-full mt-2" asChild>
                        <Link href={mission.href}>{mission.text}</Link>
                     </Button>
                ) : null}
            </CardContent>
        </Card>
    );
}
