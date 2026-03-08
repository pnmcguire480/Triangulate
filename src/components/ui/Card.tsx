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
      className={`bg-white rounded-lg border border-brand-navy/8 shadow-sm ${
        hover
          ? "hover:shadow-md hover:border-brand-navy/15 transition-all duration-200 cursor-pointer"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
