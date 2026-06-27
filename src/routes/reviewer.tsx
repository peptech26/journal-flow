import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { LayoutDashboard, Inbox, ShieldCheck, UserCog } from "lucide-react";

export const Route = createFileRoute("/reviewer")({
  component: ReviewerLayout,
});

function ReviewerLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-secondary/20">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
          <Link
            to="/reviewer"
            activeOptions={{ exact: true }}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-muted-foreground hover:text-foreground"
            activeProps={{ className: "border-primary/40 bg-primary/5 text-foreground" }}
          >
            <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard
          </Link>
          <Link
            to="/reviewer/invitations"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-muted-foreground hover:text-foreground"
            activeProps={{ className: "border-primary/40 bg-primary/5 text-foreground" }}
          >
            <Inbox className="h-3.5 w-3.5" /> Invitations
          </Link>
          <Link
            to="/reviewer/profile"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-muted-foreground hover:text-foreground"
            activeProps={{ className: "border-primary/40 bg-primary/5 text-foreground" }}
          >
            <UserCog className="h-3.5 w-3.5" /> Profile & CV
          </Link>
          <Link
            to="/reviewer/ethics"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-muted-foreground hover:text-foreground"
            activeProps={{ className: "border-primary/40 bg-primary/5 text-foreground" }}
          >
            <ShieldCheck className="h-3.5 w-3.5" /> Ethics
          </Link>
        </div>
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
