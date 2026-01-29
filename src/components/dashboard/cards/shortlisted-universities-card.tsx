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
import { ScrollArea } from '@/components/ui/scroll-area';

function MiniUniversityCard({ university }: { university: University }) {
    return (
        <div className="p-3 rounded-lg bg-background/50 hover:bg-accent transition-colors border flex flex-col h-full text-center items-center">
             <Image
                src={university.imageUrl}
                alt={university.name}
                width={48}
                height={48}
                className="rounded-md object-cover h-12 w-12 mb-2 flex-shrink-0"
                data-ai-hint={university.imageHint}
            />
            <div className="flex-grow flex flex-col justify-center">
                <p className="font-semibold text-xs leading-tight">{university.name}</p>
                <p className="text-xs text-muted-foreground">{university.country}</p>
            </div>
             <Badge variant="secondary" className="mt-1 text-xs">{university.acceptanceChance}</Badge>
        </div>
    );
}

export function ShortlistedUniversitiesCard() {
    const { shortlistedUniversities } = useAuth();

    const universities = allUniversities.filter(uni => shortlistedUniversities.includes(uni.name));

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <Heart className="h-5 w-5" />
                    Shortlisted Universities
                </CardTitle>
                <CardDescription>
                    Your favorite universities at a glance.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col min-h-0">
                {universities.length > 0 ? (
                    <ScrollArea className="flex-grow">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 pr-4">
                            {universities.map(uni => (
                               <Link href="/dashboard/discover" key={uni.id} className="block h-full">
                                 <MiniUniversityCard university={uni} />
                               </Link>
                            ))}
                        </div>
                    </ScrollArea>
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
