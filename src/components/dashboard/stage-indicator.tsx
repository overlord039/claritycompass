import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const stages = [
  { id: 1, name: 'Build Profile' },
  { id: 2, name: 'Discover Universities' },
  { id: 3, name: 'Finalize Choices' },
  { id: 4, name: 'Prepare Applications' },
];

interface StageIndicatorProps {
  currentStage: number;
}

export function StageIndicator({ currentStage }: StageIndicatorProps) {
  return (
    <div aria-label="Application Process Stage">
      <nav className="flex items-center justify-center" aria-label="Progress">
        <ol role="list" className="flex items-center space-x-2 md:space-x-4">
          {stages.map((stage, stageIdx) => (
            <li key={stage.name} className={cn('flex-1')}>
              {currentStage > stage.id ? (
                <div className="group flex w-full flex-col items-center">
                  <span className="flex items-center">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                      <Check className="h-6 w-6 text-primary-foreground" aria-hidden="true" />
                    </span>
                  </span>
                  <span className="mt-2 text-xs md:text-sm font-medium text-center">{stage.name}</span>
                </div>
              ) : currentStage === stage.id ? (
                <div className="group flex w-full flex-col items-center" aria-current="step">
                  <span className="flex items-center">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary">
                      <span className="text-primary text-sm font-semibold">{`0${stage.id}`}</span>
                    </span>
                  </span>
                   <span className="mt-2 text-xs md:text-sm font-medium text-primary text-center">{stage.name}</span>
                </div>
              ) : (
                 <div className="group flex w-full flex-col items-center">
                  <span className="flex items-center">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-border">
                       <span className="text-muted-foreground text-sm font-semibold">{`0${stage.id}`}</span>
                    </span>
                  </span>
                   <span className="mt-2 text-xs md:text-sm font-medium text-muted-foreground text-center">{stage.name}</span>
                </div>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}
