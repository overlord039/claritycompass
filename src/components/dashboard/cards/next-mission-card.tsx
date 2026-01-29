'use client';
import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAIPersonalizedGuidance } from '@/lib/actions';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

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

    const stageActions: { [key: number]: { text: string; href: string; } } = {
        2: { text: "Discover Universities", href: "/dashboard/discover" },
        3: { text: "Finalize Choices", href: "/dashboard/finalize" },
        4: { text: "Prepare Applications", href: "/dashboard/tasks" },
    };

    const mission = user ? stageActions[user.currentStage] : null;

    if (loading || !user) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center text-center gap-4 flex-grow">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                     <Skeleton className="h-12 w-full mt-4" />
                </CardContent>
            </Card>
        );
    }
    
    return (
        <Card className="flex flex-col items-center justify-center text-center h-full">
            <CardHeader>
                <CardTitle className="text-xl font-semibold">✨ Next Mission</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col items-center justify-center gap-4">
                <p className="text-muted-foreground px-4">
                    {guidance?.guidance || "Loading your next step..."}
                </p>
                {mission ? (
                     <Button size="lg" className="w-full mt-4" asChild>
                        <Link href={mission.href}>{mission.text}</Link>
                     </Button>
                ) : user.currentStage === 1 ? (
                     <Button size="lg" className="w-full mt-4" asChild>
                        <Link href="/onboarding">Complete Your Profile</Link>
                     </Button>
                ): null}
            </CardContent>
        </Card>
    );
}
