import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, FileText, X, Check } from "lucide-react";
import { toast } from "sonner";
import { isValidOrcid } from "@/lib/orcid";

export const Route = createFileRoute("/reviewer/profile")({
  component: ReviewerProfile,
});

function ReviewerProfile() {
  const [name, setName] = useState("Dr. Akua Asare");
  const [email, setEmail] = useState("a.asare@example.ac");
  const [affiliation, setAffiliation] = useState("KNUST, Faculty of Renewable Natural Resources");
  const [orcid, setOrcid] = useState("0000-0002-1825-0097");
  const [bio, setBio] = useState("Forest ecologist with 12 years of field experience across West African dryland and humid forest systems.");
  const [expertise, setExpertise] = useState<string[]>(["allometry", "carbon stocks", "agroforestry", "REDD+"]);
  const [newKeyword, setNewKeyword] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [cv, setCv] = useState<{ name: string; size: string } | null>({
    name: "akua-asare-cv-2025.pdf",
    size: "284 KB",
  });
  const fileRef = useRef<HTMLInputElement>(null);
  const cvRef = useRef<HTMLInputElement>(null);

  function addKeyword() {
    const v = newKeyword.trim().toLowerCase();
    if (!v) return;
    if (expertise.includes(v)) return;
    setExpertise([...expertise, v]);
    setNewKeyword("");
  }

  function uploadAvatar(file: File) {
    const url = URL.createObjectURL(file);
    setAvatar(url);
    toast.success("Profile picture updated");
  }

  function uploadCv(file: File) {
    setCv({ name: file.name, size: `${Math.round(file.size / 1024)} KB` });
    toast.success("CV uploaded — visible to the editorial secretary");
  }

  const orcidOk = isValidOrcid(orcid);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Reviewer profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your expertise, affiliation, and CV help the editorial team find the right reviewers.
        </p>
      </header>

      <Card>
        <CardHeader><CardTitle className="text-base">Identity</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              {avatar && <AvatarImage src={avatar} />}
              <AvatarFallback>{name.split(" ").map((s) => s[0]).slice(0, 2).join("")}</AvatarFallback>
            </Avatar>
            <div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])}
              />
              <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
                <Upload className="mr-1.5 h-3.5 w-3.5" /> Upload photo
              </Button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
            <Field label="Email"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
            <Field label="Affiliation"><Input value={affiliation} onChange={(e) => setAffiliation(e.target.value)} /></Field>
            <Field label="ORCID iD">
              <div className="relative">
                <Input value={orcid} onChange={(e) => setOrcid(e.target.value)} />
                {orcid && (
                  <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs ${orcidOk ? "text-emerald-600" : "text-red-600"}`}>
                    {orcidOk ? <Check className="h-4 w-4" /> : "invalid"}
                  </span>
                )}
              </div>
            </Field>
          </div>
          <Field label="Short bio">
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Areas of expertise</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {expertise.map((k) => (
              <span key={k} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs">
                {k}
                <button type="button" onClick={() => setExpertise(expertise.filter((x) => x !== k))} aria-label="remove">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())}
              placeholder="Add a keyword and press Enter"
            />
            <Button type="button" variant="outline" onClick={addKeyword}>Add</Button>
          </div>
          <p className="text-xs text-muted-foreground">
            The editorial secretary searches reviewers by these keywords plus your publication history.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Curriculum vitae</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {cv ? (
            <div className="flex items-center justify-between rounded-md border p-3">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{cv.name}</span>
                <span className="text-xs text-muted-foreground">· {cv.size}</span>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setCv(null)}>Remove</Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No CV uploaded yet.</p>
          )}
          <input
            ref={cvRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && uploadCv(e.target.files[0])}
          />
          <Button size="sm" variant="outline" onClick={() => cvRef.current?.click()}>
            <Upload className="mr-1.5 h-3.5 w-3.5" /> {cv ? "Replace CV" : "Upload CV (PDF)"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Your CV is private — only editors and the editorial secretary can view it.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => toast.success("Profile saved")}>Save changes</Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
