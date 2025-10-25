import { cn } from "@/lib/utils";
import type { SVGProps } from "react";

export function SitUpIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      className={cn("h-6 w-6", props.className)}
    >
      <path d="M2 12h2.5a2.5 2.5 0 0 1 0 5H2" />
      <path d="M22 12h-2.5a2.5 2.5 0 0 0 0 5H22" />
      <path d="M12 2a4 4 0 0 0-4 4v2" />
      <path d="M16 6a4 4 0 0 0-4-4" />
      <path d="M12 10v4" />
      <path d="M12 14a4 4 0 0 0-4 4v2" />
      <path d="M16 18a4 4 0 0 0-4-4" />
    </svg>
  );
}
