
'use client';
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import StatCard from '@/components/dashboard/stat-card';
import BadgeList from '@/components/dashboard/badge-list';
import DailyChallenges from '@/components/dashboard/daily-challenges';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BarChart3, Trophy, Users, ShieldCheck, ListVideo } from 'lucide-react';
import PendingSubmissions from '@/components/dashboard/pending-submissions';
import { useCollection, useFirestore, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import type { UserProfile } from '@/hooks/use-auth';

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const firestore = useFirestore();
  const [totalAthletes, setTotalAthletes] = useState(0);
  const [athletesLoading, setAthletesLoading] = useState(true);

  useEffect(() => {
    if (firestore && profile?.role === 'official') {
      const athletesQuery = query(collection(firestore, 'users'), where('role', '==', 'athlete'));
      getCountFromServer(athletesQuery).then(snapshot => {
        setTotalAthletes(snapshot.data().count);
        setAthletesLoading(false);
      }).catch(serverError => {
        const permissionError = new FirestorePermissionError({
            path: 'users',
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setAthletesLoading(false);
      });
    } else {
        setAthletesLoading(false);
    }
  }, [firestore, profile]);
  

  const userTestsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'tests'), where('athleteId', '==', user.uid));
  }, [firestore, user]);

  const { data: userTests, isLoading: testsLoading } = useCollection<any>(userTestsQuery);

  const stats = useMemo(() => {
    if (!userTests) {
      return {
        overallScore: 0,
        testsTaken: 0,
      };
    }
    const overallScore = userTests.reduce((max, test) => test.score > max ? test.score : max, 0);
    const testsTaken = userTests.length;
    return { overallScore, testsTaken };
  }, [userTests]);
  
  // Note: Rank is complex to calculate on the client efficiently without reading all data.
  // This is a simplification. For a real app, a server-side aggregation or Cloud Function
  // would be needed to calculate rank efficiently. We will show N/A for now.
  const rankDisplay = 'N/A';
  const isLoading = athletesLoading || testsLoading;
  
  if (!user || !profile) return null;
  
  if (profile.role === 'athlete') {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground/90">Welcome back, {profile.name.split(' ')[0]}!</h1>
          <p className="text-muted-foreground">Here's your performance at a glance. Keep up the great work!</p>
        </div>

        <PendingSubmissions />
        <DailyChallenges />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatCard title="Overall Score" value={isLoading ? '...' : stats.overallScore} icon={Trophy} description="Your highest score" />
          <StatCard title="Current Rank" value={rankDisplay} icon={BarChart3} description="On the national leaderboard" />
          <StatCard title="Tests Taken" value={isLoading ? '...' : stats.testsTaken} icon={ListVideo} description="Total assessments completed" />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Your Badges</CardTitle>
                    <CardDescription>Achievements unlocked from your performance.</CardDescription>
                </CardHeader>
                <CardContent>
                    <BadgeList />
                </CardContent>
            </Card>
            <Card className="flex flex-col items-center justify-center bg-primary/10 border-primary/20">
              <CardHeader className="items-center text-center">
                <div className="rounded-full bg-primary p-4 text-primary-foreground">
                  <Trophy className="h-8 w-8" />
                </div>
                <CardTitle>Ready for a new challenge?</CardTitle>
                <CardDescription>Take a new test and climb the leaderboard.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild size="lg">
                  <Link href="/test">Start New Test</Link>
                </Button>
              </CardContent>
            </Card>
        </div>
      </div>
    );
  }

  if (profile.role === 'official') {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground/90">Official Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage the Khelo India AI platform.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatCard title="Total Athletes" value={isLoading ? '...' : totalAthletes} icon={Users} description="Registered on the platform" />
          <StatCard title="Tests This Week" value={"N/A"} icon={Trophy} description="Calculation pending" />
          <StatCard title="Verified Officials" value={4} icon={ShieldCheck} description="Active on the platform" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Access key platform features.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
             <Button asChild>
                <Link href="/leaderboard">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Athletes
                </Link>
             </Button>
             <Button asChild variant="secondary">
                <Link href="/submissions">
                    <ListVideo className="mr-2 h-4 w-4" />
                    Review Submissions
                </Link>
             </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
