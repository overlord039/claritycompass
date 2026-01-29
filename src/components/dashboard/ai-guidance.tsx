'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { getAIPersonalizedGuidance } from '@/lib/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, ListChecks } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

export function AiGuidance() {
  const { user } = useAuth();
  const [guidance, setGuidance] = useState<{ guidance: string; actions: string[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuidance = async () => {
      if (!user || !user.profile) return;
      
      setLoading(true);
      const result = await getAIPersonalizedGuidance({
        profileData: JSON.stringify(user.profile),
        currentStage: user.currentStage.toString(),
        shortlistedUniversities: user.shortlistedUniversities,
        lockedUniversities: user.lockedUniversities,
      });
      setGuidance(result);
      setLoading(false);
    };

    fetchGuidance();
  }, [user]);

  if (loading) {
    return (
        <Card className="h-full bg-primary/10 backdrop-blur-xl border border-primary/20 shadow-lg shadow-primary/10">
            <CardHeader className="p-4">
                <CardTitle className="flex items-center gap-2 font-headline text-lg">
                    <Lightbulb className="text-primary drop-shadow-[0_0_8px_hsl(var(--primary))]" />
                    AI Counsellor
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4 pt-0">
               <Skeleton className="h-4 w-full bg-primary/20" />
               <Skeleton className="h-4 w-3/4 bg-primary/20" />
               <div className="pt-2">
                <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm"><ListChecks size={16} /> Next Actions:</h3>
                <ul className="space-y-1.5">
                    <li><Skeleton className="h-4 w-1/2 bg-primary/20" /></li>
                    <li><Skeleton className="h-4 w-2/3 bg-primary/20" /></li>
                </ul>
               </div>
            </CardContent>
        </Card>
    );
  }

  if (!guidance) return null;

  return (
    <Card className="h-full bg-primary/10 backdrop-blur-xl border border-primary/20 shadow-lg shadow-primary/10">
      <CardHeader className="p-4">
        <CardTitle className="flex items-center gap-2 font-headline text-lg">
          <Lightbulb className="text-primary drop-shadow-[0_0_8px_hsl(var(--primary))]" />
          AI Counsellor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-0">
        <p className="text-foreground/90 text-sm">{guidance.guidance}</p>
        {guidance.actions.length > 0 && (
          <div className="pt-2">
            <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm"><ListChecks size={16} /> Next Actions:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-foreground/80">
              {guidance.actions.map((action, index) => (
                <li key={index}>{action}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
