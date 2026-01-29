'use client';
import { useEffect, useMemo } from 'react';
import { useAuth } from "@/providers/auth-provider";
import { assessProfile } from "@/lib/actions";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, ShieldCheck, BookOpen, FileText, Activity } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { cn } from '@/lib/utils';
import type { UserProfile } from '@/lib/types';
import type { AssessProfileInput } from '@/ai/flows/ai-profile-assessment';
import { CircularProgress } from '@/components/ui/circular-progress';

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


const transformProfileForAI = (profile: UserProfile): AssessProfileInput => {
    return {
        educationLevel: profile.academic.educationLevel,
        degree: profile.academic.degree,
        graduationYear: profile.academic.graduationYear,
        gpa: profile.academic.gpa,
        intendedDegree: profile.studyGoal.intendedDegree,
        fieldOfStudy: profile.studyGoal.fieldOfStudy,
        targetIntakeYear: profile.studyGoal.targetIntakeYear,
        preferredCountries: profile.studyGoal.preferredCountries.join(', '),
        budgetRangePerYear: profile.budget.budgetRangePerYear,
        fundingType: profile.budget.fundingType,
        ieltsStatus: profile.readiness.ieltsStatus,
        greStatus: profile.readiness.greStatus,
        sopStatus: profile.readiness.sopStatus,
    };
};

export function ProfileStrength() {
    const { user, profileStrength, updateProfileStrength } = useAuth();
    
    const profileScore = useMemo(() => calculateProfileScore(user?.profile || null), [user?.profile]);
    const profileStatus = getProfileStatus(profileScore);

    useEffect(() => {
        const runAssessment = async () => {
            if (user?.profile && !profileStrength) {
                const result = await assessProfile(transformProfileForAI(user.profile));
                if (result) {
                    updateProfileStrength(result);
                }
            }
        };
        runAssessment();
    }, [user, profileStrength, updateProfileStrength]);

    const strengthItems = [
        { icon: ShieldCheck, label: 'Academics', value: profileStrength?.academics },
        { icon: BookOpen, label: 'Exams', value: profileStrength?.exams },
        { icon: FileText, label: 'SOP', value: profileStrength?.sop },
    ];

    const getStrengthColor = (value: string | null | undefined) => {
        switch (value) {
            case 'Strong':
            case 'Completed':
            case 'Ready':
                return 'text-green-600 bg-green-500/10 border-green-500/20';
            case 'Average':
            case 'In progress':
            case 'Draft':
                return 'text-amber-600 bg-amber-500/10 border-amber-500/20';
            case 'Weak':
            case 'Not started':
                return 'text-red-600 bg-red-500/10 border-red-500/20';
            default:
                return 'text-muted-foreground bg-muted';
        }
    };

    const renderContent = () => {
        if (!profileStrength || !user?.profile) {
            return <Skeleton className="h-36 w-full" />;
        }

        return (
             <div className="space-y-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="relative flex-shrink-0">
                        <CircularProgress value={profileScore} className={cn("h-32 w-32", profileStatus.colorClass)} strokeWidth={8}/>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold text-foreground">{profileScore}</span>
                            <span className="text-sm text-muted-foreground">Strength</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-grow">
                        {strengthItems.map(item => (
                            <div key={item.label} className="p-4 rounded-lg bg-background/30 border flex flex-col items-center text-center justify-center h-full">
                                <item.icon className="w-7 h-7 text-primary mb-2" />
                                <p className="font-semibold text-foreground mb-1">{item.label}</p>
                                <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium border', getStrengthColor(item.value))}>
                                    {item.value || 'N/A'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {user.state?.recommendations && (
                    <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2"><Activity size={18}/> Recommendations</h4>
                        <p className="text-muted-foreground text-sm whitespace-pre-line">{user.state.recommendations}</p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <AccordionItem value="strength" className="border-none">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline font-headline p-4 bg-card/70 backdrop-blur-lg rounded-lg shadow-lg shadow-primary/5 data-[state=open]:rounded-b-none transition-all hover:bg-accent/70">
                 <div className="flex items-center gap-3">
                    <Zap className="text-primary/80"/>
                    AI Profile Strength
                </div>
            </AccordionTrigger>
            <AccordionContent className="p-0">
                <Card className="rounded-t-none backdrop-blur-lg bg-card/50 border-t-0">
                    <CardContent className="p-6">
                        {renderContent()}
                    </CardContent>
                </Card>
            </AccordionContent>
        </AccordionItem>
    );
}
