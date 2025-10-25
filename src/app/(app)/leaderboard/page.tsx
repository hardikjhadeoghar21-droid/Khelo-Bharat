import LeaderboardClient from '@/components/leaderboard/leaderboard-client';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function LeaderboardPage() {

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground/90">Leaderboard</h1>
        <p className="text-muted-foreground">See how you stack up against other athletes across the nation.</p>
      </div>
       <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
        <LeaderboardClient />
      </Suspense>
    </div>
  );
}
