'use client';

import { useState, useMemo } from 'react';
import { LeaderboardTable } from './leaderboard-table';
import { LeaderboardFilters } from './leaderboard-filters';
import { Skeleton } from '../ui/skeleton';
import type { UserProfile } from '@/hooks/use-auth';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertCircle } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';

export default function LeaderboardClient() {
  const [filters, setFilters] = useState({
    gender: 'all',
    age: 'all',
    sort: 'rank-asc',
  });
  
  const firestore = useFirestore();

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'), where('role', '==', 'athlete'));
  }, [firestore]);
  
  const testsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'tests'), orderBy('testDateTime', 'desc'));
  }, [firestore]);

  const { data: usersData, isLoading: usersLoading, error: usersError } = useCollection<UserProfile>(usersQuery);
  const { data: testsData, isLoading: testsLoading, error: testsError } = useCollection<any>(testsQuery);

  const leaderboardData = useMemo(() => {
    if (!usersData || !testsData) return null;

    const usersMap = new Map(usersData.map(u => [u.id, u]));

    const bestScores: { [key: string]: any } = {};
    const allUserTests: { [key: string]: any[] } = {};

    for (const test of testsData) {
      // Ensure athleteId exists before processing
      if (!test.athleteId) continue;
      
      if (!allUserTests[test.athleteId]) {
        allUserTests[test.athleteId] = [];
      }
      allUserTests[test.athleteId].push(test);

      if (!bestScores[test.athleteId] || test.score > bestScores[test.athleteId].score) {
        bestScores[test.athleteId] = test;
      }
    }
    
    const unsortedData = Object.keys(bestScores)
      .map(athleteId => {
        const test = bestScores[athleteId];
        const user = usersMap.get(athleteId);
        if (!user || user.role !== 'athlete' || !user.age || !user.height || !user.weight || !user.gender) return null;
        return {
          athlete: user,
          score: test.score,
          age: user.age,
          height: user.height,
          weight: user.weight,
          gender: user.gender,
          lastTest: test.testType,
          totalTests: allUserTests[athleteId]?.length || 0,
        };
      })
      .filter((entry): entry is Exclude<typeof entry, null> => entry !== null);
      
    return unsortedData
      .sort((a, b) => b.score - a.score)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

  }, [usersData, testsData]);

  const filteredAndSortedData = useMemo(() => {
    if (!leaderboardData) return [];
    let filtered = [...leaderboardData];

    // Filter by gender
    if (filters.gender !== 'all') {
      filtered = filtered.filter(
        (entry) => entry.gender.toLowerCase() === filters.gender
      );
    }

    // Filter by age range
    if (filters.age !== 'all') {
      const [min, max] = filters.age.split('-').map(Number);
      filtered = filtered.filter(
        (entry) => entry.age >= min && entry.age <= max
      );
    }

    // Sort data
    const [sortKey, sortDir] = filters.sort.split('-');
    filtered.sort((a, b) => {
      let valA: number, valB: number;

      switch(sortKey) {
        case 'score':
            valA = a.score;
            valB = b.score;
            break;
        case 'age':
            valA = a.age;
            valB = b.age;
            break;
        case 'height':
            valA = a.height;
            valB = b.height;
            break;
        case 'weight':
            valA = a.weight;
            valB = b.weight;
            break;
        default: // rank
            valA = a.rank;
            valB = b.rank;
            break;
      }

      if (sortDir === 'asc') {
        return valA - valB;
      } else {
        return valB - a.score;
      }
    });
    
    return filtered;
  }, [leaderboardData, filters]);
  
  const isLoading = usersLoading || testsLoading;
  const error = usersError || testsError;

  if (isLoading) {
      return <Skeleton className="h-[600px] w-full" />
  }

  if (error) {
    return (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Could not load the leaderboard. Please ensure you have permission and try again later.</AlertDescription>
        </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <LeaderboardFilters filters={filters} setFilters={setFilters} />
      <LeaderboardTable data={filteredAndSortedData} />
    </div>
  );
}
