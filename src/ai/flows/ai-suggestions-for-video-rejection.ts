'use server';

/**
 * @fileOverview This file defines a Genkit flow that provides suggestions to athletes
 * on how to improve their video recordings for the Khelo India AI app.
 *
 * - provideVideoRejectionSuggestions - A function that takes video analysis results and returns suggestions for improvement.
 * - VideoRejectionSuggestionsInput - The input type for the provideVideoRejectionSuggestions function.
 * - VideoRejectionSuggestionsOutput - The return type for the provideVideoRejectionSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VideoRejectionSuggestionsInputSchema = z.object({
  videoAnalysisResults: z
    .string()
    .describe(
      'The results of the AI video analysis, indicating reasons for rejection.'
    ),
});
export type VideoRejectionSuggestionsInput = z.infer<
  typeof VideoRejectionSuggestionsInputSchema
>;

const VideoRejectionSuggestionsOutputSchema = z.object({
  suggestions: z
    .string()
    .describe(
      'Specific suggestions for the athlete to improve their next video recording.'
    ),
});
export type VideoRejectionSuggestionsOutput = z.infer<
  typeof VideoRejectionSuggestionsOutputSchema
>;

export async function provideVideoRejectionSuggestions(
  input: VideoRejectionSuggestionsInput
): Promise<VideoRejectionSuggestionsOutput> {
  return videoRejectionSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'videoRejectionSuggestionsPrompt',
  input: {schema: VideoRejectionSuggestionsInputSchema},
  output: {schema: VideoRejectionSuggestionsOutputSchema},
  prompt: `You are an AI assistant providing feedback to athletes on their video recordings.

  Based on the video analysis results, provide specific and actionable suggestions to the athlete on how to improve their next recording.

  Video Analysis Results: {{{videoAnalysisResults}}}

  Suggestions:`,
});

const videoRejectionSuggestionsFlow = ai.defineFlow(
  {
    name: 'videoRejectionSuggestionsFlow',
    inputSchema: VideoRejectionSuggestionsInputSchema,
    outputSchema: VideoRejectionSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
