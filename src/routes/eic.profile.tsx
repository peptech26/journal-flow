import { createFileRoute } from "@tanstack/react-router";
import { AccountActions } from "@/components/account-actions";

export const Route = createFileRoute("/eic/profile")({
  head: () => ({ meta: [{ title: "Profile — Editor-in-Chief" }] }),
  component: EicProfile,
});

function EicProfile() {
  return (
    <div>
      <h1 className="font-serif text-2xl text-foreground">Editor-in-Chief profile</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage your session and account.</p>
      <AccountActions />
    </div>
  );
}
