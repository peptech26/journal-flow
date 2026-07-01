import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNotifications, markAllNotificationsRead, markNotificationRead } from "@/lib/notifications-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Ghana Journal of Forestry" },
      { name: "description", content: "Your unread notifications and workflow alerts." },
    ],
  }),
  component: NotificationsPage,
});

const KIND_TONE: Record<string, string> = {
  submitted: "bg-blue-100 text-blue-900",
  under_review: "bg-amber-100 text-amber-900",
  revision_requested: "bg-orange-100 text-orange-900",
  reviews_complete: "bg-amber-200 text-amber-900",
  with_eic: "bg-purple-100 text-purple-900",
  galley_proof: "bg-emerald-100 text-emerald-900",
  published: "bg-primary text-primary-foreground",
  rejected: "bg-red-100 text-red-900",
  review_invite: "bg-blue-100 text-blue-900",
  message: "bg-secondary text-secondary-foreground",
};

function NotificationsPage() {
  const { items, unreadCount } = useNotifications();

  async function remove(id: string) {
    const { error } = await supabase.from("notifications").delete().eq("id", id);
    if (error) toast.error(error.message);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 font-serif text-3xl font-semibold">
            <Bell className="h-6 w-6" /> Notifications
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up."}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAllNotificationsRead()}>
            <CheckCheck className="mr-1.5 h-3.5 w-3.5" /> Mark all read
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <Card>
          <CardHeader><CardTitle className="font-serif text-base">Nothing yet</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Workflow events (submissions, reviews, decisions, messages) will appear here.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <div
              key={n.id}
              className={`flex items-start justify-between gap-4 rounded-lg border border-border bg-card p-4 ${!n.read_at ? "ring-1 ring-primary/20" : ""}`}
            >
              <Link
                to={n.link ?? "/notifications"}
                onClick={() => { if (!n.read_at) markNotificationRead(n.id); }}
                className="min-w-0 flex-1"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className={`${KIND_TONE[n.kind] ?? "bg-muted"} border-transparent font-normal`}>
                    {n.kind.replace(/_/g, " ")}
                  </Badge>
                  {!n.read_at && <span className="h-2 w-2 rounded-full bg-primary" />}
                  <span className="text-[11px] text-muted-foreground">{new Date(n.created_at).toLocaleString()}</span>
                </div>
                <p className="mt-1 font-medium">{n.title}</p>
                {n.body && <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>}
              </Link>
              <button
                onClick={() => remove(n.id)}
                className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Dismiss"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
