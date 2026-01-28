'use client';
import { ProfileAnalysisCard } from '@/components/dashboard/cards/profile-analysis-card';
import { NextMissionCard } from '@/components/dashboard/cards/next-mission-card';
import { JournalCard } from '@/components/dashboard/cards/journal-card';
import { SessionsCard } from '@/components/dashboard/cards/sessions-card';
import { ShortlistedUniversitiesCard } from '@/components/dashboard/cards/shortlisted-universities-card';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <ProfileAnalysisCard />
        </div>
        <div>
            <NextMissionCard />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <JournalCard />
        <SessionsCard />
      </div>
      <div className="grid grid-cols-1 gap-6">
        <ShortlistedUniversitiesCard />
      </div>
    </div>
  );
}
