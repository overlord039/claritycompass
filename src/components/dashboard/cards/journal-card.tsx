'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Book, Plus } from 'lucide-react';

export function JournalCard() {
    return (
        <Card className="h-full flex flex-col flex-grow">
            <CardHeader className="p-4">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <Book className="h-4 w-4" />
                    Journal & Notes
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow p-4 pt-0">
                <div className="relative h-full">
                    <Textarea placeholder="What's on your mind?" className="h-full pr-8 resize-none text-xs" rows={2}/>
                    <Button variant="ghost" size="icon" className="absolute top-1 right-0 h-6 w-6">
                        <Plus className="h-4 w-4"/>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
