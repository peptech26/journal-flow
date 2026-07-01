import { useEffect, useMemo, useState } from "react";
import { Bell } from "lucide-react";
import { useWorkflow, STATUS_LABEL, type WorkflowManuscript } from "@/lib/workflow-store";
import { useCurrentUser, type Role } from "@/lib/current-user";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function itemsForRole(list: WorkflowManuscript[], role: Role, uid: string): WorkflowManuscript[] {
  switch (role) {
    case "author":
      return list.filter((m) => m.authorId === uid);
    case "secretary":
      return list.filter((m) =>
        ["submitted", "resubmitted", "reviews_complete", "approved_for_publication"].includes(m.status),
      );
    case "reviewer":
      return list.filter(
        (m) => m.status === "under_review" && m.assignments.some((a) => a.reviewerId === uid && !a.completed),
      );
    case "eic":
      return list.filter((m) => ["with_eic", "approved_for_publication"].includes(m.status));
  }
}

export function NotificationBell() {
  const list = useWorkflow();
  const user = useCurrentUser();
  const storageKey = `gjf:notif-seen:${user.role}:${user.id}`;
  const [seenAt, setSeenAt] = useState<number>(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(storageKey);
    setSeenAt(raw ? Number(raw) : 0);
  }, [storageKey]);

  const relevant = useMemo(() => itemsForRole(list, user.role, user.id), [list, user.role, user.id]);
  const unread = relevant.filter((m) => new Date(m.updatedAt).getTime() > seenAt);

  const markSeen = () => {
    const now = Date.now();
    setSeenAt(now);
    if (typeof window !== "undefined") localStorage.setItem(storageKey, String(now));
  };

  return (
    <DropdownMenu onOpenChange={(o) => { if (!o) markSeen(); }}>
      <DropdownMenuTrigger asChild>
        <button
          className="relative grid h-9 w-9 place-items-center rounded-md text-foreground/70 hover:bg-muted hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unread.length > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
              {unread.length}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          <span className="text-xs font-normal text-muted-foreground">{user.role}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {relevant.length === 0 && (
          <div className="px-3 py-4 text-xs text-muted-foreground">Nothing needs your attention.</div>
        )}
        {relevant.slice(0, 8).map((m) => {
          const isNew = new Date(m.updatedAt).getTime() > seenAt;
          return (
            <DropdownMenuItem key={m.id} className="flex flex-col items-start gap-0.5">
              <div className="flex w-full items-center justify-between gap-2">
                <span className="line-clamp-1 text-sm font-medium">{m.title}</span>
                {isNew && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
              </div>
              <span className="text-[11px] text-muted-foreground">
                {STATUS_LABEL[m.status]} · {new Date(m.updatedAt).toLocaleString()}
              </span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
