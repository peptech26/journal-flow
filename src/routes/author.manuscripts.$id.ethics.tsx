import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, FileSignature, Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getManuscript } from "@/lib/mock-manuscripts";

export const Route = createFileRoute("/author/manuscripts/$id/ethics")({
  loader: ({ params }) => {
    const m = getManuscript(params.id);
    if (!m) throw notFound();
    return m;
  },
  notFoundComponent: () => <p>Manuscript not found.</p>,
  errorComponent: ({ error }) => <p className="text-destructive">{error.message}</p>,
  component: EthicsPage,
});

type FormKey = "coi" | "data" | "copyright";

const FORMS: { key: FormKey; title: string; template: string }[] = [
  {
    key: "coi",
    title: "Conflict-of-interest disclosure",
    template:
      "I/we declare that there are no financial or personal relationships with other people or organisations that could inappropriately influence the work titled \"{title}\".",
  },
  {
    key: "data",
    title: "Data availability statement",
    template:
      "The data supporting the findings of \"{title}\" are available from the corresponding author upon reasonable request. Public datasets, if any, are deposited at: [repository / DOI].",
  },
  {
    key: "copyright",
    title: "Copyright transfer agreement",
    template:
      "Upon acceptance of \"{title}\" for publication in the Ghana Journal of Forestry, I/we agree to transfer copyright to the journal under its open-access CC-BY 4.0 licence.",
  },
];

function EthicsPage() {
  const m = Route.useLoaderData();
  const [signed, setSigned] = useState<Record<FormKey, string>>({ coi: "", data: "", copyright: "" });

  const sign = (key: FormKey, name: string, body: string) => {
    if (!name.trim()) { toast.error("Type your full name as signature"); return; }
    setSigned((s) => ({ ...s, [key]: name }));
    const blob = new Blob([
      `Ghana Journal of Forestry — ${FORMS.find(f => f.key === key)!.title}\n\nManuscript: ${m.title}\n${m.id}\n\n${body}\n\nSigned: ${name}\nDate: ${new Date().toDateString()}\n`,
    ], { type: "application/pdf" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${m.id}-${key}.pdf`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("Form signed & downloaded");
  };

  return (
    <div>
      <Link to="/author/manuscripts/$id" params={{ id: m.id }} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to manuscript
      </Link>
      <h1 className="mt-3 font-serif text-3xl font-semibold">Publication ethics forms</h1>
      <p className="mt-1 text-sm text-muted-foreground">One-click templates — review, sign, and submit.</p>

      <div className="mt-6 space-y-4">
        {FORMS.map((f) => {
          const body = f.template.replaceAll("{title}", m.title);
          const isSigned = !!signed[f.key];
          return (
            <EthicsCard key={f.key} title={f.title} body={body} signed={isSigned} signature={signed[f.key]} onSign={(name) => sign(f.key, name, body)} />
          );
        })}
      </div>
    </div>
  );
}

function EthicsCard({ title, body, signed, signature, onSign }: { title: string; body: string; signed: boolean; signature: string; onSign: (name: string) => void }) {
  const [name, setName] = useState("");
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-semibold">{title}</h3>
        {signed && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-900">
            <Check className="h-3 w-3" /> Signed
          </span>
        )}
      </div>
      <Textarea readOnly rows={4} value={body} className="mt-3 bg-secondary/30" />
      {signed ? (
        <p className="mt-3 text-sm text-muted-foreground">Signed by <span className="font-medium text-foreground">{signature}</span> on {new Date().toDateString()}.</p>
      ) : (
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div className="grid flex-1 gap-1.5">
            <Label htmlFor={`sig-${title}`}>Type your full name to sign</Label>
            <Input id={`sig-${title}`} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Yaa Asantewaa" />
          </div>
          <Button onClick={() => onSign(name)}>
            <FileSignature className="mr-1.5 h-4 w-4" /> Sign & download
          </Button>
        </div>
      )}
      {signed && (
        <Button variant="outline" size="sm" className="mt-3" onClick={() => onSign(signature)}>
          <Download className="mr-1.5 h-3.5 w-3.5" /> Re-download
        </Button>
      )}
    </div>
  );
}
