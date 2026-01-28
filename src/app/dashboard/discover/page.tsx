
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/providers/auth-provider';
import type { University, UserProfile } from '@/lib/types';
import { universities as allUniversities } from '@/lib/data';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Search, ThumbsUp } from 'lucide-react';

type CategorizedUniversities = {
  dream: University[];
  target: University[];
  safe: University[];
};

const scoreFromProfile = (profile: UserProfile): number => {
    let score = 0;
    const maxScore = 10; // 4 for GPA, 2 for IELTS, 2 for GRE, 2 for SOP
    
    // GPA score (max 4)
    if (profile.academic.gpa) {
        const gpaVal = parseFloat(profile.academic.gpa.split('/')[0]);
        if (!isNaN(gpaVal)) {
            if (gpaVal >= 3.7) score += 4;
            else if (gpaVal >= 3.3) score += 3;
            else if (gpaVal >= 3.0) score += 2;
            else if (gpaVal >= 2.5) score += 1;
        }
    } else {
        // If no GPA, give an average score
        score += 2;
    }

    const readinessMap: { [key: string]: number } = { 'Completed': 2, 'In progress': 1, 'Not started': 0, 'Ready': 2, 'Draft': 1 };

    // Exam readiness (max 4)
    score += readinessMap[profile.readiness.ieltsStatus] || 0;
    score += readinessMap[profile.readiness.greStatus] || 0;

    // SOP readiness (max 2)
    score += readinessMap[profile.readiness.sopStatus] || 0;

    return Math.round((score / maxScore) * 100);
}


function UniversityCard({ university, onShortlist, isShortlisted }: { university: University; onShortlist: () => void; isShortlisted: boolean }) {
    return (
        <Card className="overflow-hidden flex flex-col h-full bg-background/50 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1 transition-all duration-300 group">
             <div className="relative w-full h-40">
                <Image
                    src={university.imageUrl}
                    alt={`Campus of ${university.name}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint={university.imageHint}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
            <CardHeader>
                <CardTitle className="text-lg">{university.name}</CardTitle>
                <div className="flex flex-wrap gap-2 pt-2">
                    <Badge variant="secondary">{university.country}</Badge>
                    <Badge variant="secondary">Cost: {university.costLevel}</Badge>
                    <Badge variant="secondary">Chance: {university.acceptanceChance}</Badge>
                </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-2">
                 <p className="text-sm text-muted-foreground"><strong className="text-foreground">Fit:</strong> {university.fit}</p>
                 <p className="text-sm text-muted-foreground"><strong className="text-foreground">Risks:</strong> {university.risks}</p>
            </CardContent>
            <CardFooter>
                 <Button onClick={onShortlist} disabled={isShortlisted} className="w-full">
                    {isShortlisted ? 'Shortlisted' : 'Shortlist this University'}
                    {isShortlisted && <ThumbsUp className="ml-2 h-4 w-4" />}
                </Button>
            </CardFooter>
        </Card>
    );
}

export default function DiscoverPage() {
    const { user, shortlistUniversity, shortlistedUniversities } = useAuth();
    const [categorized, setCategorized] = useState<CategorizedUniversities | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const categorizeUniversities = () => {
            if (!user?.profile) {
                // We need the profile to categorize. If it's not here, wait.
                setLoading(true);
                return;
            };
            setLoading(true);
            
            const userScore = scoreFromProfile(user.profile);
            
            const uniDifficultyScore = {
                'High': 90,
                'Medium': 65,
                'Low': 40,
            };

            const dream: University[] = [];
            const target: University[] = [];
            const safe: University[] = [];

            // Pre-filter by country preference.
            const preferredCountries = user.profile.studyGoal.preferredCountries.map(c => c.toLowerCase());
            const relevantUniversities = allUniversities.filter(uni => 
                preferredCountries.length === 0 || preferredCountries.includes(uni.country.toLowerCase())
            );

            relevantUniversities.forEach(uni => {
                const score = uniDifficultyScore[uni.acceptanceChance];
                const diff = userScore - score;

                if (diff < -20) { // User score is significantly lower than uni requirement
                    dream.push(uni);
                } else if (Math.abs(diff) <= 20) { // User score is in the same ballpark
                    target.push(uni);
                } else { // User score is significantly higher
                    safe.push(uni);
                }
            });

            setCategorized({ dream, target, safe });
            setLoading(false);
        };

        categorizeUniversities();
    }, [user?.profile]);

    const renderSkeletons = () => (
        <div className="space-y-8">
            {['Dream', 'Target', 'Safe'].map(category => (
                <div key={category}>
                    <h3 className="text-2xl font-bold mb-6 capitalize font-headline">{category} Universities</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-96 rounded-lg" />)}
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="container mx-auto py-8">
            <Card className="w-full max-w-7xl mx-auto shadow-lg bg-card/80 backdrop-blur-sm">
                <CardHeader className="flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-headline flex items-center gap-2">
                            <Search className="h-6 w-6 text-primary"/>
                            University Discovery
                        </CardTitle>
                        <CardDescription>
                            Here are universities categorized by our AI based on your profile. Shortlist your favorites.
                        </CardDescription>
                    </div>
                    <Button asChild variant="outline">
                        <Link href="/dashboard">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent className="p-6">
                    {loading || !categorized ? (
                        renderSkeletons()
                    ) : (
                        <div className="space-y-12">
                            {Object.entries(categorized).map(([category, unis]) => (
                                unis.length > 0 && (
                                <div key={category}>
                                    <h3 className="text-2xl font-bold mb-6 capitalize font-headline">{category} Universities</h3>
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {unis.map(uni => (
                                        <UniversityCard 
                                            key={uni.id} 
                                            university={uni} 
                                            onShortlist={() => shortlistUniversity(uni.name)}
                                            isShortlisted={shortlistedUniversities.includes(uni.name)}
                                        />
                                        ))}
                                    </div>
                                </div>
                                )
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
