'use client';

import { useEffect, useState } from 'react';
import { universityDiscoveryEngine } from '@/lib/actions';
import { useAuth } from '@/providers/auth-provider';
import type { University, UserProfile } from '@/lib/types';
import type { UniversityDiscoveryEngineInput } from '@/ai/flows/university-discovery-engine';
import { universities as allUniversities } from '@/lib/data';
import { StageWrapper } from './stage-wrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Search, ThumbsUp } from 'lucide-react';

type CategorizedUniversities = {
  dream: University[];
  target: University[];
  safe: University[];
};

const transformProfileForDiscovery = (profile: UserProfile): Omit<UniversityDiscoveryEngineInput, 'universitiesData'> => {
    return {
        educationLevel: profile.academic.educationLevel,
        degree: profile.academic.degree,
        fieldOfStudy: profile.studyGoal.fieldOfStudy,
        targetIntakeYear: profile.studyGoal.targetIntakeYear,
        preferredCountries: profile.studyGoal.preferredCountries,
        budgetRangePerYear: profile.budget.budgetRangePerYear,
        ieltsStatus: profile.readiness.ieltsStatus,
        greStatus: profile.readiness.greStatus,
        sopStatus: profile.readiness.sopStatus,
    };
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
                    {isShortlisted && <ThumbsUp className="ml-2" />}
                </Button>
            </CardFooter>
        </Card>
    );
}

export default function Stage2Discovery() {
  const { user, setStage, shortlistUniversity, shortlistedUniversities } = useAuth();
  const [categorized, setCategorized] = useState<CategorizedUniversities | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const discover = async () => {
      if (!user?.profile) return;
      setLoading(true);
      const result = await universityDiscoveryEngine({
        ...transformProfileForDiscovery(user.profile),
        universitiesData: JSON.stringify(allUniversities),
      });

      if (result) {
        setCategorized({
          dream: allUniversities.filter(u => result.dreamUniversities.includes(u.name)),
          target: allUniversities.filter(u => result.targetUniversities.includes(u.name)),
          safe: allUniversities.filter(u => result.safeUniversities.includes(u.name)),
        });
      }
      setLoading(false);
    };

    discover();
  }, [user?.profile]);

  const canProceed = shortlistedUniversities.length >= 1;

  if (loading) {
    return (
        <StageWrapper icon={Search} title="Discovering Universities" description="Our AI is analyzing your profile to find the best universities for you.">
             <div className="space-y-8">
                {['Dream', 'Target', 'Safe'].map(category => (
                    <div key={category}>
                        <h3 className="text-xl font-bold mb-4">{category} Universities</h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-96 rounded-lg" />)}
                        </div>
                    </div>
                ))}
            </div>
        </StageWrapper>
    );
  }

  return (
    <StageWrapper icon={Search} title="Discovering Universities" description="Here are universities categorized by our AI based on your profile. Shortlist at least one to proceed.">
      <div className="space-y-12">
        {categorized && (
            <>
              {Object.entries(categorized).map(([category, unis]) => (
                unis.length > 0 && <div key={category}>
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
              ))}
            </>
        )}
        <div className="pt-6 flex flex-col items-center">
            <p className="text-muted-foreground mb-4">{canProceed ? "You're ready for the next step!" : "Shortlist at least 1 university to continue."}</p>
            <Button size="lg" disabled={!canProceed} onClick={() => setStage(3)}>
                Finalize Your Choices <ArrowRight className="ml-2" />
            </Button>
        </div>
      </div>
    </StageWrapper>
  );
}
