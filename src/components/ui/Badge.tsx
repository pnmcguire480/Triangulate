interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
}

export default function Badge({
  children,
  color = "#1A1A2E",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${className}`}
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
