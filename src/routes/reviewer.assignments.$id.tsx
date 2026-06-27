import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  getAssignment,
  RATING_QUESTIONS,
  RECOMMENDATION_META,
  ANONYMITY_META,
  type RatingKey,
  type ReviewRecommendation,
} from "@/lib/mock-reviewer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Download, FileText, Highlighter, Send, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/reviewer/assignments/$id")({
  component: AssignmentReview,
});

function AssignmentReview() {
  const { id } = Route.useParams();
  const a = getAssignment(id);

  const [ratings, setRatings] = useState<Record<RatingKey, number>>({
    originality: 0, methodology: 0, clarity: 0, significance: 0, literature: 0,
  });
  const [summary, setSummary] = useState("");
  const [editorComments, setEditorComments] = useState("");
  const [authorComments, setAuthorComments] = useState("");
  const [numberedRevisions, setNumberedRevisions] = useState("1. \n2. \n3. ");
  const [recommendation, setRecommendation] = useState<ReviewRecommendation | "">("");
  const [annotations, setAnnotations] = useState(a?.annotations ?? []);
  const [newQuote, setNewQuote] = useState("");
  const [newNote, setNewNote] = useState("");
  const [newPage, setNewPage] = useState(1);
  const [subReviewerName, setSubReviewerName] = useState("");
  const [subReviewerEmail, setSubReviewerEmail] = useState("");
  const [subReviewerJustify, setSubReviewerJustify] = useState("");
  const [finalAck, setFinalAck] = useState(false);

  if (!a) {
    return (
      <div className="space-y-4">
        <p>Assignment not found.</p>
        <Button asChild variant="outline" size="sm"><Link to="/reviewer">Back</Link></Button>
      </div>
    );
  }

  function setRating(k: RatingKey, v: number) {
    setRatings((r) => ({ ...r, [k]: v }));
  }

  function addAnnotation() {
    if (!newQuote.trim() || !newNote.trim()) {
      toast.error("Add both an excerpt and a note.");
      return;
    }
    setAnnotations((prev) => [
      ...prev,
      {
        id: `a${Date.now()}`,
        page: newPage,
        quote: newQuote.trim(),
        note: newNote.trim(),
        createdAt: new Date().toISOString(),
      },
    ]);
    setNewQuote(""); setNewNote("");
    toast.success("Annotation saved.");
  }

  function requestSubReviewer() {
    if (!subReviewerName || !subReviewerEmail || !subReviewerJustify) {
      toast.error("Fill in the colleague's details and a justification.");
      return;
    }
    toast.success("Sub-reviewer request sent to the editor for approval.");
    setSubReviewerName(""); setSubReviewerEmail(""); setSubReviewerJustify("");
  }

  function submitReview() {
    if (!recommendation) return toast.error("Select a recommendation.");
    if (Object.values(ratings).some((r) => r === 0)) return toast.error("Complete all rating scales.");
    if (!summary.trim() || !authorComments.trim()) return toast.error("Add the summary and comments to the author.");
    if (!finalAck) return toast.error("Confirm the declarations before submitting.");
    toast.success("Review submitted to the editor. Thank you.");
  }

  const ratingsDone = Object.values(ratings).filter((r) => r > 0).length;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/reviewer"><ArrowLeft className="mr-1 h-4 w-4" /> Dashboard</Link>
      </Button>

      <Card>
        <CardContent className="space-y-3 p-6">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-secondary px-2 py-0.5 font-medium">Round {a.round}</span>
            <span className="rounded-full bg-secondary px-2 py-0.5">{ANONYMITY_META[a.anonymity].label}</span>
            <span className="text-muted-foreground">Due {new Date(a.dueAt).toLocaleDateString()}</span>
          </div>
          <h1 className="font-serif text-2xl font-semibold leading-tight">{a.title}</h1>
          <p className="text-sm text-muted-foreground">{a.authorsLabel}</p>
          <p className="max-w-prose text-sm text-muted-foreground">{a.abstract}</p>
        </CardContent>
      </Card>

      <Tabs defaultValue="review">
        <TabsList>
          <TabsTrigger value="review">Review form</TabsTrigger>
          <TabsTrigger value="files">Files & annotations</TabsTrigger>
          <TabsTrigger value="sub">Sub-reviewer</TabsTrigger>
        </TabsList>

        <TabsContent value="review" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Rating scales <span className="ml-1 text-xs font-normal text-muted-foreground">({ratingsDone}/{RATING_QUESTIONS.length} complete)</span></CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {RATING_QUESTIONS.map((q) => (
                <div key={q.key} className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-sm font-medium">{q.label}</div>
                    <div className="text-xs text-muted-foreground">{q.help}</div>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setRating(q.key, n)}
                        className={cn(
                          "h-8 w-8 rounded-md border text-sm transition-colors",
                          ratings[q.key] === n
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card hover:border-primary/60",
                        )}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <p className="text-xs text-muted-foreground">1 = poor · 5 = excellent</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Summary of the manuscript</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={4}
                placeholder="In your own words, summarise the contribution, methods, and main findings."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Comments to the editor <span className="ml-1 text-xs font-normal text-muted-foreground">(confidential — not shared with the author)</span></CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={editorComments}
                onChange={(e) => setEditorComments(e.target.value)}
                rows={4}
                placeholder="Confidential observations, suspected misconduct, suitability for the journal."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Comments to the author</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-2">
                <Label>General comments</Label>
                <Textarea
                  value={authorComments}
                  onChange={(e) => setAuthorComments(e.target.value)}
                  rows={4}
                  placeholder="Constructive overall assessment and major points."
                />
              </div>
              <div className="grid gap-2">
                <Label>Numbered revisions and suggestions</Label>
                <Textarea
                  value={numberedRevisions}
                  onChange={(e) => setNumberedRevisions(e.target.value)}
                  rows={6}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">List each requested change on a numbered line.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recommendation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-2 sm:grid-cols-2">
                {(Object.keys(RECOMMENDATION_META) as ReviewRecommendation[]).map((r) => {
                  const meta = RECOMMENDATION_META[r];
                  const selected = recommendation === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRecommendation(r)}
                      className={cn(
                        "rounded-md border p-3 text-left transition-colors",
                        selected ? meta.tone : "border-border bg-card hover:border-primary/40",
                      )}
                    >
                      <div className="text-sm font-semibold">{meta.label}</div>
                      <div className="text-xs opacity-80">{meta.description}</div>
                    </button>
                  );
                })}
              </div>
              <label className="flex items-start gap-2 pt-2 text-xs text-muted-foreground">
                <Checkbox checked={finalAck} onCheckedChange={(v) => setFinalAck(!!v)} className="mt-0.5" />
                <span>
                  I confirm I have honoured the confidentiality agreement, have no undisclosed conflict of
                  interest, and have not used generative AI tools on this manuscript without permission.
                </span>
              </label>
              <Button onClick={submitReview}><Send className="mr-1.5 h-4 w-4" /> Submit review to editor</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files" className="space-y-4 pt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Manuscript files</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {a.files.map((f) => (
                <div key={f.id} className="flex items-center justify-between rounded-md border p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{f.filename}</span>
                    <span className="text-xs text-muted-foreground">· {f.kind} · {f.size}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => toast.success("Opened in secure viewer")}>View</Button>
                    <Button size="sm" variant="outline" onClick={() => toast.success(`${f.filename} downloaded`)}>
                      <Download className="mr-1 h-3.5 w-3.5" /> Download
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Highlighter className="h-4 w-4" /> Annotations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 rounded-md border border-dashed p-3 sm:grid-cols-[80px_1fr_1fr_auto]">
                <Input type="number" min={1} value={newPage} onChange={(e) => setNewPage(Number(e.target.value))} placeholder="Pg" />
                <Input value={newQuote} onChange={(e) => setNewQuote(e.target.value)} placeholder="Quoted excerpt" />
                <Input value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Your note" />
                <Button onClick={addAnnotation} size="sm">Add</Button>
              </div>
              {annotations.length === 0 ? (
                <p className="text-sm text-muted-foreground">No annotations yet.</p>
              ) : (
                <ul className="space-y-2">
                  {annotations.map((an) => (
                    <li key={an.id} className="rounded-md border p-3">
                      <div className="text-xs text-muted-foreground">Page {an.page}</div>
                      <blockquote className="mt-1 border-l-2 border-primary/40 pl-3 text-sm italic">
                        “{an.quote}”
                      </blockquote>
                      <p className="mt-1.5 text-sm">{an.note}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sub" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UserPlus className="h-4 w-4" /> Request sub-reviewer approval
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Delegating part of this review requires the editor's prior approval. The colleague will be
                bound by the same confidentiality terms.
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                <Input value={subReviewerName} onChange={(e) => setSubReviewerName(e.target.value)} placeholder="Colleague name" />
                <Input type="email" value={subReviewerEmail} onChange={(e) => setSubReviewerEmail(e.target.value)} placeholder="Colleague email" />
              </div>
              <Textarea
                value={subReviewerJustify}
                onChange={(e) => setSubReviewerJustify(e.target.value)}
                rows={3}
                placeholder="Why this colleague (expertise, role, scope of delegation)."
              />
              <Button onClick={requestSubReviewer}>Request editor approval</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
