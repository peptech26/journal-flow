import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockMessages, mockEmailTemplates } from "@/lib/mock-secretary";
import { Mail, Send } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/secretary/communications")({
  component: CommsPage,
});

function CommsPage() {
  const [selectedTpl, setSelectedTpl] = useState(mockEmailTemplates[0].id);
  const tpl = mockEmailTemplates.find((t) => t.id === selectedTpl)!;
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState(tpl.subject);
  const [body, setBody] = useState(tpl.body);

  const onTplChange = (id: string) => {
    const t = mockEmailTemplates.find((x) => x.id === id)!;
    setSelectedTpl(id); setSubject(t.subject); setBody(t.body);
  };

  const send = () => {
    if (!to) return toast.error("Add a recipient");
    toast.success("Message sent");
    setTo("");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
      <Card>
        <CardHeader><CardTitle className="font-serif text-lg">Inbox</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {mockMessages.map((m) => (
            <div key={m.id} className={`rounded-lg border border-border p-3 ${m.unread ? "bg-primary/5" : "bg-card"}`}>
              <div className="flex items-baseline justify-between gap-2">
                <div className="font-medium text-foreground">{m.from}</div>
                <div className="text-[11px] text-muted-foreground">{new Date(m.at).toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="font-mono text-[10px]">{m.manuscriptId}</Badge>
                <div className="truncate text-sm">{m.subject}</div>
              </div>
              <p className="mt-1 truncate text-xs text-muted-foreground">{m.preview}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">Compose</CardTitle>
          <p className="text-sm text-muted-foreground">Use templated messages with personalization fields.</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Template</label>
            <select className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" value={selectedTpl} onChange={(e) => onTplChange(e.target.value)}>
              {mockEmailTemplates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">To</label>
            <Input className="mt-1" value={to} onChange={(e) => setTo(e.target.value)} placeholder="author@example.com" />
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Subject</label>
            <Input className="mt-1" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Body</label>
            <Textarea className="mt-1 min-h-[200px] font-mono text-xs" value={body} onChange={(e) => setBody(e.target.value)} />
            <p className="mt-1 text-[11px] text-muted-foreground">Personalize with {"{{author_name}}, {{title}}, {{manuscript_id}}, {{revision_deadline}}"}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={send}><Send className="mr-2 h-4 w-4" /> Send</Button>
            <Button variant="outline" onClick={() => toast.success("Draft saved")}><Mail className="mr-2 h-4 w-4" /> Save draft</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
