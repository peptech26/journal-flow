import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { defaultPolicy, type JournalPolicy } from "@/lib/mock-eic";
import { Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/eic/policies")({
  component: PoliciesPage,
});

function PoliciesPage() {
  const [p, setP] = useState<JournalPolicy>(defaultPolicy);
  const set = <K extends keyof JournalPolicy>(k: K, v: JournalPolicy[K]) => setP((s) => ({ ...s, [k]: v }));

  const save = () => toast.success("Policies updated — submission forms and email templates will reflect changes.");

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle className="font-serif text-lg">Manuscript limits</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Num label="Abstract word limit" v={p.abstractWordLimit} on={(n) => set("abstractWordLimit", n)} />
          <Num label="Manuscript word limit" v={p.manuscriptWordLimit} on={(n) => set("manuscriptWordLimit", n)} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="font-serif text-lg">Review timeline (days)</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Num label="Reviewer response window" v={p.reviewerResponseDays} on={(n) => set("reviewerResponseDays", n)} />
          <Num label="Reviewer review window" v={p.reviewerReviewDays} on={(n) => set("reviewerReviewDays", n)} />
          <Num label="Author revision window" v={p.authorRevisionDays} on={(n) => set("authorRevisionDays", n)} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="font-serif text-lg">Open access</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Num label="Article processing fee (USD)" v={p.openAccessFeeUSD} on={(n) => set("openAccessFeeUSD", n)} />
          <Toggle label="Enable waivers for low-income countries" v={p.waiverCountriesEnabled} on={(b) => set("waiverCountriesEnabled", b)} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="font-serif text-lg">Review model</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Toggle label="Double-blind review" v={p.doubleBlind} on={(b) => set("doubleBlind", b)} />
        </CardContent>
      </Card>

      <div className="lg:col-span-2 flex justify-end">
        <Button onClick={save}><Save className="mr-2 h-4 w-4" /> Save policy changes</Button>
      </div>
    </div>
  );
}

function Num({ label, v, on }: { label: string; v: number; on: (n: number) => void }) {
  return (
    <div className="grid grid-cols-[1fr_120px] items-center gap-3">
      <Label className="text-sm">{label}</Label>
      <Input type="number" value={v} onChange={(e) => on(Number(e.target.value))} />
    </div>
  );
}
function Toggle({ label, v, on }: { label: string; v: boolean; on: (b: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <Label className="text-sm">{label}</Label>
      <Switch checked={v} onCheckedChange={on} />
    </div>
  );
}
