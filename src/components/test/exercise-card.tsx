import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ElementType } from 'react';

interface ExerciseCardProps {
  href: string;
  title: string;
  description: string;
  icon: ElementType<{ className?: string }>;
}

export default function ExerciseCard({ href, title, description, icon: Icon }: ExerciseCardProps) {
  return (
    <Card className="group flex flex-col transition-all hover:border-primary hover:shadow-lg">
      <CardHeader className="flex-1">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-xl font-headline">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <div className="p-6 pt-0">
        <Button asChild variant="ghost" className="p-0 h-auto text-primary">
          <Link href={href}>
            Start Test <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}
