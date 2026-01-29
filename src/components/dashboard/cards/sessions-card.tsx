'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

export function SessionsCard() {
    return (
        <Card className="flex flex-col h-full flex-grow">
            <CardHeader className="flex flex-row items-center justify-between p-4">
                <CardTitle className="text-base font-semibold">
                    Sessions
                </CardTitle>
                <Button variant="link" size="sm" className="p-0 h-auto text-xs">Schedule</Button>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col items-center justify-center text-center gap-2 p-4">
                 <div className="p-2 bg-muted rounded-full">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">No upcoming sessions.</p>
            </CardContent>
        </Card>
    );
}
