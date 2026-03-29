import { cn } from "~/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
}

export default function Badge({
  children,
  color,
  className = "",
}: BadgeProps) {
  // If a specific color is passed, use it with opacity for bg/border
  // Otherwise use theme-aware defaults
  if (color) {
    return (
      <span
        className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-medium", className)}
        style={{
          backgroundColor: `${color}15`,
          color: color,
          border: `1px solid ${color}25`,
        }}
      >
        {children}
      </span>
    );
  }

  return (
    <span
      className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-medium bg-ink/5 text-ink-muted border border-border", className)}
    >
      {children}
    </span>
  );
}
