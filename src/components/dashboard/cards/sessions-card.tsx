'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

export function SessionsCard() {
    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-semibold">
                    Sessions & Meetings
                </CardTitle>
                <Button variant="link" size="sm" className="p-0 h-auto">Schedule</Button>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col items-center justify-center text-center gap-4">
                 <div className="p-4 bg-muted rounded-full">
                    <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No upcoming sessions with your counsellor.</p>
            </CardContent>
        </Card>
    );
}
