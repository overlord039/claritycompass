'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/providers/auth-provider';
import { universities as allUniversities } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Search } from 'lucide-react';
import type { University } from '@/lib/types';

function MiniUniversityCard({ university }: { university: University }) {
    return (
        <div className="p-3 rounded-lg bg-background/50 hover:bg-accent transition-colors border flex flex-col h-full text-center items-center">
             <Image
                src={university.imageUrl}
                alt={university.name}
                width={64}
                height={64}
                className="rounded-md object-cover h-16 w-16 mb-3 flex-shrink-0"
                data-ai-hint={university.imageHint}
            />
            <div className="flex-grow flex flex-col justify-center">
                <p className="font-semibold text-sm leading-tight">{university.name}</p>
                <p className="text-xs text-muted-foreground">{university.country}</p>
            </div>
             <Badge variant="secondary" className="mt-2 flex-shrink-0">{university.acceptanceChance}</Badge>
        </div>
    );
}

export function ShortlistedUniversitiesCard() {
    const { shortlistedUniversities } = useAuth();

    const universities = allUniversities.filter(uni => shortlistedUniversities.includes(uni.name));

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                    <Heart className="h-5 w-5" />
                    Shortlisted Universities
                </CardTitle>
                <CardDescription>
                    Your favorite universities at a glance.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                {universities.length > 0 ? (
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {universities.slice(0, 8).map(uni => (
                               <Link href="/dashboard/discover" key={uni.id} className="block h-full">
                                 <MiniUniversityCard university={uni} />
                               </Link>
                            ))}
                        </div>
                         {universities.length > 8 && (
                            <Button variant="outline" className="w-full mt-2" asChild>
                                <Link href="/dashboard/discover">View all {universities.length} shortlisted</Link>
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6">
                        <div className="p-4 bg-muted rounded-full mb-4">
                            <Search className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground mb-4">You haven't shortlisted any universities yet.</p>
                        <Button asChild>
                            <Link href="/dashboard/discover">Discover Universities</Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
