import Link from "next/link";
import { cn } from "@/lib/utils";
import { Compass } from "lucide-react";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5", className)}>
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20">
        <Compass className="h-5 w-5 text-primary" />
      </div>
      <span className="text-lg font-semibold tracking-tight text-foreground font-headline">
        Clarity Compass
      </span>
    </Link>
  );
}
