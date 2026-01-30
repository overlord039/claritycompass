'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import { universities as allUniversities } from '@/lib/data';
import { StageWrapper } from '@/components/dashboard/stages/stage-wrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, ThumbsUp, Rocket, Target, ShieldCheck, Search, Loader2, Lock, Heart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

type UniversityRecommendation = {
  id: string;
  name: string;
  country: string;
  city: string;
  estimatedAnnualCost: number;
  acceptanceLikelihood: "High" | "Medium" | "Low";
  whyItFits: string;
  risks: string[];
  imageUrl: string;
  imageHint: string;
};


function UniversityCard({ university, onShortlist, isShortlisted, isLocked }: { university: UniversityRecommendation; onShortlist: () => void; isShortlisted: boolean; isLocked: boolean }) {
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
                 {isLocked && (
                    <div className="absolute top-2 left-2 flex items-center gap-1.5 text-primary-foreground text-xs font-semibold bg-primary/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-lg">
                        <Lock size={12} />
                        <span>Locked</span>
                    </div>
                )}
                 <Badge className="absolute top-2 right-2" variant={
                    university.acceptanceLikelihood === 'High' ? 'default' : university.acceptanceLikelihood === 'Medium' ? 'secondary' : 'destructive'
                }>
                    {university.acceptanceLikelihood} Likelihood
                </Badge>
            </div>
            <CardHeader>
                <CardTitle className="text-lg">{university.name}</CardTitle>
                <div className="flex flex-wrap gap-2 pt-2">
                    <Badge variant="secondary">{university.country}, {university.city}</Badge>
                    <Badge variant="secondary">~${university.estimatedAnnualCost.toLocaleString()}/year</Badge>
                </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-2 text-sm text-muted-foreground">
                 <p><strong className="text-foreground">Why it fits:</strong> {university.whyItFits}</p>
                 {university.risks.length > 0 && (
                    <div>
                        <strong className="text-foreground">Risks to consider:</strong>
                        <ul className="list-disc list-inside pl-2">
                            {university.risks.map((risk, i) => <li key={i}>{risk}</li>)}
                        </ul>
                    </div>
                 )}
            </CardContent>
            <CardFooter>
                 <Button onClick={onShortlist} disabled={isShortlisted} className="w-full">
                    {isLocked ? 'Locked' : isShortlisted ? 'Shortlisted' : 'Shortlist this University'}
                    {isLocked ? <Lock className="ml-2 h-4 w-4" /> : isShortlisted ? <ThumbsUp className="ml-2 h-4 w-4" /> : null}
                </Button>
            </CardFooter>
        </Card>
    );
}

const UniversityGrid = ({ universities, onShortlist, shortlistedUniversities, lockedUniversities }: { universities: UniversityRecommendation[], onShortlist: (name: string) => void, shortlistedUniversities: string[], lockedUniversities: string[] }) => {
    if (universities.length === 0) {
        return (
            <div className="text-center py-16">
                <p className="text-lg font-semibold">No universities found for this category</p>
                <p className="text-muted-foreground">Please adjust your filters or check back later.</p>
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
                    isLocked={lockedUniversities.includes(uni.name)}
                />
            ))}
        </div>
    );
}


const LoadingSkeletons = () => (
    <div className='text-center py-10'>
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="mt-4 text-muted-foreground">The recommendation engine is analyzing your profile...</p>
         <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
        </div>
    </div>
);

const ProceedSection = ({ canProceed, setStage }: { canProceed: boolean, setStage: (stage: number) => void }) => (
    <div className="pt-6 flex flex-col items-center gap-4">
        <p className="text-muted-foreground">{canProceed ? "You're ready for the next step!" : "Shortlist at least 1 university to continue."}</p>
        <Button size="lg" disabled={!canProceed} onClick={() => setStage(3)} asChild>
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
);


export default function DiscoverPage() {
  const { user, setStage, shortlistUniversity, shortlistedUniversities, lockedUniversities } = useAuth();
  const [categorizedUniversities, setCategorizedUniversities] = useState<{ dream: UniversityRecommendation[], target: UniversityRecommendation[], safe: UniversityRecommendation[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runDiscoveryEngine = () => {
        if (!user || !user.profile) {
            setLoading(false);
            return;
        }
        setLoading(true);

        const { profile } = user;

        const parseGpa = (gpaString?: string): number | null => {
            if (!gpaString) return null;
            const sanitized = gpaString.replace(/[^0-9./]/g, '');
            const parts = sanitized.split('/');
            if (parts.length === 0 || parts[0] === '') return null;
            const gpaValue = parseFloat(parts[0]);
            if (isNaN(gpaValue)) return null;

            let maxGpa = parts.length > 1 ? parseFloat(parts[1]) : 0;
            if (isNaN(maxGpa) || maxGpa === 0) {
                if (gpaValue <= 4.0) maxGpa = 4.0;
                else if (gpaValue <= 5.0) maxGpa = 5.0;
                else if (gpaValue <= 10.0) maxGpa = 10.0;
                else return gpaValue;
            }
            if (maxGpa === 0) return null;
            return (gpaValue / maxGpa) * 10;
        };
        const userGpa = parseGpa(profile.academic.gpa);

        const parseBudget = (budgetRange?: string): { min: number; max: number } => {
            if (!budgetRange) return { min: 0, max: Infinity };
            if (budgetRange === '<20k') return { min: 0, max: 20000 };
            if (budgetRange === '20k-40k') return { min: 20000, max: 40000 };
            if (budgetRange === '>40k') return { min: 40000, max: Infinity };
            return { min: 0, max: Infinity };
        };
        const userBudget = parseBudget(profile.budget.budgetRangePerYear);

        const fieldEquivalences: { [key: string]: string[] } = {
            'CS/IT': ['Computer Science', 'CS', 'IT', 'Data Science', 'AI', 'Data Analytics', 'Applied IT', 'Analytics'],
            'Business': ['Business', 'Management', 'Business Analytics', 'Analytics'],
            'Engineering': ['Engineering'],
            'MBBS': ['MBBS'],
            'Research': ['Research'],
        };
        const mapToGeneralField = (field: string): string | null => {
            for (const generalField in fieldEquivalences) {
                if (fieldEquivalences[generalField].map(f => f.toLowerCase()).includes(field.toLowerCase())) {
                    return generalField;
                }
            }
            return null;
        };
        const userTargetField = mapToGeneralField(profile.studyGoal.fieldOfStudy);

        const countryFiltered = allUniversities.filter(uni =>
            profile.studyGoal.preferredCountries.some(prefCountry => uni.country.toLowerCase() === prefCountry.toLowerCase())
        );

        const fieldFiltered = countryFiltered.filter(uni =>
            uni.fields.some(field => mapToGeneralField(field) === userTargetField)
        );

        const recommendations = fieldFiltered.map(uni => {
            const estimatedAnnualCost = uni.annual_tuition_usd + uni.living_cost_usd;
            
            let academicFit: 'Strong' | 'Acceptable' | 'Borderline' | 'Weak' = 'Weak';
            let gpaRisk = '';
            if (userGpa) {
                const gpaDifference = userGpa - uni.avg_gpa_required;
                if (gpaDifference >= 0.5) academicFit = 'Strong';
                else if (gpaDifference >= -0.2) academicFit = 'Acceptable';
                else if (gpaDifference >= -0.5) {
                    academicFit = 'Borderline';
                    gpaRisk = `Your GPA (${profile.academic.gpa}) is slightly below the average required (${uni.avg_gpa_required}/10).`;
                } else {
                    academicFit = 'Weak';
                    gpaRisk = `Your GPA (${profile.academic.gpa}) is below the average required (${uni.avg_gpa_required}/10).`;
                }
            }

            let examFit: 'Good' | 'Weak' = 'Good';
            const examRisks: string[] = [];
            if (uni.gre_required && profile.readiness.greStatus !== 'Completed') {
                examFit = 'Weak';
                examRisks.push('GRE is required but not marked as completed.');
            }
            if (uni.ielts_required && profile.readiness.ieltsStatus !== 'Completed') {
                if (uni.ielts_required > 6.0) examFit = 'Weak';
                examRisks.push('IELTS/TOEFL is required but not marked as completed.');
            }

            let acceptanceLikelihood: 'High' | 'Medium' | 'Low' = 'Low';
            if (academicFit === 'Strong' && examFit === 'Good') acceptanceLikelihood = 'High';
            else if (academicFit === 'Acceptable' && examFit === 'Good') acceptanceLikelihood = 'Medium';
            else if (academicFit === 'Borderline') acceptanceLikelihood = 'Low';
            
            const whyItFits = `${uni.name} offers a strong program in ${profile.studyGoal.fieldOfStudy}. With your GPA, it's a ${academicFit.toLowerCase()} academic fit.`;
            const risks: string[] = [];
            if (gpaRisk) risks.push(gpaRisk);
            risks.push(...examRisks);
            if (estimatedAnnualCost > userBudget.max) {
                risks.push(`Estimated annual cost of ~$${estimatedAnnualCost.toLocaleString()} exceeds your budget.`);
            }
            if (profile.budget.fundingType === 'scholarship-dependent') {
                risks.push('Your plan is dependent on securing a scholarship.');
            }

            return { ...uni, academicFit, examFit, estimatedAnnualCost, acceptanceLikelihood, whyItFits, risks };
        });

        const dream: UniversityRecommendation[] = [];
        const target: UniversityRecommendation[] = [];
        const safe: UniversityRecommendation[] = [];

        recommendations.forEach(rec => {
            const recommendationOutput: UniversityRecommendation = {
                id: rec.id, name: rec.name, country: rec.country, city: rec.city,
                estimatedAnnualCost: rec.estimatedAnnualCost,
                acceptanceLikelihood: rec.acceptanceLikelihood,
                whyItFits: rec.whyItFits, risks: rec.risks,
                imageUrl: rec.imageUrl, imageHint: rec.imageHint,
            };
            if (rec.acceptance_difficulty === 'High' && (rec.academicFit === 'Acceptable' || rec.academicFit === 'Borderline')) {
                dream.push(recommendationOutput);
            } else if (rec.acceptance_difficulty === 'Medium' && rec.academicFit === 'Acceptable') {
                target.push(recommendationOutput);
            } else if (rec.acceptance_difficulty === 'Low' && rec.academicFit === 'Strong') {
                safe.push(recommendationOutput);
            }
        });

        setCategorizedUniversities({ dream, target, safe });
        setLoading(false);
    };

    runDiscoveryEngine();
  }, [user]);

  const canProceed = shortlistedUniversities.length >= 1;

  const allRecommendations = categorizedUniversities ? [
      ...categorizedUniversities.dream,
      ...categorizedUniversities.target,
      ...categorizedUniversities.safe
  ] : [];

  const shortlistedAndRecommended = allRecommendations.filter(uni => shortlistedUniversities.includes(uni.name));
  const lockedAndRecommended = allRecommendations.filter(uni => lockedUniversities.includes(uni.name));

  const defaultAiTab = useMemo(() => {
    if (!categorizedUniversities) {
      return 'target';
    }
    const { dream, target, safe } = categorizedUniversities;
    const counts = {
      target: target.length,
      dream: dream.length,
      safe: safe.length,
    };
    
    const defaultCategory = (Object.keys(counts) as Array<keyof typeof counts>).reduce((a, b) =>
      counts[a] >= counts[b] ? a : b
    );

    return defaultCategory;
  }, [categorizedUniversities]);

  return (
    <Tabs defaultValue="discover" className="w-full">
        <TabsList className="w-full justify-start">
            <TabsTrigger value="discover"><Search className="mr-2 h-4 w-4" />AI Discovery</TabsTrigger>
            <TabsTrigger value="shortlisted"><Heart className="mr-2 h-4 w-4" />Shortlisted ({shortlistedAndRecommended.length})</TabsTrigger>
            <TabsTrigger value="locked"><Lock className="mr-2 h-4 w-4" />Locked ({lockedAndRecommended.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="discover" className="mt-6">
            <StageWrapper icon={Search} title="AI-Powered University Discovery" description="Your profile has been analyzed to generate these personalized recommendations. Shortlist at least one to proceed.">
              <div className="space-y-8">
                {loading ? (
                    <LoadingSkeletons/>
                ) : categorizedUniversities ? (
                    <Tabs defaultValue={defaultAiTab} className="w-full">
                        <TabsList className="w-full justify-start">
                            <TabsTrigger value="dream"><Rocket className="mr-2 h-4 w-4" />Dream ({categorizedUniversities.dream.length})</TabsTrigger>
                            <TabsTrigger value="target"><Target className="mr-2 h-4 w-4" />Target ({categorizedUniversities.target.length})</TabsTrigger>
                            <TabsTrigger value="safe"><ShieldCheck className="mr-2 h-4 w-4" />Safe ({categorizedUniversities.safe.length})</TabsTrigger>
                        </TabsList>
                        <TabsContent value="dream" className="mt-6">
                            <UniversityGrid universities={categorizedUniversities.dream} onShortlist={shortlistUniversity} shortlistedUniversities={shortlistedUniversities} lockedUniversities={lockedUniversities} />
                        </TabsContent>
                        <TabsContent value="target" className="mt-6">
                            <UniversityGrid universities={categorizedUniversities.target} onShortlist={shortlistUniversity} shortlistedUniversities={shortlistedUniversities} lockedUniversities={lockedUniversities} />
                        </TabsContent>
                        <TabsContent value="safe" className="mt-6">
                            <UniversityGrid universities={categorizedUniversities.safe} onShortlist={shortlistUniversity} shortlistedUniversities={shortlistedUniversities} lockedUniversities={lockedUniversities} />
                        </TabsContent>
                    </Tabs>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-lg font-semibold">Could not generate recommendations</p>
                        <p className="text-muted-foreground">There was an error while the recommendation engine was analyzing your profile.</p>
                    </div>
                )}
                <ProceedSection canProceed={canProceed} setStage={setStage} />
              </div>
            </StageWrapper>
        </TabsContent>

        <TabsContent value="shortlisted" className="mt-6">
            <StageWrapper icon={Heart} title={`Your Shortlisted Universities (${shortlistedAndRecommended.length})`} description="Review and manage your shortlisted universities.">
                {loading ? <LoadingSkeletons/> : (
                    <div className="space-y-8">
                        <UniversityGrid universities={shortlistedAndRecommended} onShortlist={shortlistUniversity} shortlistedUniversities={shortlistedUniversities} lockedUniversities={lockedUniversities} />
                        <ProceedSection canProceed={canProceed} setStage={setStage} />
                    </div>
                )}
            </StageWrapper>
        </TabsContent>

        <TabsContent value="locked" className="mt-6">
            <StageWrapper icon={Lock} title={`Your Locked Universities (${lockedAndRecommended.length})`} description="These are your final choices. Your application plan will be based on these selections.">
                {loading ? <LoadingSkeletons/> : (
                    <div className="space-y-8">
                        <UniversityGrid universities={lockedAndRecommended} onShortlist={shortlistUniversity} shortlistedUniversities={shortlistedUniversities} lockedUniversities={lockedUniversities} />
                        <ProceedSection canProceed={canProceed} setStage={setStage} />
                    </div>
                )}
            </StageWrapper>
        </TabsContent>
    </Tabs>
  );
}
