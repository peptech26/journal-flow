import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Notification = {
  id: string;
  user_id: string;
  manuscript_id: string | null;
  kind: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

export function useNotifications() {
  const [items, setItems] = useState<Notification[]>([]);
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      const id = userData.user?.id ?? null;
      if (cancelled) return;
      setUid(id);
      if (!id) { setItems([]); return; }
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (!cancelled) setItems((data ?? []) as Notification[]);
    }
    load();

    const channel = supabase
      .channel(`gjf-notifications-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, load)
      .subscribe();

    const { data: sub } = supabase.auth.onAuthStateChange(() => load());

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
      sub.subscription.unsubscribe();
    };
  }, []);

  return { items, unreadCount: items.filter((n) => !n.read_at).length, uid };
}

export async function markNotificationRead(id: string) {
  await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
}

export async function markAllNotificationsRead() {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) return;
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", uid)
    .is("read_at", null);
}
