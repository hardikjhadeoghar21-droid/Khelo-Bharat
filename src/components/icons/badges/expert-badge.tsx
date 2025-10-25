import { cn } from "@/lib/utils";
import type { SVGProps } from "react";

export function ExpertBadge(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      className={cn("h-8 w-8", props.className)}
    >
      <defs>
        <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#FFA500" />
        </linearGradient>
      </defs>
      <path
        d="M12 2.5l8.66 5v10L12 22.5l-8.66-5v-10L12 2.5z"
        stroke="url(#gold-gradient)"
        strokeWidth="2"
      />
      <path d="M12 2.5l8.66 5v10L12 22.5l-8.66-5v-10L12 2.5z" fill="#2c3e50" fillOpacity="0.8" />
      <path d="m8 10 4-4 4 4" stroke="#FFD700" strokeWidth="2"/>
      <path d="m8 14 4-4 4 4" stroke="#FFD700" strokeWidth="2"/>
      <path d="m8 18 4-4 4 4" stroke="#FFD700" strokeWidth="2"/>
    </svg>
  );
}
