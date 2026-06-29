import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Leaf } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset password — Ghana Journal of Forestry" }] }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase parses the recovery token from the URL hash automatically.
    // Wait for the SIGNED_IN/PASSWORD_RECOVERY event before letting the user submit.
    supabase.auth.getSession().then(({ data }) => setReady(!!data.session));
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Password updated");
    navigate({ to: "/author" });
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background p-6">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-card">
        <div className="mb-6 flex items-center gap-2.5 text-primary">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-primary/10"><Leaf className="h-5 w-5" /></span>
          <div className="leading-tight">
            <div className="font-serif text-base font-semibold text-foreground">Ghana Journal of Forestry</div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Reset password</div>
          </div>
        </div>
        {!ready ? (
          <p className="text-sm text-muted-foreground">Open the reset link from your email to continue. If this page does not progress, your link may have expired — request a new one from the sign-in page.</p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="password">New password</Label>
              <Input id="password" type="password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>{busy ? "Updating…" : "Update password"}</Button>
          </form>
        )}
      </div>
    </div>
  );
}
