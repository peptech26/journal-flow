import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Camera, Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { isValidOrcid, formatOrcid } from "@/lib/orcid";

export const Route = createFileRoute("/author/profile")({
  head: () => ({ meta: [{ title: "My profile — Ghana Journal of Forestry" }] }),
  component: ProfilePage,
});

type Profile = { name: string; affiliation: string; orcid: string; bio: string; avatar: string };

const KEY = "gjf.author.profile";

function ProfilePage() {
  const [p, setP] = useState<Profile>({ name: "", affiliation: "", orcid: "", bio: "", avatar: "" });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setP(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const onAvatar = (file: File) => {
    if (file.size > 2 * 1024 * 1024) { toast.error("Image must be under 2MB"); return; }
    const reader = new FileReader();
    reader.onload = () => setP((s) => ({ ...s, avatar: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  const save = () => {
    if (p.orcid && !isValidOrcid(p.orcid)) { toast.error("Invalid ORCID iD"); return; }
    localStorage.setItem(KEY, JSON.stringify(p));
    toast.success("Profile saved");
  };

  return (
    <div>
      <Link to="/author" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to dashboard
      </Link>
      <h1 className="mt-3 font-serif text-3xl font-semibold text-foreground">My profile</h1>
      <p className="mt-1 text-sm text-muted-foreground">Your photo and details appear on published article cards.</p>

      <div className="mt-8 grid gap-8 rounded-2xl border border-border bg-card p-6 shadow-card md:grid-cols-[200px_1fr]">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="h-36 w-36 overflow-hidden rounded-full border-4 border-secondary bg-secondary">
              {p.avatar ? (
                <img src={p.avatar} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center text-3xl font-serif text-muted-foreground">
                  {p.name ? p.name.charAt(0).toUpperCase() : "?"}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-1 right-1 grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground shadow-elevated hover:bg-primary/90"
              aria-label="Upload photo"
            >
              <Camera className="h-4 w-4" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onAvatar(e.target.files[0])}
            />
          </div>
          <p className="text-center text-xs text-muted-foreground">JPG or PNG · max 2MB</p>
        </div>

        <div className="space-y-4">
          <div className="grid gap-2"><Label htmlFor="n">Full name</Label>
            <Input id="n" value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} /></div>
          <div className="grid gap-2"><Label htmlFor="a">Affiliation</Label>
            <Input id="a" value={p.affiliation} onChange={(e) => setP({ ...p, affiliation: e.target.value })} placeholder="e.g. CSIR–Forestry Research Institute of Ghana" /></div>
          <div className="grid gap-2"><Label htmlFor="o">ORCID iD</Label>
            <Input id="o" value={p.orcid} onChange={(e) => setP({ ...p, orcid: formatOrcid(e.target.value) })} placeholder="0000-0000-0000-0000" />
            {p.orcid && !isValidOrcid(p.orcid) && <p className="text-xs text-destructive">Invalid ORCID checksum.</p>}
          </div>
          <div className="grid gap-2"><Label htmlFor="b">Short bio</Label>
            <Textarea id="b" rows={4} value={p.bio} onChange={(e) => setP({ ...p, bio: e.target.value })} /></div>
          <Button onClick={save}><Save className="mr-1.5 h-4 w-4" /> Save profile</Button>
        </div>
      </div>
    </div>
  );
}
