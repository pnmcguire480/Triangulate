import { cn } from "~/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...props
}: ButtonProps) {
  const base = "inline-flex items-center justify-center font-medium rounded-sm transition-all duration-200 focus-visible:ring-2 focus-visible:ring-brand-green/50 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none";

  const variants = {
    primary: "bg-ink text-paper hover:bg-ink-light",
    secondary: "bg-surface text-ink border border-border-strong hover:border-ink/30 hover:bg-ink/5",
    ghost: "text-ink-muted hover:text-ink hover:bg-ink/5",
  };

  const sizes = {
    sm: "text-xs px-3 py-1.5",
    md: "text-sm px-4 py-2",
    lg: "text-base px-6 py-3",
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
