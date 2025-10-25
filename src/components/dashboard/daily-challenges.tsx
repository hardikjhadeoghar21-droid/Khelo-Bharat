'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { dailyChallenges } from '@/lib/mock-data';
import { Flame, Timer, Repeat, Trophy } from 'lucide-react';
import { SitUpIcon } from '../icons/sit-up-icon';
import { HighJumpIcon } from '../icons/high-jump-icon';

const exerciseIcons = {
  'sit-ups': SitUpIcon,
  'high-jump': HighJumpIcon,
};

const difficultyColors = {
    Easy: 'border-green-500/50 bg-green-500/10',
    Medium: 'border-yellow-500/50 bg-yellow-500/10',
    Hard: 'border-red-500/50 bg-red-500/10',
}

export default function DailyChallenges() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Flame className="text-primary" />
            Daily Challenges
        </CardTitle>
        <CardDescription>Complete daily tasks to earn badges and climb the leaderboard.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {dailyChallenges.map((challenge) => {
            const Icon = exerciseIcons[challenge.exerciseType];
            return (
                <div key={challenge.id} className={`rounded-lg border-2 p-4 flex flex-col sm:flex-row items-center gap-4 ${difficultyColors[challenge.difficulty]}`}>
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-background flex-shrink-0">
                        <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                        <p className="font-bold text-lg">{challenge.title}</p>
                        <p className="text-muted-foreground text-sm">{challenge.description}</p>
                        <div className="flex items-center justify-center sm:justify-start gap-4 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Repeat className="h-4 w-4" />
                                <span>{challenge.target}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Trophy className="h-4 w-4" />
                                <span>{challenge.badge.name} Badge</span>
                            </div>
                        </div>
                    </div>
                    <Button asChild className="mt-4 sm:mt-0">
                        <Link href={`/test/${challenge.exerciseType}`}>Start Challenge</Link>
                    </Button>
                </div>
            )
        })}
      </CardContent>
    </Card>
  );
}
