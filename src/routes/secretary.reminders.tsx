import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockReminderRules, ReminderRule } from "@/lib/mock-secretary";
import { Plus, BellRing } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/secretary/reminders")({
  component: RemindersPage,
});

const TRIGGER_LABELS: Record<ReminderRule["trigger"], string> = {
  reviewer_invitation_pending: "Reviewer invitation pending",
  reviewer_review_due: "Reviewer review due",
  author_revision_due: "Author revision due",
};

function RemindersPage() {
  const [rules, setRules] = useState(mockReminderRules);

  const toggle = (id: string) => {
    setRules((rs) => rs.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
    toast.success("Schedule updated");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-serif text-lg">Automated reminder rules</CardTitle>
            <p className="text-sm text-muted-foreground">Pre-set schedules with optional escalation to the assigned editor.</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => toast.success("New rule template opened")}>
            <Plus className="mr-1 h-4 w-4" /> New rule
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {rules.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center gap-4 rounded-lg border border-border p-3">
                <div className="grid h-9 w-9 place-items-center rounded-md bg-primary/10 text-primary">
                  <BellRing className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <div className="font-medium text-foreground">{r.name}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {TRIGGER_LABELS[r.trigger]} · {r.offsetDays >= 0 ? `${r.offsetDays}d after` : `${Math.abs(r.offsetDays)}d before`} due
                  </div>
                </div>
                <Badge variant="secondary" className="font-normal">{r.channel}</Badge>
                {r.escalateToEditor && <Badge className="border bg-amber-100 text-amber-900 border-amber-200 font-normal" variant="outline">Escalate to editor</Badge>}
                <Switch checked={r.enabled} onCheckedChange={() => toggle(r.id)} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">Upcoming sends (next 7 days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border text-sm">
            <li className="flex justify-between py-3"><span>Reminder — Prof. E. Quaye (ms-2026-029 review due in 3d)</span><span className="text-muted-foreground">Tomorrow 09:00</span></li>
            <li className="flex justify-between py-3"><span>Escalation — Dr. A. Mensah re: ms-2026-014 overdue</span><span className="text-muted-foreground">Today 17:00</span></li>
            <li className="flex justify-between py-3"><span>Author nudge — S. Kuffour revision due in 7d</span><span className="text-muted-foreground">Wed 08:00</span></li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
