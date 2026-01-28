'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/providers/auth-provider';
import type { University as UniversityFromData } from '@/lib/types';
import { universities as allUniversities } from '@/lib/data';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Search, ThumbsUp } from 'lucide-react';


type DiscoveredUniversity = {
  id: string;
  name: string;
  country: string;
  city: string;
  estimatedAnnualCost: number;
  category: "Dream" | "Target" | "Safe";
  acceptanceLikelihood: "High" | "Medium" | "Low";
  whyItFits: string;
  risks: string[];
  imageUrl: string;
  imageHint: string;
};


type CategorizedUniversities = {
  dream: DiscoveredUniversity[];
  target: DiscoveredUniversity[];
  safe: DiscoveredUniversity[];
};


function UniversityCard({ university, onShortlist, isShortlisted }: { university: DiscoveredUniversity; onShortlist: () => void; isShortlisted: boolean }) {
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
                 <p className="text-sm text-muted-foreground">{university.city}, {university.country}</p>
                <div className="flex flex-wrap gap-2 pt-2">
                    <Badge variant="secondary">Cost: ${university.estimatedAnnualCost.toLocaleString()}/year</Badge>
                    <Badge variant="secondary">Chance: {university.acceptanceLikelihood}</Badge>
                </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-2">
                 <p className="text-sm text-muted-foreground"><strong className="text-foreground">Why it fits:</strong> {university.whyItFits}</p>
                 {university.risks.length > 0 && <p className="text-sm text-muted-foreground"><strong className="text-foreground">Risks:</strong> {university.risks.join(', ')}</p>}
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
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        const runDiscoveryEngine = () => {
            if (!user?.profile) {
                setLoading(true);
                return;
            };
            setLoading(true);

            const { profile } = user;

            const parseGpaTo10 = (gpaString?: string): number | null => {
                if (!gpaString) return null;
                const sanitized = gpaString.replace(/[^0-9./]/g, '');
                const parts = sanitized.split('/');
                const gpa = parseFloat(parts[0]);
                if (isNaN(gpa)) return null;

                let maxGpa = parts.length > 1 ? parseFloat(parts[1]) : 0;
                 if (maxGpa === 0) {
                    if (gpa > 10) return null;
                    if (gpa <= 4.0) maxGpa = 4.0;
                    else if (gpa <= 5.0) maxGpa = 5.0;
                    else maxGpa = 10.0;
                }
                if (maxGpa === 0) return null;
                return (gpa / maxGpa) * 10;
            };
            const userGpa = parseGpaTo10(profile.academic.gpa);

            let budgetMax = 0;
            if (profile.budget.budgetRangePerYear === "<20k") budgetMax = 20000;
            else if (profile.budget.budgetRangePerYear === "20k-40k") budgetMax = 40000;
            else if (profile.budget.budgetRangePerYear === ">40k") budgetMax = 150000; 

            const userProfileForEngine = {
                gpa: userGpa,
                budgetMax: budgetMax,
                fundingType: profile.budget.fundingType,
                preferredCountries: profile.studyGoal.preferredCountries.map(c => c.trim().toLowerCase()),
                targetField: profile.studyGoal.fieldOfStudy.trim().toLowerCase(),
                exams: {
                    ieltsCompleted: profile.readiness.ieltsStatus === 'Completed',
                    greCompleted: profile.readiness.greStatus === 'Completed',
                }
            };
            
            const fieldEquivalents: { [key: string]: string[] } = {
                'CS': ['cs', 'it', 'data science', 'ai', 'computer science', 'information technology', 'artificial intelligence', 'applied it'],
                'Business': ['business', 'management', 'analytics', 'business analytics'],
                'Engineering': ['engineering'],
                'MBBS': ['mbbs'],
            };
            
            const getUserFieldGroup = (field: string) => {
                const lowerField = field.toLowerCase();
                for (const group in fieldEquivalents) {
                    if (fieldEquivalents[group].some(term => lowerField.includes(term) || term.includes(lowerField))) {
                        return group;
                    }
                }
                return lowerField;
            };
            const userFieldGroup = getUserFieldGroup(userProfileForEngine.targetField);

            const discovered: DiscoveredUniversity[] = [];

            allUniversities.forEach(uni => {
                if (userProfileForEngine.preferredCountries.length > 0 && !userProfileForEngine.preferredCountries.includes(uni.country.toLowerCase())) {
                    return;
                }

                let whyItFits = '';
                const risks: string[] = [];

                const uniFieldGroups = uni.fields.map(f => getUserFieldGroup(f));
                const isFieldMatch = uniFieldGroups.includes(userFieldGroup);
                if (!isFieldMatch) {
                    risks.push(`Field Mismatch`);
                } else {
                    whyItFits = `Aligns with your target field.`;
                }
                
                const estimatedAnnualCost = uni.annual_tuition_usd + uni.living_cost_usd;

                if (estimatedAnnualCost > userProfileForEngine.budgetMax + 10000) {
                     risks.push(`Over Budget`);
                } else if (estimatedAnnualCost > userProfileForEngine.budgetMax) {
                     risks.push(`Stretch Budget`);
                }

                if(userProfileForEngine.fundingType === 'scholarship-dependent') {
                    risks.push('Funding Uncertainty');
                }
                
                let academicFit: 'Strong' | 'Acceptable' | 'Borderline' | 'Weak' = 'Weak';
                if (userGpa) {
                     const gpaDiff = userGpa - uni.avg_gpa_required;
                     if (gpaDiff >= 0.3) academicFit = 'Strong';
                     else if (gpaDiff >= 0) academicFit = 'Acceptable';
                     else if (gpaDiff >= -0.3) academicFit = 'Borderline';
                }
                if (userGpa === null) {
                    risks.push('GPA not specified');
                } else if (academicFit === 'Weak') {
                    risks.push(`GPA Gap`);
                } else {
                     if (whyItFits) whyItFits += ' ';
                     whyItFits += `Your profile is an academic match.`;
                }

                if (uni.ielts_required && !userProfileForEngine.exams.ieltsCompleted) {
                    risks.push('IELTS Not Completed');
                }
                if (uni.gre_required && !userProfileForEngine.exams.greCompleted) {
                    risks.push('GRE Not Completed');
                }
                
                let acceptanceLikelihood: 'High' | 'Medium' | 'Low' = 'Low';
                if (academicFit === 'Strong' && uni.acceptance_difficulty === 'Low') {
                    acceptanceLikelihood = 'High';
                } else if (academicFit === 'Acceptable' && uni.acceptance_difficulty === 'Medium') {
                    acceptanceLikelihood = 'Medium';
                }
                
                let category: 'Dream' | 'Target' | 'Safe' | null = null;
                if (uni.acceptance_difficulty === 'High' && (academicFit === 'Acceptable' || academicFit === 'Borderline')) {
                    category = 'Dream';
                } else if (uni.acceptance_difficulty === 'Medium' && academicFit === 'Acceptable') {
                    category = 'Target';
                } else if (uni.acceptance_difficulty === 'Low' && academicFit === 'Strong') {
                    category = 'Safe';
                }
                
                if (category) {
                    discovered.push({
                        id: uni.id,
                        name: uni.name,
                        country: uni.country,
                        city: uni.city,
                        estimatedAnnualCost,
                        category,
                        acceptanceLikelihood,
                        whyItFits: whyItFits || "A potential option based on your preferences.",
                        risks,
                        imageUrl: uni.imageUrl,
                        imageHint: uni.imageHint
                    });
                }
            });

            const dream = discovered.filter(u => u.category === 'Dream');
            const target = discovered.filter(u => u.category === 'Target');
            const safe = discovered.filter(u => u.category === 'Safe');

            setCategorized({ dream, target, safe });
            setLoading(false);
        };
        
        if (user?.profile) {
            runDiscoveryEngine();
        } else {
            setLoading(false);
        }
    }, [user]);

    const allAsDiscovered = useMemo(() => {
        // @ts-ignore
        return allUniversities.map((uni: UniversityFromData & { annual_tuition_usd: number, living_cost_usd: number, ranking_band: string, avg_gpa_required: number, ielts_required: number | null, acceptance_difficulty: 'Low' | 'Medium' | 'High' }) => ({
            id: uni.id,
            name: uni.name,
            country: uni.country,
            city: uni.city,
            estimatedAnnualCost: uni.annual_tuition_usd + uni.living_cost_usd,
            category: 'Target', // Default category, not really used in this view
            acceptanceLikelihood: uni.acceptance_difficulty,
            whyItFits: `A ${uni.ranking_band} university known for: ${uni.fields.join(', ')}.`,
            risks: [`Avg. GPA: ${uni.avg_gpa_required}`, `IELTS: ${uni.ielts_required || 'N/A'}`],
            imageUrl: uni.imageUrl,
            imageHint: uni.imageHint
        }));
    }, []);

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
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-2xl font-headline flex items-center gap-2">
                            <Search className="h-6 w-6 text-primary"/>
                            {showAll ? 'All Universities' : 'University Discovery'}
                        </CardTitle>
                        <CardDescription>
                             {showAll
                                ? `Browse our entire database of ${allUniversities.length} universities.`
                                : 'Here are universities categorized based on your profile. Shortlist your favorites.'}
                        </CardDescription>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button variant="secondary" onClick={() => setShowAll(!showAll)} className="flex-grow sm:flex-grow-0">
                            {showAll ? 'Show Recommended' : 'Show All Universities'}
                        </Button>
                        <Button asChild variant="outline" className="flex-grow sm:flex-grow-0">
                            <Link href="/dashboard">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    {loading ? (
                        renderSkeletons()
                    ) : showAll ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {allAsDiscovered.map(uni => (
                                <UniversityCard 
                                    key={uni.id} 
                                    university={uni} 
                                    onShortlist={() => shortlistUniversity(uni.name)}
                                    isShortlisted={shortlistedUniversities.includes(uni.name)}
                                />
                            ))}
                        </div>
                    ) : !categorized || (!categorized.dream.length && !categorized.target.length && !categorized.safe.length) ? (
                        <div className="text-center py-10">
                            <p className="text-muted-foreground mb-4">No universities matched your specific criteria. Try broadening your search in your profile!</p>
                            <Button asChild variant="default">
                                <Link href="/onboarding">Edit Profile</Link>
                            </Button>
                        </div>
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
