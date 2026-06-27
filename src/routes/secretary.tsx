import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { LayoutDashboard, Users, BellRing, ShieldAlert, BarChart3, Inbox } from "lucide-react";

export const Route = createFileRoute("/secretary")({
  component: SecretaryLayout,
});

const tabs = [
  { to: "/secretary", label: "Triage", icon: LayoutDashboard, exact: true },
  { to: "/secretary/reviewers", label: "Reviewers", icon: Users },
  { to: "/secretary/reminders", label: "Reminders", icon: BellRing },
  { to: "/secretary/plagiarism", label: "Plagiarism", icon: ShieldAlert },
  { to: "/secretary/stats", label: "Statistics", icon: BarChart3 },
  { to: "/secretary/communications", label: "Comms hub", icon: Inbox },
] as const;

function SecretaryLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-secondary/20">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-2">
          <h1 className="font-serif text-2xl text-foreground">Editorial Secretary</h1>
          <p className="text-sm text-muted-foreground">Operations console for triage, reviewers, reminders and communications.</p>
        </div>
        <div className="my-5 flex flex-wrap items-center gap-2 text-sm">
          {tabs.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              activeOptions={t.exact ? { exact: true } : undefined}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-muted-foreground hover:text-foreground"
              activeProps={{ className: "border-primary/40 bg-primary/5 text-foreground" }}
            >
              <t.icon className="h-3.5 w-3.5" /> {t.label}
            </Link>
          ))}
        </div>
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
