import { cn } from "@/lib/utils";
import { timeAgo, getConfidenceLevel } from "@/lib/timeAgo";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface AvailabilityBadgeProps {
  lastConfirmedAt: string;
  availableUnits: number;
  totalUnits: number;
  size?: "sm" | "md";
  showConfidence?: boolean;
}

export default function AvailabilityBadge({
  lastConfirmedAt,
  availableUnits,
  totalUnits,
  size = "md",
  showConfidence = true,
}: AvailabilityBadgeProps) {
  const level = getConfidenceLevel(lastConfirmedAt);
  const ago = timeAgo(lastConfirmedAt);

  if (availableUnits === 0) {
    return (
      <span className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1",
        "bg-red-100 text-red-700"
      )}>
        <AlertCircle className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />
        Unavailable
      </span>
    );
  }

  const colors = {
    high: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    medium: "bg-amber-50 text-amber-700 border border-amber-200",
    low: "bg-orange-50 text-orange-700 border border-orange-200",
  };

  const icons = {
    high: <CheckCircle2 className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />,
    medium: <Clock className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />,
    low: <AlertCircle className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />,
  };

  const labels = {
    high: "Available",
    medium: "Available",
    low: "Available",
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1",
        colors[level]
      )}>
        {icons[level]}
        {labels[level]}
        {totalUnits > 1 && ` · ${availableUnits}/${totalUnits} units`}
      </span>
      {showConfidence && (
        <span className={cn(
          "text-[hsl(var(--text-muted))]",
          size === "sm" ? "text-xs" : "text-xs"
        )}>
          Confirmed {ago}
        </span>
      )}
    </div>
  );
}
