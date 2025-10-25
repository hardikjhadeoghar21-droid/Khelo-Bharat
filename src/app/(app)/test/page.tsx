import ExerciseCard from '@/components/test/exercise-card';
import { HighJumpIcon } from '@/components/icons/high-jump-icon';
import { SitUpIcon } from '@/components/icons/sit-up-icon';

export default function TestSelectionPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground/90">Choose Your Test</h1>
        <p className="text-muted-foreground">Select an exercise to begin your assessment.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 max-w-4xl">
        <ExerciseCard
          href="/test/high-jump"
          title="High Jump"
          description="Test your vertical leap and agility. Follow the on-screen instructions for a valid attempt."
          icon={HighJumpIcon}
        />
        <ExerciseCard
          href="/test/sit-ups"
          title="Sit-ups"
          description="Test your core strength and endurance. Perform as many valid reps as you can."
          icon={SitUpIcon}
        />
      </div>
    </div>
  );
}
