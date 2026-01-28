'use client';

import { useAuth } from "@/providers/auth-provider";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { User, Briefcase, MapPin, DollarSign, Target, GraduationCap } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

export function ProfileSummary() {
    const { user } = useAuth();
    const profile = user?.profile;

    if (!profile) {
        return (
            <AccordionItem value="summary">
                <AccordionTrigger className="text-lg font-semibold font-headline">Profile Summary</AccordionTrigger>
                <AccordionContent>
                    <Card className="backdrop-blur-sm bg-card/80">
                        <CardContent className="p-6">
                            <Skeleton className="h-32 w-full" />
                        </CardContent>
                    </Card>
                </AccordionContent>
            </AccordionItem>
        );
    }

    const summaryItems = [
        { icon: GraduationCap, label: 'Education', value: `${profile.degree}, graduated ${profile.graduationYear}` },
        { icon: Target, label: 'Goal', value: `${profile.intendedDegree} in ${profile.fieldOfStudy}` },
        { icon: Briefcase, label: 'Intake', value: profile.targetIntakeYear },
        { icon: MapPin, label: 'Countries', value: profile.preferredCountries.join(', ') },
        { icon: DollarSign, label: 'Budget', value: `${profile.budgetRangePerYear} (via ${profile.fundingType})` },
    ];

    return (
        <AccordionItem value="summary" className="border-none">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline font-headline p-4 bg-card rounded-lg shadow-sm data-[state=open]:rounded-b-none">
                <div className="flex items-center gap-3">
                    <User />
                    Profile Summary
                </div>
            </AccordionTrigger>
            <AccordionContent className="p-0">
                <Card className="rounded-t-none backdrop-blur-sm bg-card/80 border-t-0">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                            {summaryItems.map(item => (
                                <div key={item.label} className="flex gap-4 items-start">
                                    <item.icon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-foreground">{item.label}</p>
                                        <p className="text-muted-foreground">{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </AccordionContent>
        </AccordionItem>
    );
}
