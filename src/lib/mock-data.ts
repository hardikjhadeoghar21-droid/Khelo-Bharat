import type { UserProfile } from '@/hooks/use-auth';

// This file now only contains mock data for badges and daily challenges.
// Leaderboard data is fetched live from Firestore.

export const badges = [
    { name: 'Novice', tier: 1, description: 'Complete your first challenge', icon: 'NoviceBadge' },
    { name: 'Adept', tier: 2, description: 'Complete 5 challenges', icon: 'AdeptBadge' },
    { name: 'Expert', tier: 3, description: 'Complete 15 challenges', icon: 'ExpertBadge' },
    { name: 'Master', tier: 4, description: 'Achieve a score of 950+ in any test', icon: 'MasterBadge' },
    { name: 'Grandmaster', tier: 5, description: 'Hold a top 10 rank on the leaderboard', icon: 'GrandmasterBadge' },
];


export type DailyChallenge = {
  id: string;
  title: string;
  description: string;
  exerciseType: 'sit-ups' | 'high-jump';
  target: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  badge: { name: string, icon: any };
};

export const dailyChallenges: DailyChallenge[] = [
  {
    id: '1',
    title: 'Morning Warm-up',
    description: 'Complete 20 sit-ups to start your day strong.',
    exerciseType: 'sit-ups',
    target: '20 Reps',
    difficulty: 'Easy',
    badge: { name: 'Novice', icon: 'NoviceBadge' },
  },
  {
    id: '2',
    title: 'Core Crusher',
    description: 'Push your limits with 50 sit-ups in 3 minutes.',
    exerciseType: 'sit-ups',
    target: '50 Reps',
    difficulty: 'Medium',
    badge: { name: 'Adept', icon: 'AdeptBadge' },
  },
  {
    id: '3',
    title: 'Vertical Leap',
    description: 'Achieve your best high jump.',
    exerciseType: 'high-jump',
    target: 'Max Height',
    difficulty: 'Hard',
    badge: { name: 'Expert', icon: 'ExpertBadge' },
  },
];
