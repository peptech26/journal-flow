import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle, XCircle, Upload, Sparkles, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { WizardStepper } from "@/components/author/wizard-stepper";
import { isValidOrcid, formatOrcid } from "@/lib/orcid";
import { autoFormatReferences } from "@/lib/reference-format";

export const Route = createFileRoute("/author/submit")({
  head: () => ({ meta: [{ title: "Submit a manuscript — Ghana Journal of Forestry" }] }),
  component: SubmitWizard,
});

const STEPS = ["Type & title", "Abstract & keywords", "Authors", "Files", "Ethics", "Review"];
const DRAFT_KEY = "gjf.author.draft";

type CoAuthor = { name: string; email: string; affiliation: string; orcid: string; corresponding: boolean };
type State = {
  type: "Research" | "Review" | "Short communication";
  title: string;
  abstract: string;
  keywords: string[];
  authors: CoAuthor[];
  references: string;
  file: { name: string; size: number; type: string } | null;
  fileText: string;
  ethics: { coi: boolean; dataAvail: boolean; copyright: boolean };
};

const initial: State = {
  type: "Research",
  title: "",
  abstract: "",
  keywords: [],
  authors: [{ name: "", email: "", affiliation: "", orcid: "", corresponding: true }],
  references: "",
  file: null,
  fileText: "",
  ethics: { coi: false, dataAvail: false, copyright: false },
};

type Action = { type: "set"; patch: Partial<State> } | { type: "load"; value: State };
function reducer(s: State, a: Action): State {
  if (a.type === "set") return { ...s, ...a.patch };
  return a.value;
}

function SubmitWizard() {
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [state, dispatch] = useReducer(reducer, initial);
  const [kwInput, setKwInput] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) dispatch({ type: "load", value: JSON.parse(raw) });
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(state));
  }, [state]);

  const set = (patch: Partial<State>) => dispatch({ type: "set", patch });

  return (
    <div>
      <Link to="/author" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to dashboard
      </Link>
      <h1 className="mt-3 font-serif text-3xl font-semibold">Smart submission wizard</h1>
      <p className="mt-1 text-sm text-muted-foreground">Drafts save automatically as you go.</p>

      <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-card">
        <WizardStepper steps={STEPS} current={step} />
        <Progress value={((step + 1) / STEPS.length) * 100} className="mt-4" />

        <div className="mt-8">
          {step === 0 && <StepType state={state} set={set} />}
          {step === 1 && <StepAbstract state={state} set={set} kwInput={kwInput} setKwInput={setKwInput} />}
          {step === 2 && <StepAuthors state={state} set={set} />}
          {step === 3 && <StepFiles state={state} set={set} />}
          {step === 4 && <StepEthics state={state} set={set} />}
          {step === 5 && <StepReview state={state} />}
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
          <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)}>
              Next <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={() => {
                if (!state.title || !state.abstract || !state.file) {
                  toast.error("Complete required fields before submitting");
                  return;
                }
                localStorage.removeItem(DRAFT_KEY);
                toast.success("Manuscript submitted to the editor");
                nav({ to: "/author" });
              }}
            >
              Submit to editor
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function StepType({ state, set }: { state: State; set: (p: Partial<State>) => void }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-2">
        <Label>Manuscript type</Label>
        <div className="flex flex-wrap gap-2">
          {(["Research", "Review", "Short communication"] as const).map((t) => (
            <button
              key={t}
              onClick={() => set({ type: t })}
              className={`rounded-full border px-4 py-1.5 text-sm transition ${state.type === t ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:bg-accent"}`}
            >{t}</button>
          ))}
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
        <Input id="title" value={state.title} onChange={(e) => set({ title: e.target.value })} placeholder="Concise, descriptive title" />
        <p className="text-xs text-muted-foreground">{state.title.length}/250</p>
      </div>
    </div>
  );
}

function StepAbstract({ state, set, kwInput, setKwInput }: { state: State; set: (p: Partial<State>) => void; kwInput: string; setKwInput: (s: string) => void }) {
  const wordCount = state.abstract.trim().split(/\s+/).filter(Boolean).length;
  const addKw = () => {
    const v = kwInput.trim();
    if (!v || state.keywords.includes(v)) return;
    set({ keywords: [...state.keywords, v] });
    setKwInput("");
  };
  return (
    <div className="space-y-5">
      <div className="grid gap-2">
        <Label htmlFor="ab">Abstract <span className="text-destructive">*</span></Label>
        <Textarea id="ab" rows={8} value={state.abstract} onChange={(e) => set({ abstract: e.target.value })} placeholder="250–300 words. Background, methods, key results, conclusions." />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{wordCount} words</span>
          {wordCount > 300 && <span className="text-amber-700">Above 300-word guideline</span>}
        </div>
      </div>
      <div className="grid gap-2">
        <Label>Keywords <span className="text-muted-foreground">(3–6)</span></Label>
        <div className="flex gap-2">
          <Input
            value={kwInput}
            onChange={(e) => setKwInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addKw(); } }}
            placeholder="Type and press Enter"
          />
          <Button type="button" variant="outline" onClick={addKw}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {state.keywords.map((k) => (
            <Badge key={k} variant="secondary" className="cursor-pointer" onClick={() => set({ keywords: state.keywords.filter((x) => x !== k) })}>
              {k} ×
            </Badge>
          ))}
        </div>
      </div>
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="refs">References</Label>
          <Button type="button" size="sm" variant="ghost" onClick={() => { set({ references: autoFormatReferences(state.references) }); toast.success("References reformatted"); }}>
            <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Auto-format (APA)
          </Button>
        </div>
        <Textarea id="refs" rows={6} value={state.references} onChange={(e) => set({ references: e.target.value })} placeholder="One reference per line" />
      </div>
    </div>
  );
}

function StepAuthors({ state, set }: { state: State; set: (p: Partial<State>) => void }) {
  const update = (i: number, patch: Partial<CoAuthor>) =>
    set({ authors: state.authors.map((a, idx) => (idx === i ? { ...a, ...patch } : a)) });
  return (
    <div className="space-y-4">
      {state.authors.map((a, i) => (
        <div key={i} className="rounded-xl border border-border p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {i === 0 ? "Submitting author" : `Co-author ${i}`}
            </p>
            {i > 0 && (
              <button onClick={() => set({ authors: state.authors.filter((_, idx) => idx !== i) })} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Input placeholder="Full name" value={a.name} onChange={(e) => update(i, { name: e.target.value })} />
            <Input placeholder="Email" type="email" value={a.email} onChange={(e) => update(i, { email: e.target.value })} />
            <Input placeholder="Affiliation" value={a.affiliation} onChange={(e) => update(i, { affiliation: e.target.value })} />
            <div>
              <Input placeholder="ORCID (0000-0000-0000-0000)" value={a.orcid} onChange={(e) => update(i, { orcid: formatOrcid(e.target.value) })} />
              {a.orcid && !isValidOrcid(a.orcid) && <p className="mt-1 text-xs text-destructive">Invalid ORCID</p>}
            </div>
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={a.corresponding} onChange={(e) => update(i, { corresponding: e.target.checked })} />
            Corresponding author
          </label>
        </div>
      ))}
      <Button variant="outline" onClick={() => set({ authors: [...state.authors, { name: "", email: "", affiliation: "", orcid: "", corresponding: false }] })}>
        <Plus className="mr-1.5 h-4 w-4" /> Add co-author
      </Button>
    </div>
  );
}

function StepFiles({ state, set }: { state: State; set: (p: Partial<State>) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = async (file: File) => {
    set({ file: { name: file.name, size: file.size, type: file.type } });
    if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      const text = await file.text();
      set({ fileText: text });
    } else {
      set({ fileText: "" });
    }
  };

  const checks = useMemo(() => buildChecks(state), [state]);

  return (
    <div className="space-y-5">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) onFile(f); }}
        className="cursor-pointer rounded-xl border-2 border-dashed border-border bg-secondary/30 p-10 text-center hover:bg-secondary/60"
      >
        <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium">{state.file ? state.file.name : "Drop your manuscript here or click to browse"}</p>
        <p className="mt-1 text-xs text-muted-foreground">PDF, DOCX or TXT · up to 20 MB</p>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".pdf,.docx,.txt,application/pdf,text/plain"
          onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
        />
      </div>

      <div className="rounded-xl border border-border bg-background p-4">
        <h3 className="text-sm font-semibold">Validation checks</h3>
        <ul className="mt-3 space-y-2 text-sm">
          {checks.map((c) => (
            <li key={c.label} className="flex items-start gap-2">
              {c.level === "pass" && <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />}
              {c.level === "warn" && <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" />}
              {c.level === "fail" && <XCircle className="mt-0.5 h-4 w-4 text-destructive" />}
              <div>
                <p className="font-medium">{c.label}</p>
                {c.detail && <p className="text-xs text-muted-foreground">{c.detail}</p>}
              </div>
            </li>
          ))}
        </ul>
        <Button type="button" variant="outline" size="sm" className="mt-4" disabled={!state.file} onClick={() => toast.info("PDF conversion runs server-side after submission")}>
          Convert to PDF for review
        </Button>
      </div>
    </div>
  );
}

function buildChecks(state: State): { label: string; level: "pass" | "warn" | "fail"; detail?: string }[] {
  const out: { label: string; level: "pass" | "warn" | "fail"; detail?: string }[] = [];
  if (!state.file) {
    out.push({ label: "Manuscript file uploaded", level: "fail" });
    return out;
  }
  const allowed = [".pdf", ".docx", ".txt"];
  const okExt = allowed.some((e) => state.file!.name.toLowerCase().endsWith(e));
  out.push({ label: `Accepted file type (${state.file.name.split(".").pop()})`, level: okExt ? "pass" : "fail" });
  out.push({ label: `File size ${(state.file.size / 1024 / 1024).toFixed(2)} MB`, level: state.file.size < 20 * 1024 * 1024 ? "pass" : "fail" });

  if (state.fileText) {
    const wc = state.fileText.trim().split(/\s+/).filter(Boolean).length;
    out.push({ label: `Approx. word count: ${wc}`, level: wc > 0 && wc < 12000 ? "pass" : "warn", detail: wc >= 12000 ? "Exceeds 12,000-word soft limit" : undefined });
    const names = state.authors.map((a) => a.name.trim()).filter(Boolean);
    const found = names.filter((n) => state.fileText.toLowerCase().includes(n.toLowerCase()));
    out.push({
      label: "Anonymisation (double-blind)",
      level: found.length === 0 ? "pass" : "warn",
      detail: found.length ? `Author name(s) detected in manuscript: ${found.join(", ")}` : "No author names detected",
    });
  } else {
    out.push({ label: "Anonymisation check", level: "warn", detail: "Will run on the server for PDF/DOCX files" });
  }

  return out;
}

function StepEthics({ state, set }: { state: State; set: (p: Partial<State>) => void }) {
  const Row = ({ k, label, body }: { k: keyof State["ethics"]; label: string; body: string }) => (
    <label className="flex items-start gap-3 rounded-xl border border-border p-4">
      <input type="checkbox" checked={state.ethics[k]} onChange={(e) => set({ ethics: { ...state.ethics, [k]: e.target.checked } })} className="mt-1" />
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{body}</p>
      </div>
    </label>
  );
  return (
    <div className="space-y-3">
      <Row k="coi" label="Conflict-of-interest disclosure" body="I confirm all co-authors have declared any competing interests." />
      <Row k="dataAvail" label="Data availability statement" body="I have included a statement describing where supporting data are available." />
      <Row k="copyright" label="Copyright transfer agreement" body="I agree to the journal's open-access licensing terms upon acceptance." />
      <p className="text-xs text-muted-foreground">You can sign the formal ethics forms from the manuscript page after submission.</p>
    </div>
  );
}

function StepReview({ state }: { state: State }) {
  return (
    <div className="space-y-4 text-sm">
      <Section label="Type">{state.type}</Section>
      <Section label="Title">{state.title || <em className="text-destructive">required</em>}</Section>
      <Section label="Abstract">{state.abstract ? `${state.abstract.slice(0, 280)}${state.abstract.length > 280 ? "…" : ""}` : <em className="text-destructive">required</em>}</Section>
      <Section label="Keywords">{state.keywords.join(", ") || "—"}</Section>
      <Section label="Authors">{state.authors.map((a) => a.name || "Unnamed").join(", ")}</Section>
      <Section label="File">{state.file ? state.file.name : <em className="text-destructive">required</em>}</Section>
      <Section label="Ethics confirmed">{Object.values(state.ethics).filter(Boolean).length} / 3</Section>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 border-b border-border pb-3">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="text-foreground">{children}</span>
    </div>
  );
}
