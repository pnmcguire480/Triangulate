import Badge from "@/components/ui/Badge";
import { TrustSignal, TRUST_SIGNAL_CONFIG } from "@/types";

interface TrustSignalBadgeProps {
  signal: TrustSignal;
  size?: "sm" | "md";
}

export default function TrustSignalBadge({
  signal,
  size = "md",
}: TrustSignalBadgeProps) {
  const config = TRUST_SIGNAL_CONFIG[signal];

  return (
    <Badge color={config.color} className={size === "sm" ? "text-[10px] px-2 py-0.5" : ""}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </Badge>
  );
}

interface TrustSignalStackProps {
  signals: TrustSignal[];
  size?: "sm" | "md";
}

export function TrustSignalStack({
  signals,
  size = "md",
}: TrustSignalStackProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {signals.map((signal) => (
        <TrustSignalBadge key={signal} signal={signal} size={size} />
      ))}
    </div>
  );
}
