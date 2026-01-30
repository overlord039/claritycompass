'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardFooter, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Book, Plus, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Session } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


function AddSessionForm({ onAddSession, isSubmitting }: { onAddSession: (session: Omit<Session, 'id' | 'userId' | 'createdAt' | 'date'> & { date: Date }) => Promise<void>, isSubmitting: boolean }) {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState<Date | undefined>();
    const [type, setType] = useState<Session['type'] | undefined>();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        if (!title || !date || !type) {
            toast({
                variant: 'destructive',
                title: 'Missing Fields',
                description: 'Please fill out all fields to add a session.',
            });
            return;
        }
        
        await onAddSession({ title, date, type });

        // Reset form on success, as dialog will close
        setTitle('');
        setDate(undefined);
        setType(undefined);
    };

    return (
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Label htmlFor="title">
                    Title
                </Label>
                <Input id="title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={isSubmitting} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="date">
                    Date
                </Label>
                <Popover modal={true}>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                            )}
                            disabled={isSubmitting}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="type">
                    Type
                </Label>
                <Select onValueChange={(value: Session['type']) => setType(value)} value={type} disabled={isSubmitting}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Exam">Exam</SelectItem>
                        <SelectItem value="Deadline">Deadline</SelectItem>
                        <SelectItem value="Meeting">Meeting</SelectItem>
                        <SelectItem value="Reminder">Reminder</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <DialogFooter className="pt-4">
                <DialogClose asChild>
                    <Button type="button" variant="secondary" disabled={isSubmitting}>Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Event
                </Button>
            </DialogFooter>
        </form>
    );
}

export default function NotesAndSessionsPage() {
    const { user, sessions, updateNotes, addSession, deleteSession } = useAuth();
    const [notes, setNotes] = useState(user?.state?.notes || '');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user?.state?.notes) {
            setNotes(user.state.notes);
        }
    }, [user?.state?.notes]);

    const handleSaveNotes = () => {
        updateNotes(notes);
    };
    
    const handleAddSession = async (newSessionData: Omit<Session, 'id' | 'userId' | 'createdAt' | 'date'> & { date: Date }) => {
        setIsSubmitting(true);
        try {
            await addSession(newSessionData);
            setIsDialogOpen(false);
        } catch (error) {
            // Error toast is handled in the auth provider
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDeleteSession = (sessionId: string) => {
        deleteSession(sessionId);
    }

    const sortedSessions = [...sessions].sort((a, b) => {
        const dateA = a.date instanceof Timestamp ? a.date.toDate() : new Date(a.date);
        const dateB = b.date instanceof Timestamp ? b.date.toDate() : new Date(b.date);
        return dateA.getTime() - dateB.getTime();
    });

    const getIconInfo = (type: Session['type']) => {
        switch (type) {
            case 'Exam': return { color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/50' };
            case 'Deadline': return { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/50' };
            case 'Meeting': return { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/50' };
            case 'Reminder': return { color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-200 dark:bg-gray-700/50' };
            default: return { color: 'text-gray-600', bg: 'bg-gray-200' };
        }
    };

    return (
        <Tabs defaultValue="notes" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
                <TabsTrigger value="notes">
                    <Book className="mr-2 h-4 w-4" />
                    My Private Notes
                </TabsTrigger>
                <TabsTrigger value="sessions">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Important Dates
                </TabsTrigger>
            </TabsList>
            <TabsContent value="notes" className="mt-6">
                <Card className="max-w-3xl mx-auto">
                    <CardHeader>
                        <CardTitle>My Private Notes</CardTitle>
                        <CardDescription>
                            Jot down your thoughts, questions, and ideas. Only you can see this.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Start writing your notes for your study abroad journey..."
                            className="min-h-[400px] text-sm resize-none"
                        />
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleSaveNotes} className="ml-auto">Save Notes</Button>
                    </CardFooter>
                </Card>
            </TabsContent>
            <TabsContent value="sessions" className="mt-6">
                 <Card className="max-w-3xl mx-auto">
                    <CardHeader>
                        <CardTitle>Important Dates & Sessions</CardTitle>
                        <CardDescription>
                            Keep track of exam dates, application deadlines, and meetings.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col gap-4">
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="w-full">
                                    <Plus className="mr-2 h-4 w-4" /> Add New Date/Session
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add a new event</DialogTitle>
                                    <DialogDescription>
                                        Schedule an important date to keep track of your progress.
                                    </DialogDescription>
                                </DialogHeader>
                                <AddSessionForm onAddSession={handleAddSession} isSubmitting={isSubmitting} />
                            </DialogContent>
                        </Dialog>

                        <ScrollArea className="flex-grow h-96">
                            <div className="space-y-3 pr-4">
                                {sortedSessions.length > 0 ? (
                                    sortedSessions.map(session => {
                                        const iconInfo = getIconInfo(session.type);
                                        const sessionDate = session.date instanceof Timestamp ? session.date.toDate() : new Date(session.date);
                                        return (
                                        <div key={session.id} className="flex items-center justify-between p-3 rounded-md bg-background/50 border">
                                            <div className="flex items-center gap-3">
                                                <div className={cn("p-1.5 rounded-full", iconInfo.bg)}>
                                                    <CalendarIcon className={cn("h-4 w-4", iconInfo.color)} />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm">{session.title}</p>
                                                    <p className="text-xs text-muted-foreground">{format(sessionDate, 'PPP')}</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteSession(session.id)}>
                                                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                            </Button>
                                        </div>
                                    )})
                                ) : (
                                    <div className="text-center py-10 text-sm text-muted-foreground h-full flex flex-col justify-center items-center">
                                        <p>You have no upcoming dates.</p>
                                        <p>Click the button above to add one.</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
