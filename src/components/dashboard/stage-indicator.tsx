'use client';

import { cn } from '@/lib/utils';
import { Check, User, Compass, Lock, FileText, PartyPopper } from 'lucide-react';

const stages = [
  { id: 1, name: 'Build Profile', Icon: User },
  { id: 2, name: 'Discover Universities', Icon: Compass },
  { id: 3, name: 'Finalize Choices', Icon: Lock },
  { id: 4, name: 'Prepare Applications', Icon: FileText },
  { id: 5, name: 'Application Ready', Icon: PartyPopper },
];

interface StageIndicatorProps {
  currentStage: number;
}

export function StageIndicator({ currentStage }: StageIndicatorProps) {
  return (
    <div aria-label="Application Process Stage">
      <ol role="list" className="flex items-center">
        {stages.map((stage, stageIdx) => {
          const isCompleted = currentStage > stage.id;
          const isCurrent = currentStage === stage.id;
          const isLastStage = stageIdx === stages.length - 1;

          return (
            <li key={stage.name} className={cn('relative', !isLastStage && 'flex-1')}>
              {/* Connector line */}
              {!isLastStage && (
                <div
                  className={cn(
                    "absolute left-4 top-4 -ml-px mt-0.5 h-0.5 w-full",
                    isCompleted ? "bg-primary" : "bg-border"
                  )}
                  aria-hidden="true"
                />
              )}
              
              <div className="relative flex flex-col items-center text-center">
                <div
                  className={cn(
                    'relative flex h-8 w-8 items-center justify-center rounded-full',
                    isCompleted ? 'bg-primary' : 'border-2 bg-background',
                    isCurrent ? 'border-primary animate-pulse-glow' : 'border-border'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5 text-primary-foreground" />
                  ) : (
                    <stage.Icon className={cn('h-4 w-4', isCurrent ? 'text-primary' : 'text-muted-foreground')} />
                  )}
                </div>
                <p className={cn(
                  "mt-2 text-xs font-medium",
                  isCurrent ? 'text-primary' : 'text-muted-foreground',
                  isCompleted && 'text-foreground'
                )}>
                  {stage.name}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
