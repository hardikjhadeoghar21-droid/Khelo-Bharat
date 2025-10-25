
/**
 * @fileOverview Shared types and schemas for the leaderboard functionality.
 */
import { z } from 'zod';

// Note: This is a simplified definition. In a real app, you'd share this from your main types.
export const UserProfileSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    role: z.string(),
    avatar: z.string(),
    age: z.number().optional(),
    height: z.number().optional(),
    weight: z.number().optional(),
    gender: z.string().optional(),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

export const LeaderboardEntrySchema = z.object({
  rank: z.number(),
  athlete: UserProfileSchema,
  score: z.number(),
  age: z.number(),
  height: z.number(),
  weight: z.number(),
  gender: z.enum(['Male', 'Female']),
  lastTest: z.string(),
  totalTests: z.number(),
});

export type LeaderboardEntry = z.infer<typeof LeaderboardEntrySchema>;

export const LeaderboardOutputSchema = z.object({
  leaderboard: z.array(LeaderboardEntrySchema),
  rankMap: z.record(z.string(), z.number()), // maps userId to rank
});

export type LeaderboardData = z.infer<typeof LeaderboardOutputSchema>;
