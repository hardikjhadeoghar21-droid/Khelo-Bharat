import { cn } from "@/lib/utils";
import type { SVGProps } from "react";

export function DivineBadge(props: SVGProps<SVGSVGElement>) {
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
      
      <g strokeWidth="1.5">
          <path d="M12 1.5 l10 5.5 v11 l-10 5.5 l-10-5.5 v-11Z" stroke="url(#gold-gradient)" />
          <path d="M12 1.5 l-1.5 4 l-4.5 1 l2.5 4 l-1 4.5 l4.5-2.5 l4.5 2.5 l-1-4.5 l2.5-4 l-4.5-1Z" stroke="url(#gold-gradient)" fill="url(#gold-gradient)" />
          <path d="M12 2.5 l1.5-1 l1 1.5 l-2.5 0.5" fill="url(#gold-gradient)" />
          <path d="M12 2.5 l-1.5-1 l-1 1.5 l2.5 0.5" fill="url(#gold-gradient)" />
      </g>
      <path d="M12 3.5l8.66 5v10L12 23.5l-8.66-5v-10L12 3.5z" fill="#2c3e50" fillOpacity="0.8" />
      
      <path d="M12 12.5 l2.35 1.5 l-0.9-2.75 l2.3-1.6h-2.85L12 7.5l-0.9 2.15H8.25l2.3 1.6 l-0.9 2.75Z" fill="#FFD700" transform="translate(0, 3) scale(0.6)"/>
      <path d="M5 14 C 5 10, 19 10, 19 14" stroke="url(#gold-gradient)" fill="none" strokeWidth="1.5" />
      <path d="M8 18 L 6 15" stroke="url(#gold-gradient)" fill="none" strokeWidth="1.5" />
      <path d="M16 18 L 18 15" stroke="url(#gold-gradient)" fill="none" strokeWidth="1.5" />

    </svg>
  );
}
