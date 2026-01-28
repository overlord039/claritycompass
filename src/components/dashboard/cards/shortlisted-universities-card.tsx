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
        <div className="flex items-center gap-4 p-3 rounded-lg bg-background/50 hover:bg-accent transition-colors">
            <Image
                src={university.imageUrl}
                alt={university.name}
                width={56}
                height={56}
                className="rounded-md object-cover h-14 w-14"
                data-ai-hint={university.imageHint}
            />
            <div className="flex-1">
                <p className="font-semibold text-sm">{university.name}</p>
                <p className="text-xs text-muted-foreground">{university.country}</p>
            </div>
            <Badge variant="secondary">{university.acceptanceChance}</Badge>
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
                    Your favorite universities at a glance. Click to manage your list.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                {universities.length > 0 ? (
                    <div className="space-y-3">
                        {universities.slice(0, 4).map(uni => (
                           <Link href="/dashboard/discover" key={uni.id}>
                             <MiniUniversityCard university={uni} />
                           </Link>
                        ))}
                         {universities.length > 4 && (
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
