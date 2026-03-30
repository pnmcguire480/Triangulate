import { cn } from "~/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({
  children,
  className = "",
  hover = false,
}: CardProps) {
  return (
    <div
      className={cn(
        "bg-surface rounded-sm border border-border",
        hover && "hover:border-border-strong transition-all duration-200 cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}
