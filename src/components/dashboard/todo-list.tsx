'use client';
import { useAuth } from "@/providers/auth-provider";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ListTodo, ClipboardCheck } from "lucide-react";
import type { ApplicationTask } from "@/lib/types";

export function TodoList() {
    const { user, updateTaskStatus } = useAuth();
    const tasks = user?.applicationTasks || [];

    if (user?.currentStage !== 4) {
        return (
            <AccordionItem value="todo" className="border-none">
                <AccordionTrigger className="text-lg font-semibold hover:no-underline font-headline p-4 bg-card rounded-lg shadow-sm data-[state=open]:rounded-b-none" disabled>
                     <div className="flex items-center gap-3 text-muted-foreground">
                        <ListTodo />
                        Application To-Do List
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                    <Card className="rounded-t-none backdrop-blur-sm bg-card/80 border-t-0">
                        <CardContent className="p-6 text-center text-muted-foreground">
                            Lock a university to generate your personalized application tasks.
                        </CardContent>
                    </Card>
                </AccordionContent>
            </AccordionItem>
        );
    }
    
    const completedTasks = tasks.filter(task => task.completed).length;
    const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

    return (
        <AccordionItem value="todo" className="border-none">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline font-headline p-4 bg-card rounded-lg shadow-sm data-[state=open]:rounded-b-none">
                <div className="flex items-center gap-3">
                    <ClipboardCheck />
                    Application To-Do List
                </div>
            </AccordionTrigger>
            <AccordionContent className="p-0">
                <Card className="rounded-t-none backdrop-blur-sm bg-card/80 border-t-0">
                    <CardContent className="p-6 space-y-4">
                        {tasks.length > 0 ? (
                            <>
                                <div className="flex items-center gap-4">
                                    <Progress value={progress} className="h-2" />
                                    <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">{completedTasks} / {tasks.length}</span>
                                </div>
                                <div className="space-y-3">
                                    {tasks.map(task => (
                                        <div key={task.id} className="flex items-center space-x-3 p-3 rounded-md bg-background border">
                                            <Checkbox 
                                                id={`task-${task.id}`} 
                                                checked={task.completed}
                                                onCheckedChange={(checked) => updateTaskStatus(task.id, !!checked)}
                                            />
                                            <Label 
                                                htmlFor={`task-${task.id}`} 
                                                className={`flex-grow ${task.completed ? 'text-muted-foreground line-through' : ''}`}
                                            >
                                                {task.title}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <p className="text-center text-muted-foreground">Your application tasks will appear here.</p>
                        )}
                    </CardContent>
                </Card>
            </AccordionContent>
        </AccordionItem>
    );
}
