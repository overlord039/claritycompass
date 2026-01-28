'use client';
import { useEffect } from 'react';
import { useAuth } from "@/providers/auth-provider";
import { assessProfile } from "@/lib/actions";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, ShieldCheck, BookOpen, FileText, Activity } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { cn } from '@/lib/utils';

export function ProfileStrength() {
    const { user, profileStrength, updateProfileStrength } = useAuth();

    useEffect(() => {
        const runAssessment = async () => {
            if (user?.profile && !profileStrength) {
                const result = await assessProfile(user.profile);
                if (result) {
                    updateProfileStrength(result);
                }
            }
        };
        runAssessment();
    }, [user, profileStrength, updateProfileStrength]);

    const strengthItems = [
        { icon: ShieldCheck, label: 'Academics', value: profileStrength?.academicStrength },
        { icon: BookOpen, label: 'Exams', value: profileStrength?.examReadiness },
        { icon: FileText, label: 'SOP', value: profileStrength?.sopReadiness },
    ];

    const getStrengthColor = (value: string | null | undefined) => {
        switch (value) {
            case 'Strong':
            case 'Completed':
            case 'Ready':
                return 'text-green-600 bg-green-100';
            case 'Average':
            case 'In progress':
            case 'Draft':
                return 'text-amber-600 bg-amber-100';
            case 'Weak':
            case 'Not started':
                return 'text-red-600 bg-red-100';
            default:
                return 'text-muted-foreground bg-muted';
        }
    };

    const renderContent = () => {
        if (!profileStrength) {
            return <Skeleton className="h-36 w-full" />;
        }

        return (
             <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {strengthItems.map(item => (
                        <div key={item.label} className="p-4 rounded-lg bg-background border flex flex-col items-center text-center">
                            <item.icon className="w-7 h-7 text-primary mb-2" />
                            <p className="font-semibold text-foreground mb-1">{item.label}</p>
                            <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium', getStrengthColor(item.value))}>
                                {item.value || 'N/A'}
                            </span>
                        </div>
                    ))}
                </div>
                {profileStrength.recommendations && (
                    <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2"><Activity size={18}/> Recommendations</h4>
                        <p className="text-muted-foreground text-sm whitespace-pre-line">{profileStrength.recommendations}</p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <AccordionItem value="strength" className="border-none">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline font-headline p-4 bg-card rounded-lg shadow-sm data-[state=open]:rounded-b-none">
                 <div className="flex items-center gap-3">
                    <Zap />
                    AI Profile Strength
                </div>
            </AccordionTrigger>
            <AccordionContent className="p-0">
                <Card className="rounded-t-none backdrop-blur-sm bg-card/80 border-t-0">
                    <CardContent className="p-6">
                        {renderContent()}
                    </CardContent>
                </Card>
            </AccordionContent>
        </AccordionItem>
    );
}
