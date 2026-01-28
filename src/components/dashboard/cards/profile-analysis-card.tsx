'use client';

import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CircularProgress } from '@/components/ui/circular-progress';
import { GraduationCap, Trophy, Wallet, BookOpen } from 'lucide-react';
import type { ProfileStrength } from '@/lib/types';
import { useMemo } from 'react';

const calculateProfileScore = (strength: ProfileStrength | null): number => {
    if (!strength) return 0;
    let score = 0;
    const maxScore = 9; // 3 points for each category

    const academicMap = { 'Strong': 3, 'Average': 2, 'Weak': 1, 'null': 0 };
    const examMap = { 'Completed': 3, 'In progress': 2, 'Not started': 1, 'null': 0 };
    const sopMap = { 'Ready': 3, 'Draft': 2, 'Not started': 1, 'null': 0 };

    score += academicMap[strength.academics || 'null'] ?? 0;
    score += examMap[strength.exams || 'null'] ?? 0;
    score += sopMap[strength.sop || 'null'] ?? 0;

    return Math.round((score / maxScore) * 100);
};


export function ProfileAnalysisCard() {
    const { user } = useAuth();
    
    const profileScore = useMemo(() => calculateProfileScore(user?.state?.profileStrength || null), [user?.state?.profileStrength]);

    const getProfileStatus = (score: number) => {
        if (score > 75) return { text: "Strong", variant: "default" as const };
        if (score > 40) return { text: "Average", variant: "secondary" as const };
        return { text: "Needs Work", variant: "destructive" as const };
    }

    const profileStatus = getProfileStatus(profileScore);

    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle className="text-xl font-semibold">Profile Analysis</CardTitle>
                    <CardDescription>
                        Hey {user?.fullName?.split(' ')[0] || 'there'}, here's an AI-powered summary of your profile.
                    </CardDescription>
                </div>
                <Badge variant={profileStatus.variant}>
                    {profileStatus.text}
                </Badge>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col md:flex-row items-center gap-6 p-6">
                <div className="relative flex-shrink-0">
                    <CircularProgress value={profileScore} className="h-32 w-32" strokeWidth={8}/>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-foreground">{profileScore}</span>
                        <span className="text-sm text-muted-foreground">Strength</span>
                    </div>
                </div>

                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-background/50">
                        <div className="p-3 bg-accent rounded-md">
                            <GraduationCap className="h-6 w-6 text-accent-foreground" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Target Degree</p>
                            <p className="font-semibold text-foreground truncate">{user?.profile?.studyGoal.intendedDegree || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-background/50">
                         <div className="p-3 bg-accent rounded-md">
                            <Trophy className="h-6 w-6 text-accent-foreground" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">GPA</p>
                            <p className="font-semibold text-foreground">{user?.profile?.academic.gpa || 'N/A'}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-4 p-4 rounded-lg bg-background/50">
                         <div className="p-3 bg-accent rounded-md">
                            <Wallet className="h-6 w-6 text-accent-foreground" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Budget / Year</p>
                            <p className="font-semibold text-foreground truncate">{user?.profile?.budget.budgetRangePerYear || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-background/50">
                         <div className="p-3 bg-accent rounded-md">
                            <BookOpen className="h-6 w-6 text-accent-foreground" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Exams</p>
                            <p className="font-semibold text-foreground text-xs">
                                IELTS: {user?.profile?.readiness.ieltsStatus || 'N/A'}
                                <br/>
                                GRE: {user?.profile?.readiness.greStatus || 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button variant="outline" className="w-full md:w-auto ml-auto" asChild>
                    <Link href="/onboarding">Edit Profile & Readiness →</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
