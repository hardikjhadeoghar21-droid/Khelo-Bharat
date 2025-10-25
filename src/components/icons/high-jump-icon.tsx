import { cn } from "@/lib/utils";
import type { SVGProps } from "react";

export function HighJumpIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M12 2v8" />
      <path d="M12 2l-3 3" />
      <path d="M12 2l3 3" />
      <path d="M12 10l-4 4" />
      <path d="M12 10l4 4" />
      <path d="M5 22h14" />
      <path d="M8 18l-3-3" />
      <path d="M16 18l3-3" />
    </svg>
  );
}
