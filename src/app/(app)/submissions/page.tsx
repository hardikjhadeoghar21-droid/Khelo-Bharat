import SubmissionsClient from "@/components/submissions/submissions-client";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function SubmissionsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground/90">Review Submissions</h1>
                <p className="text-muted-foreground">Review and validate test submissions from athletes.</p>
            </div>
            <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                <SubmissionsClient />
            </Suspense>
        </div>
    );
}
