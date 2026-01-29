'use client';

import { useState } from 'react';
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
import { Calendar as CalendarIcon, Book, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

type Session = {
    id: string;
    title: string;
    date: Date;
    type: 'Exam' | 'Deadline' | 'Meeting' | 'Reminder';
};

function AddSessionForm({ onAddSession }: { onAddSession: (session: Omit<Session, 'id'>) => void }) {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState<Date | undefined>();
    const [type, setType] = useState<Session['type'] | undefined>();
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !date || !type) {
            toast({
                variant: 'destructive',
                title: 'Missing Fields',
                description: 'Please fill out all fields to add a session.',
            });
            return;
        }
        onAddSession({ title, date, type });
        setTitle('');
        setDate(undefined);
        setType(undefined);
    };

    return (
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                    Title
                </Label>
                <Input id="title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                    Date
                </Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal col-span-3",
                                !date && "text-muted-foreground"
                            )}
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
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                    Type
                </Label>
                <Select onValueChange={(value: Session['type']) => setType(value)} value={type}>
                    <SelectTrigger className="col-span-3">
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
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
                <Button type="submit">Save Event</Button>
            </DialogFooter>
        </form>
    );
}

export default function NotesAndSessionsPage() {
    const [notes, setNotes] = useState('');
    const [sessions, setSessions] = useState<Session[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();

    const handleSaveNotes = () => {
        // In a real app, you'd save this to a backend (e.g., Firestore).
        // For this example, we just show a toast.
        toast({
            title: 'Notes Saved!',
            description: 'Your notes have been saved locally.',
        });
    };
    
    const handleAddSession = (newSessionData: Omit<Session, 'id'>) => {
        const newSession: Session = {
            id: new Date().toISOString(),
            ...newSessionData,
        };

        setSessions(prev => [...prev, newSession].sort((a, b) => a.date.getTime() - b.date.getTime()));
        setIsDialogOpen(false);
        toast({
            title: 'Session Added',
            description: `${newSession.title} has been scheduled.`,
        });
    };
    
    const handleDeleteSession = (sessionId: string) => {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        toast({
            title: 'Session Removed',
        });
    }

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
        <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Notes Section */}
            <Card className="h-full flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Book className="h-5 w-5 text-primary" />
                        My Private Notes
                    </CardTitle>
                    <CardDescription>
                        Jot down your thoughts, questions, and ideas. Only you can see this.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                    <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Start writing your notes for your study abroad journey..."
                        className="min-h-[300px] text-sm h-full resize-none"
                    />
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSaveNotes} className="ml-auto">Save Notes</Button>
                </CardFooter>
            </Card>

            {/* Sessions Section */}
            <Card className="h-full flex flex-col">
                <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-primary" />
                        Important Dates & Sessions
                    </CardTitle>
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
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Add a new event</DialogTitle>
                                <DialogDescription>
                                    Schedule an important date to keep track of your progress.
                                </DialogDescription>
                            </DialogHeader>
                            <AddSessionForm onAddSession={handleAddSession} />
                        </DialogContent>
                    </Dialog>

                    <ScrollArea className="flex-grow h-72">
                        <div className="space-y-3 pr-4">
                            {sessions.length > 0 ? (
                                sessions.map(session => {
                                    const iconInfo = getIconInfo(session.type);
                                    return (
                                    <div key={session.id} className="flex items-center justify-between p-3 rounded-md bg-background/50 border">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("p-1.5 rounded-full", iconInfo.bg)}>
                                                <CalendarIcon className={cn("h-4 w-4", iconInfo.color)} />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">{session.title}</p>
                                                <p className="text-xs text-muted-foreground">{format(session.date, 'PPP')}</p>
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
        </div>
    );
}