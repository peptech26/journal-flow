import { useState } from "react";
import { LogOut, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { deleteOwnAccount } from "@/lib/account.functions";

export function AccountActions() {
  const navigate = useNavigate();
  const deleteAccount = useServerFn(deleteOwnAccount);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) return toast.error(error.message);
    toast.success("Signed out");
    navigate({ to: "/auth" });
  }

  async function handleDelete() {
    setBusy(true);
    try {
      await deleteAccount();
      await supabase.auth.signOut();
      toast.success("Account deleted");
      navigate({ to: "/" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete account");
    } finally {
      setBusy(false);
      setOpen(false);
    }
  }

  return (
    <div className="mt-8 rounded-2xl border border-destructive/30 bg-card p-6 shadow-card">
      <h2 className="font-serif text-lg text-foreground">Account</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Sign out of this device, or permanently delete your account and all associated data.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-1.5 h-4 w-4" /> Log out
        </Button>
        <Button variant="destructive" onClick={() => setOpen(true)}>
          <Trash2 className="mr-1.5 h-4 w-4" /> Delete account
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription>
              This permanently removes your account and profile from Supabase. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={busy}>
              {busy ? "Deleting…" : "Yes, delete forever"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
