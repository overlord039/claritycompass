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
        <Card className="bg-accent/50 border-accent shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <Lightbulb className="text-primary" />
                    AI Counsellor Guidance
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <Skeleton className="h-4 w-full" />
               <Skeleton className="h-4 w-3/4" />
               <div className="pt-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2"><ListChecks size={18} /> Next Actions:</h3>
                <ul className="space-y-2">
                    <li><Skeleton className="h-4 w-1/2" /></li>
                    <li><Skeleton className="h-4 w-2/3" /></li>
                </ul>
               </div>
            </CardContent>
        </Card>
    );
  }

  if (!guidance) return null;

  return (
    <Card className="bg-accent/50 border-accent shadow-sm backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Lightbulb className="text-primary" />
          AI Counsellor Guidance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-foreground/90">{guidance.guidance}</p>
        {guidance.actions.length > 0 && (
          <div className="pt-2">
            <h3 className="font-semibold mb-2 flex items-center gap-2"><ListChecks size={18} /> Next Actions:</h3>
            <ul className="list-disc list-inside space-y-1 text-foreground/80">
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
