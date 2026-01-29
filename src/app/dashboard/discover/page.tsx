'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import type { University } from '@/lib/types';
import { universities as allUniversities } from '@/lib/data';
import { StageWrapper } from '@/components/dashboard/stages/stage-wrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Search, ThumbsUp } from 'lucide-react';
import { Input } from '@/components/ui/input';

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
  const { setStage, shortlistUniversity, shortlistedUniversities } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUniversities = useMemo(() => {
    if (!searchQuery) {
        return allUniversities;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return allUniversities.filter(uni => 
        uni.name.toLowerCase().includes(lowercasedQuery) ||
        uni.country.toLowerCase().includes(lowercasedQuery) ||
        uni.fields.some(field => field.toLowerCase().includes(lowercasedQuery))
    );
  }, [searchQuery, allUniversities]);


  const canProceed = shortlistedUniversities.length >= 1;

  const handleProceed = () => {
    if (canProceed) {
      setStage(3);
    }
  }

  return (
    <StageWrapper icon={Search} title="Explore Universities" description="Search for universities and shortlist your favorites. You need to shortlist at least one to proceed.">
      <div className="space-y-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search by name, country, or field of study..."
            className="pl-10 w-full md:w-1/2 lg:w-1/3"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {filteredUniversities.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUniversities.map(uni => (
              <UniversityCard 
                key={uni.id} 
                university={uni} 
                onShortlist={() => shortlistUniversity(uni.name)}
                isShortlisted={shortlistedUniversities.includes(uni.name)}
              />
            ))}
          </div>
        ) : (
            <div className="text-center py-16">
                <p className="text-lg font-semibold">No universities found</p>
                <p className="text-muted-foreground">Try adjusting your search query.</p>
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
