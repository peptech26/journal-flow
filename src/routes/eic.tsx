import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { LayoutDashboard, Gavel, Inbox, ShieldAlert, BarChart3, Settings2, UserCheck } from "lucide-react";

export const Route = createFileRoute("/eic")({
  component: EicLayout,
});

const tabs: { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }[] = [
  { to: "/eic", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/eic/decisions", label: "Decisions", icon: Gavel },
  { to: "/eic/triage", label: "Triage", icon: Inbox },
  { to: "/eic/conflicts", label: "Conflicts", icon: ShieldAlert },
  { to: "/eic/performance", label: "Performance", icon: BarChart3 },
  { to: "/eic/policies", label: "Policies", icon: Settings2 },
  { to: "/eic/delegates", label: "Delegates", icon: UserCheck },
];

function EicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-secondary/20">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-2">
          <h1 className="font-serif text-2xl text-foreground">Editor-in-Chief</h1>
          <p className="text-sm text-muted-foreground">Strategic oversight, final decisions and journal policy.</p>
        </div>
        <div className="my-5 flex flex-wrap items-center gap-2 text-sm">
          {tabs.map((t) => (
            <Link
              key={t.to}
              to={t.to as string}
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
