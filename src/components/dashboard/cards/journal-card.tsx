'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Book, Plus } from 'lucide-react';

export function JournalCard() {
    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                    <Book className="h-5 w-5" />
                    Personal Journal & Notes
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
                <div className="relative h-full">
                    <Textarea placeholder="What's on your mind? Capture your thoughts..." className="h-full pr-12 resize-none"/>
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8">
                        <Plus className="h-5 w-5"/>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
