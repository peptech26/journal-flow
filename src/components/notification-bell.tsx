import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { useNotifications, markAllNotificationsRead, markNotificationRead } from "@/lib/notifications-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function NotificationBell() {
  const { items, unreadCount } = useNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="relative grid h-9 w-9 place-items-center rounded-md text-foreground/70 hover:bg-muted hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
              {unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <button
              onClick={(e) => { e.preventDefault(); markAllNotificationsRead(); }}
              className="text-[11px] font-normal text-muted-foreground hover:text-foreground"
            >
              Mark all read
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.length === 0 && (
          <div className="px-3 py-4 text-xs text-muted-foreground">You're all caught up.</div>
        )}
        {items.slice(0, 8).map((n) => (
          <DropdownMenuItem key={n.id} asChild>
            <Link
              to={n.link ?? "/notifications"}
              onClick={() => { if (!n.read_at) markNotificationRead(n.id); }}
              className="flex flex-col items-start gap-0.5"
            >
              <div className="flex w-full items-center justify-between gap-2">
                <span className="line-clamp-1 text-sm font-medium">{n.title}</span>
                {!n.read_at && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
              </div>
              {n.body && <span className="line-clamp-2 text-[11px] text-muted-foreground">{n.body}</span>}
              <span className="text-[10px] text-muted-foreground">{new Date(n.created_at).toLocaleString()}</span>
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/notifications" className="text-xs text-primary">View all notifications →</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
