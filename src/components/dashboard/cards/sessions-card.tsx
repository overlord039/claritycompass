'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

export function SessionsCard() {
    return (
        <Card className="flex flex-col h-full flex-grow">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                    Sessions
                </CardTitle>
                <Button variant="link" size="sm" className="p-0 h-auto">Schedule</Button>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col items-center justify-center text-center gap-2">
                 <div className="p-3 bg-muted rounded-full">
                    <Calendar className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">No upcoming sessions with your counsellor.</p>
            </CardContent>
        </Card>
    );
}
