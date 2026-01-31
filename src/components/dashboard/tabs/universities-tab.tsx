'use client';

import { useAuth } from '@/providers/auth-provider';
import { DiscoverView } from '@/components/dashboard/views/discover-view';
import { FinalizeView } from '@/components/dashboard/views/finalize-view';

export function UniversitiesTab({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const { user } = useAuth();

  if (!user) return null;

  if (user.currentStage === 3) {
    return <FinalizeView setActiveTab={setActiveTab} />;
  }
  
  return <DiscoverView />;
}
