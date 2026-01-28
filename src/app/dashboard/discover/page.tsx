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

// More robust GPA parser to handle various formats and normalize to a 0-100 scale
const parseGpa = (gpaString?: string): number | null => {
    if (!gpaString) return null;
    const sanitized = gpaString.replace(/[^0-9./]/g, '');
    const parts = sanitized.split('/');
    const gpa = parseFloat(parts[0]);
    if (isNaN(gpa)) return null;

    let maxGpa = parts.length > 1 ? parseFloat(parts[1]) : 0;
    
    // Infer max scale if not provided (e.g., "3.8" or "8.5")
    if (maxGpa === 0) {
        if (gpa > 10) return null; // Invalid GPA
        if (gpa <= 4.0) maxGpa = 4.0;
        else if (gpa <= 5.0) maxGpa = 5.0; // Some systems use 5.0
        else maxGpa = 10.0;
    }

    if (maxGpa === 0) return null;

    return (gpa / maxGpa) * 100;
};


// Improved scoring logic based on weighted profile attributes
const scoreFromProfile = (profile: UserProfile): number => {
    // Weights for each category, summing to 1.0
    const weights = { gpa: 0.4, ielts: 0.2, gre: 0.2, sop: 0.2 };
    
    let totalWeightedScore = 0;

    // 1. GPA Score (40%)
    const gpaScore = parseGpa(profile.academic.gpa); // This is 0-100
    // Use the normalized 0-100 score, or assume 60/100 if not provided
    totalWeightedScore += (gpaScore ?? 60) * weights.gpa;
    
    const readinessMap: { [key: string]: number } = { // 0-100 scale
        'Completed': 100, 'Ready': 100, 
        'In progress': 50, 'Draft': 50, 
        'Not started': 10 // Give some points for having it on the radar
    };

    // 2. IELTS Score (20%)
    totalWeightedScore += (readinessMap[profile.readiness.ieltsStatus] ?? 10) * weights.ielts;
    
    // 3. GRE Score (20%)
    totalWeightedScore += (readinessMap[profile.readiness.greStatus] ?? 10) * weights.gre;

    // 4. SOP Score (20%)
    totalWeightedScore += (readinessMap[profile.readiness.sopStatus] ?? 10) * weights.sop;

    return Math.round(totalWeightedScore); // Already on a 0-100 scale
};


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
                setLoading(true);
                return;
            };
            setLoading(true);
            
            const userScore = scoreFromProfile(user.profile);
            
            // Defines the baseline score for each university difficulty tier
            const uniDifficultyScore = {
                'High': 85,
                'Medium': 65,
                'Low': 45,
            };

            const dream: University[] = [];
            const target: University[] = [];
            const safe: University[] = [];

            // --- Pre-filter to get the most relevant universities first ---
            const preferredCountries = user.profile.studyGoal.preferredCountries.map(c => c.trim().toLowerCase()).filter(c => c);
            const fieldOfStudy = user.profile.studyGoal.fieldOfStudy.toLowerCase();

            const fieldSynonyms: {[key: string]: string[]} = {
                'computer science': ['cs'],
                'information technology': ['it'],
                'artificial intelligence': ['ai'],
            };
            const userSearchTerms = [fieldOfStudy, ...(fieldSynonyms[fieldOfStudy] || [])];

            const relevantUniversities = allUniversities.filter(uni => {
                // 1. Country filter: must match one of the preferred countries (if any)
                const countryMatch = preferredCountries.length === 0 || preferredCountries.some(c => uni.country.toLowerCase().includes(c));
                if (!countryMatch) return false;

                // 2. Field of study filter: must have a matching field
                const fieldMatch = uni.fields.some(uniField => {
                    const uniFieldLower = uniField.toLowerCase();
                    // Match if user term is in uni field OR uni field is in user term (e.g., "cs" in "computer science")
                    return userSearchTerms.some(term => uniFieldLower.includes(term) || term.includes(uniFieldLower));
                });
                if (!fieldMatch) return false;
                
                // 3. Budget filter: university cost must be within or below user's budget level
                const budgetMap = { "<20k": "Low", "20k-40k": "Medium", ">40k": "High" };
                const userBudgetLevel = budgetMap[user.profile.budget.budgetRangePerYear];
                if (userBudgetLevel === "Low" && (uni.costLevel === "Medium" || uni.costLevel === "High")) return false;
                if (userBudgetLevel === "Medium" && uni.costLevel === "High") return false;

                return true;
            });
            // --- End of Filtering ---

            relevantUniversities.forEach(uni => {
                const score = uniDifficultyScore[uni.acceptanceChance];
                const diff = userScore - score;

                // User score is significantly lower than uni requirement -> Dream
                if (diff < -15) { 
                    dream.push(uni);
                } 
                // User score is in the same ballpark -> Target
                else if (Math.abs(diff) <= 15) { 
                    target.push(uni);
                } 
                // User score is significantly higher -> Safe
                else { 
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
                            Here are universities categorized based on your profile. Shortlist your favorites.
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
                             {categorized.dream.length === 0 && categorized.target.length === 0 && categorized.safe.length === 0 && (
                                <div className="text-center py-10">
                                    <p className="text-muted-foreground mb-4">No universities matched your specific criteria. Try broadening your search in your profile!</p>
                                    <Button asChild variant="default">
                                        <Link href="/onboarding">Edit Profile</Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
