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
        <div className="p-2 rounded-lg bg-background/50 hover:bg-accent transition-colors border flex flex-col h-full text-center items-center">
             <Image
                src={university.imageUrl}
                alt={university.name}
                width={40}
                height={40}
                className="rounded-md object-cover h-10 w-10 mb-2 flex-shrink-0"
                data-ai-hint={university.imageHint}
            />
            <div className="flex-grow flex flex-col justify-center">
                <p className="font-semibold text-xs leading-tight">{university.name}</p>
                <p className="text-xs text-muted-foreground">{university.country}</p>
            </div>
             <Badge variant="secondary" className="mt-1 text-[10px] px-1.5 py-0">
                {university.acceptanceChance}
             </Badge>
        </div>
    );
}

export function ShortlistedUniversitiesCard() {
    const { shortlistedUniversities } = useAuth();

    const universities = allUniversities.filter(uni => shortlistedUniversities.includes(uni.name));

    return (
        <Card className="flex flex-col">
            <CardHeader className="p-4">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <Heart className="h-4 w-4" />
                    Shortlisted Universities
                </CardTitle>
                <CardDescription className="text-xs">
                    Your favorite universities at a glance.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col min-h-0 p-4 pt-0">
                {universities.length > 0 ? (
                    <ScrollArea className="flex-grow">
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-3 pr-4">
                            {universities.map(uni => (
                               <Link href="/dashboard/discover" key={uni.id} className="block h-full">
                                 <MiniUniversityCard university={uni} />
                               </Link>
                            ))}
                        </div>
                    </ScrollArea>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6">
                        <div className="p-3 bg-muted rounded-full mb-2">
                            <Search className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">You haven't shortlisted any universities yet.</p>
                        <Button asChild size="sm">
                            <Link href="/dashboard/discover">Discover Universities</Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
