import { createFileRoute } from "@tanstack/react-router";
import { AccountActions } from "@/components/account-actions";

export const Route = createFileRoute("/secretary/profile")({
  head: () => ({ meta: [{ title: "Profile — Editorial Secretary" }] }),
  component: SecretaryProfile,
});

function SecretaryProfile() {
  return (
    <div>
      <h1 className="font-serif text-2xl text-foreground">Editorial Secretary profile</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage your session and account.</p>
      <AccountActions />
    </div>
  );
}
