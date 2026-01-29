'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Book, Plus } from 'lucide-react';

export function JournalCard() {
    return (
        <Card className="h-full flex flex-col flex-grow">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <Book className="h-5 w-5" />
                    Journal & Notes
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
                <div className="relative h-full">
                    <Textarea placeholder="What's on your mind?" className="h-full pr-10 resize-none text-sm"/>
                    <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7">
                        <Plus className="h-4 w-4"/>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
