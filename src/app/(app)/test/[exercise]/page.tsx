import { VideoSubmission } from '@/components/test/video-submission';
import { HighJumpIcon } from '@/components/icons/high-jump-icon';
import { SitUpIcon } from '@/components/icons/sit-up-icon';
import { Lightbulb } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type ExerciseDetails = {
  title: string;
  Icon: React.ElementType;
  instructions: string[];
};

const exerciseInfo: Record<string, ExerciseDetails> = {
  'high-jump': {
    title: 'High Jump Test',
    Icon: HighJumpIcon,
    instructions: [
      'Ensure the camera is stable and captures your full body.',
      'Perform a single, maximum effort high jump.',
      'Make sure your landing is also visible in the frame.',
      'You have up to 3 attempts to record your best jump.',
    ],
  },
  'sit-ups': {
    title: 'Sit-ups Test',
    Icon: SitUpIcon,
    instructions: [
      'Lie on your back with knees bent and feet flat.',
      'The camera should have a side-view of your body.',
      'Perform as many sit-ups as you can with proper form.',
      'A valid rep involves your back touching the floor and torso reaching your knees.',
    ],
  },
};

export default async function ExercisePage({ params }: { params: { exercise: string } }) {
  const { exercise } = params;
  const details = exerciseInfo[exercise] || exerciseInfo['high-jump'];

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
          <details.Icon className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground/90">{details.title}</h1>
          <p className="text-muted-foreground">Follow the instructions to record and submit your test.</p>
        </div>
      </div>
      
      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertTitle>Instructions</AlertTitle>
        <AlertDescription>
          <ul className="list-disc space-y-1 pl-5">
            {details.instructions.map((inst, i) => (
              <li key={i}>{inst}</li>
            ))}
          </ul>
        </AlertDescription>
      </Alert>

      <VideoSubmission exerciseType={exercise.replace('-', ' ')} />
    </div>
  );
}
