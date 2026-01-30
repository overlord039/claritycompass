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
        <Card className="bg-primary/10 backdrop-blur-xl border border-primary/20 shadow-lg shadow-primary/10">
            <CardHeader className="p-3">
                <CardTitle className="flex items-center gap-2 font-headline text-base">
                    <Lightbulb className="h-4 w-4 text-primary drop-shadow-[0_0_8px_hsl(var(--primary))]" />
                    AI Counsellor
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-3 pt-0">
               <Skeleton className="h-3 w-full bg-primary/20" />
               <Skeleton className="h-3 w-3/4 bg-primary/20" />
               <div className="pt-1">
                <h3 className="font-semibold mb-1 flex items-center gap-2 text-xs"><ListChecks size={14} /> Next Actions:</h3>
                <ul className="space-y-1">
                    <li><Skeleton className="h-3 w-1/2 bg-primary/20" /></li>
                    <li><Skeleton className="h-3 w-2/3 bg-primary/20" /></li>
                </ul>
               </div>
            </CardContent>
        </Card>
    );
  }

  if (!guidance) return null;

  return (
    <Card className="bg-primary/10 backdrop-blur-xl border border-primary/20 shadow-lg shadow-primary/10">
      <CardHeader className="p-3">
        <CardTitle className="flex items-center gap-2 font-headline text-base">
          <Lightbulb className="h-4 w-4 text-primary drop-shadow-[0_0_8px_hsl(var(--primary))]" />
          AI Counsellor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 p-3 pt-0">
        <p className="text-foreground/90 text-xs">{guidance.guidance}</p>
        {guidance.actions.length > 0 && (
          <div className="pt-1">
            <h3 className="font-semibold mb-1 flex items-center gap-2 text-xs"><ListChecks size={14} /> Next Actions:</h3>
            <ul className="list-disc list-inside space-y-1 text-xs text-foreground/80">
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
