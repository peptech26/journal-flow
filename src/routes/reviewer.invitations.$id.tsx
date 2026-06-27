import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { getInvitation, ANONYMITY_META } from "@/lib/mock-reviewer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CheckCircle2, XCircle, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/reviewer/invitations/$id")({
  component: InvitationDetail,
});

function InvitationDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const inv = getInvitation(id);
  const [mode, setMode] = useState<"accept" | "decline" | null>(null);
  const [coiAck, setCoiAck] = useState(false);
  const [confAck, setConfAck] = useState(false);
  const [declineReason, setDeclineReason] = useState("expertise");
  const [declineNote, setDeclineNote] = useState("");
  const [altName, setAltName] = useState("");
  const [altEmail, setAltEmail] = useState("");

  if (!inv) {
    return (
      <div className="space-y-4">
        <p>Invitation not found.</p>
        <Button asChild variant="outline" size="sm">
          <Link to="/reviewer/invitations">Back</Link>
        </Button>
      </div>
    );
  }

  function accept() {
    if (!coiAck || !confAck) {
      toast.error("Please confirm both declarations to accept.");
      return;
    }
    toast.success("Invitation accepted. Review added to your dashboard.");
    navigate({ to: "/reviewer" });
  }

  function decline() {
    toast.success("Invitation declined. Thank you for responding.");
    navigate({ to: "/reviewer" });
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/reviewer/invitations">
          <ArrowLeft className="mr-1 h-4 w-4" /> All invitations
        </Link>
      </Button>

      <Card>
        <CardContent className="space-y-3 p-6">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-secondary px-2 py-0.5 font-medium">
              {ANONYMITY_META[inv.anonymity].label}
            </span>
            <span className="text-muted-foreground">{ANONYMITY_META[inv.anonymity].note}</span>
          </div>
          <h1 className="font-serif text-2xl font-semibold leading-tight">{inv.title}</h1>
          <p className="max-w-prose text-sm text-muted-foreground">{inv.abstract}</p>
          <dl className="grid gap-3 pt-2 text-sm sm:grid-cols-3">
            <Field label="Editor" value={inv.editor} />
            <Field label="Respond by" value={new Date(inv.respondBy).toLocaleDateString()} />
            <Field label="Review due" value={new Date(inv.reviewDueIfAccepted).toLocaleDateString()} />
          </dl>
        </CardContent>
      </Card>

      {!mode && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Button size="lg" onClick={() => setMode("accept")} className="h-auto py-5">
            <CheckCircle2 className="mr-2 h-5 w-5" /> Accept invitation
          </Button>
          <Button size="lg" variant="outline" onClick={() => setMode("decline")} className="h-auto py-5">
            <XCircle className="mr-2 h-5 w-5" /> Decline
          </Button>
        </div>
      )}

      {mode === "accept" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Declarations required to accept</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-start gap-3 text-sm">
              <Checkbox checked={coiAck} onCheckedChange={(v) => setCoiAck(!!v)} className="mt-0.5" />
              <span>
                <strong>Conflict of interest:</strong> I have no personal, professional, or financial conflict
                that would compromise my ability to review this manuscript impartially.
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm">
              <Checkbox checked={confAck} onCheckedChange={(v) => setConfAck(!!v)} className="mt-0.5" />
              <span>
                <strong>Confidentiality & AI:</strong> I will keep the manuscript confidential, will not share
                it with third parties, and will not paste any portion into generative AI tools without prior
                written permission from the editor.
              </span>
            </label>
            <div className="flex gap-2 pt-2">
              <Button onClick={accept}>Confirm and accept</Button>
              <Button variant="ghost" onClick={() => setMode(null)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {mode === "decline" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Decline this invitation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Reason</Label>
              <Select value={declineReason} onValueChange={setDeclineReason}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="expertise">Outside my area of expertise</SelectItem>
                  <SelectItem value="coi">Conflict of interest</SelectItem>
                  <SelectItem value="workload">Workload / unavailable</SelectItem>
                  <SelectItem value="timeline">Cannot meet the timeline</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Note to editor (optional)</Label>
              <Textarea
                value={declineNote}
                onChange={(e) => setDeclineNote(e.target.value)}
                placeholder="Any context you'd like to share."
                rows={3}
              />
            </div>
            <div className="rounded-md border border-dashed p-3">
              <div className="mb-2 text-sm font-medium">Suggest an alternate reviewer (optional)</div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Input placeholder="Name" value={altName} onChange={(e) => setAltName(e.target.value)} />
                <Input
                  placeholder="Email"
                  type="email"
                  value={altEmail}
                  onChange={(e) => setAltEmail(e.target.value)}
                />
              </div>
            </div>
            <RadioGroup defaultValue="standard" className="hidden">
              <RadioGroupItem value="standard" />
            </RadioGroup>
            <div className="flex gap-2 pt-2">
              <Button onClick={decline}>Send response</Button>
              <Button variant="ghost" onClick={() => setMode(null)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-foreground">{value}</dd>
    </div>
  );
}
