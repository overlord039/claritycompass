import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface StageWrapperProps {
  icon: LucideIcon;
  title: string;
  description: string;
  children: ReactNode;
}

export function StageWrapper({ icon: Icon, title, description, children }: StageWrapperProps) {
  return (
    <Card className="shadow-xl backdrop-blur-md bg-card/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 font-headline text-2xl">
          <Icon className="w-7 h-7 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}
