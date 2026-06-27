import { STATUS_META, type ManuscriptStatus } from "@/lib/mock-manuscripts";
import { cn } from "@/lib/utils";

export function StatusBadge({ status, className }: { status: ManuscriptStatus; className?: string }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        meta.tone,
        className,
      )}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {meta.label}
    </span>
  );
}
