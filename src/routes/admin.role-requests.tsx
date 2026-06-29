// Admin page: review pending role requests for Editorial Secretary / Editor-in-Chief.
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { SiteHeader, SiteFooter } from "@/components/site-header";

export const Route = createFileRoute("/admin/role-requests")({
  head: () => ({ meta: [{ title: "Role requests — Admin" }] }),
  component: AdminRoleRequests,
});

type Req = {
  id: string;
  user_id: string;
  requested_role: string;
  status: "pending" | "approved" | "rejected";
  justification: string | null;
  review_notes: string | null;
  created_at: string;
  profile?: { full_name: string | null; email: string | null };
};

type Hist = {
  id: string;
  request_id: string;
  action: string;
  from_status: string | null;
  to_status: string | null;
  notes: string | null;
  created_at: string;
};

function AdminRoleRequests() {
  const [requests, setRequests] = useState<Req[]>([]);
  const [history, setHistory] = useState<Record<string, Hist[]>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});

  async function load() {
    const { data } = await supabase
      .from("role_requests")
      .select("id,user_id,requested_role,status,justification,review_notes,created_at")
      .order("created_at", { ascending: false });
    const rows = (data ?? []) as Omit<Req, "profile">[];
    if (rows.length) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id,full_name,email")
        .in("id", rows.map((r) => r.user_id));
      const byId = new Map((profiles ?? []).map((p) => [p.id, p]));
      setRequests(rows.map((r) => ({ ...r, profile: byId.get(r.user_id) ?? undefined })));
      const { data: h } = await supabase
        .from("role_request_history")
        .select("id,request_id,action,from_status,to_status,notes,created_at")
        .in("request_id", rows.map((r) => r.id))
        .order("created_at", { ascending: true });
      const grouped: Record<string, Hist[]> = {};
      (h ?? []).forEach((row) => {
        grouped[row.request_id] = grouped[row.request_id] ?? [];
        grouped[row.request_id].push(row as Hist);
      });
      setHistory(grouped);
    } else {
      setRequests([]);
    }
  }
  useEffect(() => { load(); }, []);

  async function decide(r: Req, decision: "approved" | "rejected") {
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("role_requests")
      .update({
        status: decision,
        review_notes: notes[r.id] ?? null,
        reviewed_by: userData.user?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", r.id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Request ${decision}`);
    load();
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl font-semibold text-foreground">Role requests</h1>
        <p className="mt-1 text-sm text-muted-foreground">Approve or reject editorial-staff requests. Each decision is appended to the request history.</p>

        <div className="mt-8 space-y-4">
          {requests.length === 0 && (
            <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No role requests yet.</CardContent></Card>
          )}
          {requests.map((r) => {
            const profile = Array.isArray(r.user) ? r.user[0] : r.user;
            return (
              <Card key={r.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-3">
                  <div>
                    <CardTitle className="font-serif text-base">
                      {profile?.full_name ?? "Unnamed user"} — <span className="text-primary">{r.requested_role.replace("_", " ")}</span>
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">{profile?.email} · requested {new Date(r.created_at).toLocaleString()}</p>
                  </div>
                  <Badge variant="outline" className={r.status === "pending" ? "bg-amber-100 text-amber-900" : r.status === "approved" ? "bg-emerald-100 text-emerald-900" : "bg-red-100 text-red-900"}>
                    {r.status}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  {r.justification && <p className="rounded-md bg-muted/50 p-3 text-sm">{r.justification}</p>}

                  {r.status === "pending" && (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Notes for the requester (optional)"
                        value={notes[r.id] ?? ""}
                        onChange={(e) => setNotes((n) => ({ ...n, [r.id]: e.target.value }))}
                        rows={2}
                      />
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" className="text-red-700" onClick={() => decide(r, "rejected")}>Reject</Button>
                        <Button onClick={() => decide(r, "approved")}>Approve</Button>
                      </div>
                    </div>
                  )}

                  {(history[r.id] ?? []).length > 0 && (
                    <details className="rounded-md border border-border bg-muted/30 p-3 text-xs">
                      <summary className="cursor-pointer font-medium text-foreground">History ({history[r.id].length})</summary>
                      <ol className="mt-2 space-y-1.5 border-l border-border pl-3">
                        {history[r.id].map((h) => (
                          <li key={h.id}>
                            <span className="text-foreground">{h.action}</span>
                            {h.from_status && <span className="text-muted-foreground"> · {h.from_status} → {h.to_status}</span>}
                            <span className="text-muted-foreground"> · {new Date(h.created_at).toLocaleString()}</span>
                            {h.notes && <div className="mt-0.5 rounded bg-card px-2 py-1">{h.notes}</div>}
                          </li>
                        ))}
                      </ol>
                    </details>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
