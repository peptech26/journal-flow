import { createFileRoute, Link } from "@tanstack/react-router";
import { mockInvitations, ANONYMITY_META } from "@/lib/mock-reviewer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/reviewer/invitations/")({
  component: InvitationsList,
});

function InvitationsList() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Invitations</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Accept, decline, or suggest an alternate reviewer.
        </p>
      </header>
      <div className="grid gap-3">
        {mockInvitations.map((inv) => (
          <Card key={inv.id}>
            <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-secondary px-2 py-0.5 font-medium">
                    {ANONYMITY_META[inv.anonymity].label}
                  </span>
                  <span className="text-muted-foreground">Editor: {inv.editor}</span>
                  <span className="text-muted-foreground">
                    Respond by {new Date(inv.respondBy).toLocaleDateString()}
                  </span>
                </div>
                <Link
                  to="/reviewer/invitations/$id"
                  params={{ id: inv.id }}
                  className="block font-serif text-lg leading-snug hover:text-primary"
                >
                  {inv.title}
                </Link>
                <p className="max-w-prose text-sm text-muted-foreground">{inv.abstract}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {inv.keywords.map((k) => (
                    <span key={k} className="rounded-full bg-secondary px-2 py-0.5 text-xs">
                      {k}
                    </span>
                  ))}
                </div>
              </div>
              <Button asChild size="sm">
                <Link to="/reviewer/invitations/$id" params={{ id: inv.id }}>
                  Respond
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
