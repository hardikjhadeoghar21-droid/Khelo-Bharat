
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertCircle } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { UserProfile } from '@/hooks/use-auth';

export default function SubmissionsClient() {
    const firestore = useFirestore();

    const usersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'users');
    }, [firestore]);

    const testsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'tests'), orderBy('testDateTime', 'desc'));
    }, [firestore]);

    const { data: usersData, isLoading: usersLoading, error: usersError } = useCollection<UserProfile>(usersQuery);
    const { data: testsData, isLoading: testsLoading, error: testsError } = useCollection<any>(testsQuery);

    const submissions = useMemo(() => {
        if (!usersData || !testsData) return [];
        const usersMap = new Map(usersData.map(u => [u.id, u]));

        return testsData.map(test => {
            const athlete = usersMap.get(test.athleteId);
            return {
                ...test,
                athlete: athlete || { name: 'Unknown', avatar: '' },
            };
        });
    }, [usersData, testsData]);

    const isLoading = usersLoading || testsLoading;
    const error = usersError || testsError;

    if (isLoading) {
        return <Skeleton className="h-[400px] w-full" />;
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Could not load submission data. Please try again later.</AlertDescription>
            </Alert>
        );
    }

    return (
        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Athlete</TableHead>
                        <TableHead>Test Type</TableHead>
                        <TableHead className="text-right">Score</TableHead>
                        <TableHead>Gender</TableHead>
                        <TableHead>Age</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {submissions && submissions.length > 0 ? (
                        submissions.map(submission => (
                            <TableRow key={submission.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                      <Avatar>
                                        <AvatarImage src={submission.athlete.avatar} alt={submission.athlete.name} />
                                        <AvatarFallback>{submission.athlete.name.charAt(0)}</AvatarFallback>
                                      </Avatar>
                                      <span className="font-medium">{submission.athlete.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="capitalize">{submission.testType}</TableCell>
                                <TableCell className="text-right font-semibold">{submission.score}</TableCell>
                                <TableCell>{submission.athlete.gender}</TableCell>
                                <TableCell>{submission.athlete.age}</TableCell>
                                 <TableCell>
                                    <Badge variant={submission.isValid ? 'secondary' : 'destructive'} className={submission.isValid ? "bg-green-500/20 text-green-900 dark:text-green-200" : "bg-red-500/20 text-red-900 dark:text-red-200"}>
                                        {submission.isValid ? 'Valid' : 'Invalid'}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center h-24">
                                No submissions found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </Card>
    );
}
