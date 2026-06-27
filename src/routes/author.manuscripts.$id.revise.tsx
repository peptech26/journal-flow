import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ArrowLeft, Upload, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getManuscript } from "@/lib/mock-manuscripts";

export const Route = createFileRoute("/author/manuscripts/$id/revise")({
  loader: ({ params }) => {
    const m = getManuscript(params.id);
    if (!m) throw notFound();
    return m;
  },
  notFoundComponent: () => <p>Manuscript not found.</p>,
  errorComponent: ({ error }) => <p className="text-destructive">{error.message}</p>,
  component: RevisePage,
});

function RevisePage() {
  const m = Route.useLoaderData();
  const nav = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [highlight, setHighlight] = useState<"track" | "colored">("track");
  const [responses, setResponses] = useState<Record<string, string>>({});

  return (
    <div>
      <Link to="/author/manuscripts/$id" params={{ id: m.id }} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to manuscript
      </Link>
      <h1 className="mt-3 font-serif text-3xl font-semibold">Upload revision</h1>
      <p className="mt-1 text-sm text-muted-foreground">{m.title}</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <Label>Point-by-point response letter</Label>
            <p className="mt-1 text-xs text-muted-foreground">Address each reviewer comment in turn.</p>
            <div className="mt-4 space-y-4">
              {m.reviews.map((r) => (
                <div key={r.id} className="rounded-xl border border-border p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">{r.reviewer}</p>
                  <p className="mt-1.5 text-sm italic text-muted-foreground">"{r.comment}"</p>
                  <Textarea
                    rows={3}
                    placeholder="Your response…"
                    className="mt-3"
                    value={responses[r.id] || ""}
                    onChange={(e) => setResponses({ ...responses, [r.id]: e.target.value })}
                  />
                </div>
              ))}
              {m.reviews.length === 0 && <p className="text-sm text-muted-foreground">No reviewer comments to respond to.</p>}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <Label>Revised manuscript file</Label>
            <div
              onClick={() => fileRef.current?.click()}
              className="mt-3 cursor-pointer rounded-xl border-2 border-dashed border-border bg-secondary/30 p-6 text-center hover:bg-secondary/60"
            >
              <Upload className="mx-auto h-6 w-6 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium">{file ? file.name : "Click to upload"}</p>
              <p className="text-xs text-muted-foreground">PDF or DOCX</p>
              <input ref={fileRef} type="file" accept=".pdf,.docx" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <Label>Highlight method</Label>
            <div className="mt-3 space-y-2 text-sm">
              {([["track", "Word track-changes"], ["colored", "Coloured text"]] as const).map(([v, l]) => (
                <label key={v} className="flex items-center gap-2">
                  <input type="radio" name="hl" checked={highlight === v} onChange={() => setHighlight(v)} />
                  {l}
                </label>
              ))}
            </div>
          </div>

          <Button
            className="w-full"
            onClick={() => {
              if (!file) { toast.error("Upload the revised file first"); return; }
              toast.success("Revision submitted to editor");
              nav({ to: "/author/manuscripts/$id", params: { id: m.id } });
            }}
          >
            <Send className="mr-1.5 h-4 w-4" /> Submit revision
          </Button>
        </div>
      </div>
    </div>
  );
}
