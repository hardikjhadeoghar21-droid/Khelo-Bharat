'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { UserProfile } from '@/hooks/use-auth';
import { Card } from '../ui/card';
import { useAuth } from '@/hooks/use-auth';

// Define a more specific type for the table data
export interface LeaderboardRowData {
    rank: number;
    athlete: UserProfile;
    score: number;
    age: number;
    height: number;
    weight: number;
    lastTest: string;
}

export function LeaderboardTable({ data }: { data: LeaderboardRowData[] }) {
  const { user } = useAuth();
  
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Rank</TableHead>
            <TableHead>Athlete</TableHead>
            <TableHead className="text-right">Score</TableHead>
            <TableHead className="hidden md:table-cell text-center">Age</TableHead>
            <TableHead className="hidden lg:table-cell text-center">Height (cm)</TableHead>
            <TableHead className="hidden lg:table-cell text-center">Weight (kg)</TableHead>
            <TableHead className="hidden md:table-cell">Last Test</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((entry) => (
            <TableRow key={entry.rank} className={entry.athlete.id === user?.uid ? 'bg-primary/10' : ''}>
              <TableCell className="font-bold text-lg text-primary">{entry.rank}</TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={entry.athlete.avatar} alt={entry.athlete.name} />
                    <AvatarFallback>{entry.athlete.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{entry.athlete.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-right font-semibold">{entry.score}</TableCell>
              <TableCell className="hidden md:table-cell text-center">{entry.age}</TableCell>
              <TableCell className="hidden lg:table-cell text-center">{entry.height}</TableCell>
              <TableCell className="hidden lg:table-cell text-center">{entry.weight}</TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground capitalize">{entry.lastTest}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
       {data.length === 0 && (
        <div className="text-center p-8 text-muted-foreground">
          No athletes match the current filters.
        </div>
      )}
    </Card>
  );
}
