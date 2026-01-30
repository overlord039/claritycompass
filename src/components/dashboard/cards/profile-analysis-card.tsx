'use client';

import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CircularProgress } from '@/components/ui/circular-progress';
import { GraduationCap, Trophy, Wallet, BookOpen } from 'lucide-react';
import type { UserProfile } from '@/lib/types';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

const calculateProfileScore = (profile: UserProfile | null): number => {
    if (!profile) return 0;

    let score = 0;

    // 1. Academics (GPA) - 30 points
    const parseGpa = (gpaString?: string): number | null => {
        if (!gpaString) return null;
        const sanitized = gpaString.replace(/[^0-9./]/g, '');
        const parts = sanitized.split('/');
        const gpaValue = parseFloat(parts[0]);
        if (isNaN(gpaValue)) return null;

        let maxGpa = parts.length > 1 ? parseFloat(parts[1]) : 0;
        
        if (maxGpa === 0) {
            if (gpaValue > 10) return null;
            if (gpaValue <= 4.0) maxGpa = 4.0;
            else if (gpaValue <= 5.0) maxGpa = 5.0;
            else maxGpa = 10.0;
        }

        if (maxGpa === 0) return null;

        return (gpaValue / maxGpa) * 10;
    };
    
    const gpa = parseGpa(profile.academic.gpa);
    if (gpa !== null) {
        if (gpa >= 8.0) score += 30;
        else if (gpa >= 7.0) score += 24;
        else if (gpa >= 6.0) score += 18;
        else if (gpa >= 5.0) score += 10;
        else score += 5;
    }

    // 2. Exams - 25 points
    const { ieltsStatus, greStatus } = profile.readiness;
    if (ieltsStatus === 'Completed' && greStatus === 'Completed') {
        score += 25;
    } else if (ieltsStatus === 'Completed' || greStatus === 'Completed') {
        score += 15;
    } else if (ieltsStatus === 'In progress' || greStatus === 'In progress') {
        score += 8;
    }

    // 3. SOP Readiness - 20 points
    const { sopStatus } = profile.readiness;
    if (sopStatus === 'Ready') {
        score += 20;
    } else if (sopStatus === 'Draft') {
        score += 12;
    }
    
    // 4. Budget + Funding Type - 15 points
    let budgetScore = 0;
    const highCostCountries = ['USA', 'UK', 'Canada', 'Australia', 'Ireland'];
    const targetsHighCost = profile.studyGoal.preferredCountries.some(c => highCostCountries.map(hc => hc.toLowerCase()).includes(c.trim().toLowerCase()));

    if (targetsHighCost) {
        if (profile.budget.budgetRangePerYear === '>40k') budgetScore = 10;
        else if (profile.budget.budgetRangePerYear === '20k-40k') budgetScore = 6;
        else budgetScore = 2; // <20k
    } else { // Only low/medium cost countries
        if (profile.budget.budgetRangePerYear === '>40k' || profile.budget.budgetRangePerYear === '20k-40k') {
            budgetScore = 10;
        } else { // <20k
            budgetScore = 6;
        }
    }

    if (profile.budget.fundingType === 'self-funded') budgetScore += 5;
    else if (profile.budget.fundingType === 'loan-dependent') budgetScore += 3;
    else if (profile.budget.fundingType === 'scholarship-dependent') budgetScore += 1;
    
    score += Math.min(budgetScore, 15);

    // 5. Goal Clarity - 10 points
    const { intendedDegree, fieldOfStudy, targetIntakeYear, preferredCountries } = profile.studyGoal;
    const missingFields = [intendedDegree, fieldOfStudy, targetIntakeYear, preferredCountries.join('')]
        .filter(f => !f || f.length === 0).length;

    if (missingFields === 0) {
        score += 10;
    } else if (missingFields === 1) {
        score += 6;
    } else {
        score += 2;
    }

    return Math.round(score);
};


const getProfileStatus = (score: number) => {
    if (score > 70) return { text: "Strong", variant: "default" as const, colorClass: "text-green-500" };
    if (score > 40) return { text: "Moderate", variant: "secondary" as const, colorClass: "text-amber-500" };
    return { text: "Needs Work", variant: "destructive" as const, colorClass: "text-red-500" };
}


export function ProfileAnalysisCard() {
    const { user } = useAuth();
    
    const profileScore = useMemo(() => calculateProfileScore(user?.profile || null), [user?.profile]);

    const profileStatus = getProfileStatus(profileScore);

    return (
        <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-start justify-between p-4">
                <div>
                    <CardTitle className="text-base font-semibold">Profile Analysis</CardTitle>
                    <CardDescription className="text-xs">
                        Hey {user?.fullName?.split(' ')[0] || 'there'}, here's an AI summary.
                    </CardDescription>
                </div>
                <Badge variant={profileStatus.variant}>
                    {profileStatus.text}
                </Badge>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col md:flex-row items-center gap-4 p-4">
                <div className="relative flex-shrink-0">
                    <CircularProgress value={profileScore} className={cn("h-14 w-14", profileStatus.colorClass)} strokeWidth={6}/>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-sm font-bold text-foreground">{profileScore}</span>
                        <span className="text-xs text-muted-foreground">Strength</span>
                    </div>
                </div>

                <div className="w-full grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-background/50">
                        <div className="p-1.5 bg-accent rounded-md">
                            <GraduationCap className="h-4 w-4 text-accent-foreground" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Target Degree</p>
                            <p className="font-semibold text-foreground text-xs truncate">{user?.profile?.studyGoal.intendedDegree || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-background/50">
                         <div className="p-1.5 bg-accent rounded-md">
                            <Trophy className="h-4 w-4 text-accent-foreground" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">GPA</p>
                            <p className="font-semibold text-foreground text-sm">{user?.profile?.academic.gpa || 'N/A'}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-2 p-2 rounded-lg bg-background/50">
                         <div className="p-1.5 bg-accent rounded-md">
                            <Wallet className="h-4 w-4 text-accent-foreground" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Budget / Year</p>
                            <p className="font-semibold text-foreground text-xs truncate">{user?.profile?.budget.budgetRangePerYear || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-background/50">
                         <div className="p-1.5 bg-accent rounded-md">
                            <BookOpen className="h-4 w-4 text-accent-foreground" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Exams</p>
                            <p className="font-semibold text-foreground text-xs">
                                IELTS: {user?.profile?.readiness.ieltsStatus || 'N/A'}
                                <br/>
                                GRE: {user?.profile?.readiness.greStatus || 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Button variant="outline" size="sm" className="w-full md:w-auto ml-auto text-xs" asChild>
                    <Link href="/onboarding">Edit Profile →</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
