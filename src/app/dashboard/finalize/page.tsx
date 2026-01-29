'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { universities as allUniversities } from '@/lib/data';
import { StageWrapper } from '@/components/dashboard/stages/stage-wrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Lock, ThumbsDown, ArrowLeft } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function FinalizePage() {
    const { shortlistedUniversities, removeShortlistedUniversity, lockUniversities, setStage } = useAuth();
    const [selectedToLock, setSelectedToLock] = useState<string[]>([]);
    const router = useRouter();
    
    const shortlisted = allUniversities.filter(u => shortlistedUniversities.includes(u.name));

    const toggleLockSelection = (name: string) => {
        setSelectedToLock(prev => 
            prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
        );
    };

    const handleLock = async () => {
        await lockUniversities(selectedToLock);
        router.push('/dashboard/tasks');
    }

    if (shortlisted.length === 0) {
        return (
            <StageWrapper icon={Lock} title="Finalize University Choices" description="Review your shortlisted universities and lock your final choices to proceed.">
                <div className="text-center py-10">
                    <p className="text-muted-foreground mb-4">You haven't shortlisted any universities yet.</p>
                    <Button onClick={() => setStage(2)} asChild>
                        <Link href="/dashboard/discover">
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Back to Discovery
                        </Link>
                    </Button>
                </div>
            </StageWrapper>
        );
    }
    
    return (
        <StageWrapper icon={Lock} title="Finalize University Choices" description="This is a crucial step. Locking your choices helps the AI create a tailored application plan. Select one or more universities to lock.">
            <div className="space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {shortlisted.map(uni => {
                        const isSelected = selectedToLock.includes(uni.name);
                        return (
                            <Card key={uni.id} className={`group overflow-hidden flex flex-col h-full transition-all duration-300 ${isSelected ? 'ring-2 ring-primary shadow-2xl shadow-primary/30' : 'bg-background/50'}`}>
                                <div className="relative w-full h-40">
                                    <Image src={uni.imageUrl} alt={`Campus of ${uni.name}`} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover transition-transform duration-300 group-hover:scale-105" data-ai-hint={uni.imageHint}/>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                </div>
                                <CardHeader>
                                    <CardTitle className="text-lg">{uni.name}</CardTitle>
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        <Badge variant="secondary">{uni.country}</Badge>
                                        <Badge variant="secondary">Cost: {uni.costLevel}</Badge>
                                        <Badge variant="secondary">Chance: {uni.acceptanceChance}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-grow"></CardContent>
                                <CardFooter className="grid grid-cols-2 gap-2">
                                    <Button variant="outline" size="sm" onClick={() => removeShortlistedUniversity(uni.name)}><ThumbsDown className="mr-2 h-4 w-4" /> Remove</Button>
                                    <Button size="sm" variant={isSelected ? "secondary" : "default"} onClick={() => toggleLockSelection(uni.name)}>
                                        <Lock className="mr-2 h-4 w-4" /> {isSelected ? 'Unlock' : 'Select to Lock'}
                                    </Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
                <div className="pt-6 flex flex-col items-center gap-4">
                     <p className="text-muted-foreground">{selectedToLock.length > 0 ? `You have selected ${selectedToLock.length} universit${selectedToLock.length > 1 ? 'ies' : 'y'} to lock.` : "Select at least one university to lock."}</p>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button size="lg" disabled={selectedToLock.length === 0}>
                                <Lock className="mr-2"/> Lock {selectedToLock.length} Universit{selectedToLock.length === 1 ? 'y' : 'ies'}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you ready to commit?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Locking your university choices is a significant commitment. Once locked, your application strategy will be tailored specifically for these selections. You can unlock them later, but it will reset your application tasks.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Review Selection</AlertDialogCancel>
                                <AlertDialogAction onClick={handleLock}>Confirm and Lock</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                     <Button variant="ghost" asChild>
                        <Link href="/dashboard/discover">
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Back to Discovery
                        </Link>
                    </Button>
                </div>
            </div>
        </StageWrapper>
    );
}
