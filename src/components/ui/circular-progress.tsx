"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface CircularProgressProps extends React.SVGProps<SVGSVGElement> {
  value: number;
  strokeWidth?: number;
}

export const CircularProgress = React.forwardRef<
  SVGSVGElement,
  CircularProgressProps
>(({ className, value, strokeWidth = 10, ...props }, ref) => {
  const radius = 50 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg
      ref={ref}
      width="100"
      height="100"
      viewBox="0 0 100 100"
      className={cn("transform -rotate-90", className)}
      {...props}
    >
      <circle
        cx="50"
        cy="50"
        r={radius}
        stroke="hsl(var(--border))"
        strokeWidth={strokeWidth}
        fill="transparent"
        className="text-muted"
      />
      <circle
        cx="50"
        cy="50"
        r={radius}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        fill="transparent"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-500"
      />
    </svg>
  );
});
CircularProgress.displayName = "CircularProgress";
