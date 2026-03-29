import { AlertCircle, AlertTriangle, CheckCircle, FileCheck, ShieldCheck } from "lucide-react";
import Badge from "~/components/ui/Badge";
import { TrustSignal, TRUST_SIGNAL_CONFIG } from "~/types";

const SIGNAL_ICONS: Record<string, React.ComponentType<any>> = {
  SINGLE_SOURCE: AlertCircle,
  CONTESTED: AlertTriangle,
  CONVERGED: CheckCircle,
  SOURCE_BACKED: FileCheck,
  INSTITUTIONALLY_VALIDATED: ShieldCheck,
};

interface TrustSignalBadgeProps {
  signal: TrustSignal;
  size?: "sm" | "md";
}

export default function TrustSignalBadge({
  signal,
  size = "md",
}: TrustSignalBadgeProps) {
  const config = TRUST_SIGNAL_CONFIG[signal];
  const Icon = SIGNAL_ICONS[signal];

  return (
    <Badge color={config.color} className={size === "sm" ? "text-[10px] px-2 py-0.5" : ""}>
      {Icon ? <Icon className="w-3.5 h-3.5" /> : null}
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
