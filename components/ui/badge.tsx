import * as React from "react";

import { cn } from "@/lib/utils";

export type BadgeVariant = "default" | "secondary" | "outline" | "success";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        variant === "default" &&
          "border-zinc-200 bg-zinc-900 text-zinc-50 dark:border-zinc-800 dark:bg-zinc-50 dark:text-zinc-900",
        variant === "secondary" &&
          "border-zinc-200 bg-zinc-100 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50",
        variant === "outline" &&
          "border-zinc-200 bg-transparent text-zinc-900 dark:border-zinc-800 dark:text-zinc-50",
        variant === "success" &&
          "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200",
        className,
      )}
      {...props}
    />
  );
}


