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
    if (currentStage >= 5) {
        return (
            <div aria-label="Application Process Stage">
               <ol role="list" className="flex items-center">
                    {[...stages, { id: 5, name: 'Application Ready' }].map((stage) => (
                       <li key={stage.name} className={cn('relative', stage.id !== 5 ? 'flex-1' : '')}>
                           <div className="flex flex-col items-center text-center">
                                {stage.id < 5 && <div className="absolute inset-0 top-5 -z-10 w-full h-0.5 bg-primary" aria-hidden="true" />}
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                                   <Check className="h-6 w-6 text-primary-foreground" aria-hidden="true" />
                               </div>
                               <p className="mt-2 text-xs md:text-sm font-medium text-foreground">{stage.name}</p>
                           </div>
                       </li>
                   ))}
               </ol>
           </div>
        );
     }

  return (
    <div aria-label="Application Process Stage">
      <ol role="list" className="flex items-center">
        {stages.map((stage, stageIdx) => (
          <li key={stage.name} className={cn('relative flex-1')}>
            <div className="flex flex-col items-center text-center">
                {currentStage > stage.id ? (
                    <>
                        <div className="absolute inset-0 top-5 -z-10 w-full h-0.5 bg-primary" aria-hidden="true" />
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                            <Check className="h-6 w-6 text-primary-foreground" aria-hidden="true" />
                        </div>
                        <p className="mt-2 text-xs md:text-sm font-medium text-foreground">{stage.name}</p>
                    </>
                ) : currentStage === stage.id ? (
                    <>
                        <div className="absolute inset-0 top-5 -z-10 w-full h-0.5 bg-border" aria-hidden="true" />
                        <div className="absolute right-0 top-5 -z-10 w-1/2 h-0.5 bg-primary" aria-hidden="true" />
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary bg-background animate-pulse-glow">
                            <span className="text-primary text-sm font-semibold">{`0${stage.id}`}</span>
                        </div>
                        <p className="mt-2 text-xs md:text-sm font-medium text-primary">{stage.name}</p>
                    </>
                ) : (
                    <>
                         <div className="absolute inset-0 top-5 -z-10 w-full h-0.5 bg-border" aria-hidden="true" />
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-border bg-background">
                            <span className="text-muted-foreground text-sm font-semibold">{`0${stage.id}`}</span>
                        </div>
                        <p className="mt-2 text-xs md:text-sm font-medium text-muted-foreground">{stage.name}</p>
                    </>
                )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
