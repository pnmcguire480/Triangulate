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
  const base = "inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-navy/20";

  const variants = {
    primary: "bg-brand-navy text-brand-warm hover:bg-brand-accent",
    secondary: "bg-white text-brand-navy border border-brand-navy/15 hover:border-brand-navy/30 hover:bg-brand-navy/5",
    ghost: "text-brand-navy/60 hover:text-brand-navy hover:bg-brand-navy/5",
  };

  const sizes = {
    sm: "text-xs px-3 py-1.5",
    md: "text-sm px-4 py-2",
    lg: "text-base px-6 py-3",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
