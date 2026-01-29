'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import type { University } from '@/lib/types';
import { universities as allUniversities } from '@/lib/data';
import { universityDiscoveryEngine } from '@/lib/actions';
import { StageWrapper } from '@/components/dashboard/stages/stage-wrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, ThumbsUp, Rocket, Target, ShieldCheck, Search, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

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

const UniversityGrid = ({ universities, onShortlist, shortlistedUniversities }: { universities: University[], onShortlist: (name: string) => void, shortlistedUniversities: string[] }) => {
    if (universities.length === 0) {
        return (
            <div className="text-center py-16">
                <p className="text-lg font-semibold">No universities found for this category</p>
                <p className="text-muted-foreground">The AI couldn't find any matches based on your profile.</p>
            </div>
        )
    }
    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {universities.map(uni => (
                <UniversityCard 
                    key={uni.id} 
                    university={uni} 
                    onShortlist={() => onShortlist(uni.name)}
                    isShortlisted={shortlistedUniversities.includes(uni.name)}
                />
            ))}
        </div>
    );
}

export default function DiscoverPage() {
  const { user, setStage, shortlistUniversity, shortlistedUniversities } = useAuth();
  const [categorizedUniversities, setCategorizedUniversities] = useState<{ dream: University[], target: University[], safe: University[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const discover = async () => {
        if (!user || !user.profile) return;
        setLoading(true);

        const result = await universityDiscoveryEngine({
            educationLevel: user.profile.academic.educationLevel,
            degree: user.profile.academic.degree,
            fieldOfStudy: user.profile.studyGoal.fieldOfStudy,
            targetIntakeYear: user.profile.studyGoal.targetIntakeYear,
            preferredCountries: user.profile.studyGoal.preferredCountries,
            budgetRangePerYear: user.profile.budget.budgetRangePerYear,
            ieltsStatus: user.profile.readiness.ieltsStatus,
            greStatus: user.profile.readiness.greStatus,
            sopStatus: user.profile.readiness.sopStatus,
            universitiesData: JSON.stringify(allUniversities)
        });

        if (result) {
            const dream = allUniversities.filter(u => result.dreamUniversities.includes(u.name));
            const target = allUniversities.filter(u => result.targetUniversities.includes(u.name));
            const safe = allUniversities.filter(u => result.safeUniversities.includes(u.name));
            setCategorizedUniversities({ dream, target, safe });
        }
        setLoading(false);
    };

    discover();
  }, [user]);

  const canProceed = shortlistedUniversities.length >= 1;

  const handleProceed = () => {
    if (canProceed) {
      setStage(3);
    }
  }

  return (
    <StageWrapper icon={Search} title="AI-Powered University Discovery" description="Your profile has been analyzed to generate these personalized recommendations. Shortlist at least one university to proceed.">
      <div className="space-y-8">
        {loading ? (
            <div className='text-center py-10'>
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="mt-4 text-muted-foreground">The AI is analyzing your profile to find the best universities for you...</p>
                 <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-96 w-full" />
                    <Skeleton className="h-96 w-full" />
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
        ) : categorizedUniversities ? (
            <Tabs defaultValue="target" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="dream"><Rocket className="mr-2 h-4 w-4" />Dream</TabsTrigger>
                    <TabsTrigger value="target"><Target className="mr-2 h-4 w-4" />Target</TabsTrigger>
                    <TabsTrigger value="safe"><ShieldCheck className="mr-2 h-4 w-4" />Safe</TabsTrigger>
                </TabsList>
                <TabsContent value="dream" className="mt-6">
                    <UniversityGrid universities={categorizedUniversities.dream} onShortlist={shortlistUniversity} shortlistedUniversities={shortlistedUniversities} />
                </TabsContent>
                <TabsContent value="target" className="mt-6">
                    <UniversityGrid universities={categorizedUniversities.target} onShortlist={shortlistUniversity} shortlistedUniversities={shortlistedUniversities} />
                </TabsContent>
                <TabsContent value="safe" className="mt-6">
                    <UniversityGrid universities={categorizedUniversities.safe} onShortlist={shortlistUniversity} shortlistedUniversities={shortlistedUniversities} />
                </TabsContent>
            </Tabs>
        ) : (
             <div className="text-center py-16">
                <p className="text-lg font-semibold">Could not generate recommendations</p>
                <p className="text-muted-foreground">There was an error while the AI was analyzing your profile.</p>
            </div>
        )}

        <div className="pt-6 flex flex-col items-center gap-4">
            <p className="text-muted-foreground">{canProceed ? "You're ready for the next step!" : "Shortlist at least 1 university to continue."}</p>
            <Button size="lg" disabled={!canProceed} onClick={handleProceed} asChild>
                <Link href="/dashboard/finalize">
                    Finalize Your Choices <ArrowRight className="ml-2" />
                </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>
            </Button>
        </div>
      </div>
    </StageWrapper>
  );
}
