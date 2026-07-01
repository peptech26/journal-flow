import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUser } from "@/lib/current-user";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Msg = {
  id: string;
  manuscript_id: string;
  sender_id: string;
  sender_name: string | null;
  sender_role: string | null;
  body: string;
  created_at: string;
};

const ROLE_LABEL: Record<string, string> = {
  author: "Author",
  reviewer: "Reviewer",
  editorial_secretary: "Secretary",
  editor_in_chief: "Editor-in-Chief",
  admin: "Admin",
};

export function MessageThread({ manuscriptId }: { manuscriptId: string }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [uid, setUid] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!cancelled) setUid(userData.user?.id ?? null);
    })();

    async function load() {
      const { data } = await supabase
        .from("manuscript_messages")
        .select("*")
        .eq("manuscript_id", manuscriptId)
        .order("created_at", { ascending: true });
      if (!cancelled) setMsgs((data ?? []) as Msg[]);
    }
    load();

    const channel = supabase
      .channel(`thread-${manuscriptId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "manuscript_messages", filter: `manuscript_id=eq.${manuscriptId}` },
        (payload) => setMsgs((prev) => [...prev, payload.new as Msg]),
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [manuscriptId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs.length]);

  async function send() {
    if (!text.trim() || busy) return;
    if (!uid) { toast.error("Sign in to send a message"); return; }
    setBusy(true);
    const me = getCurrentUser();
    const roleMap = { author: "author", reviewer: "reviewer", secretary: "editorial_secretary", eic: "editor_in_chief" } as const;
    const { error } = await supabase.from("manuscript_messages").insert({
      manuscript_id: manuscriptId,
      sender_id: uid,
      sender_name: me.name,
      sender_role: roleMap[me.role],
      body: text.trim(),
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setText("");
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-4 py-2.5 text-sm font-medium">Message thread</div>
      <div className="max-h-96 space-y-3 overflow-y-auto p-4">
        {msgs.length === 0 && (
          <p className="text-xs text-muted-foreground">No messages yet. Start the conversation below.</p>
        )}
        {msgs.map((m) => {
          const mine = m.sender_id === uid;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${mine ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                <div className={`mb-0.5 text-[10px] uppercase tracking-wide ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {m.sender_name ?? "User"} · {ROLE_LABEL[m.sender_role ?? ""] ?? m.sender_role ?? "—"} · {new Date(m.created_at).toLocaleString()}
                </div>
                <div className="whitespace-pre-wrap">{m.body}</div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <div className="flex items-end gap-2 border-t border-border p-3">
        <Textarea
          rows={2}
          placeholder="Write a message to the editorial team…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); send(); } }}
        />
        <Button onClick={send} disabled={busy || !text.trim()} size="sm">
          <Send className="mr-1 h-3.5 w-3.5" /> Send
        </Button>
      </div>
    </div>
  );
}
