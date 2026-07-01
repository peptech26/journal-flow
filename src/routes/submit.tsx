import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/submit")({
  head: () => ({
    meta: [
      { title: "Submit a manuscript — Ghana Journal of Forestry" },
      { name: "description", content: "Create an author account to submit a manuscript to the Ghana Journal of Forestry." },
    ],
  }),
  component: Submit,
});

function Submit() {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (cancelled) return;
      if (data.user) {
        navigate({ to: "/author/submit", replace: true });
      } else {
        navigate({ to: "/auth", search: { next: "/author/submit" } as never, replace: true });
      }
    })();
    return () => { cancelled = true; };
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-sm text-muted-foreground">Redirecting to sign up…</p>
      </main>
      <SiteFooter />
    </div>
  );
}
