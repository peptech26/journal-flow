import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-header";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Ghana Journal of Forestry" },
      { name: "description", content: "Contact the editorial office of the Ghana Journal of Forestry." },
      { property: "og:title", content: "Contact — Ghana Journal of Forestry" },
      { property: "og:description", content: "Get in touch with the editorial office." },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Contact</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold text-foreground">Editorial office</h1>
        <p className="mt-4 text-muted-foreground">
          For questions about submissions, peer review or the journal more broadly, please reach out.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-5 shadow-card">
            <Mail className="h-5 w-5 text-primary" />
            <h3 className="mt-3 font-serif text-lg font-semibold">Email</h3>
            <p className="mt-1 text-sm text-muted-foreground">editorial@gjf.example.org</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5 shadow-card">
            <MapPin className="h-5 w-5 text-primary" />
            <h3 className="mt-3 font-serif text-lg font-semibold">Office</h3>
            <p className="mt-1 text-sm text-muted-foreground">Forestry Commission, Accra, Ghana</p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
