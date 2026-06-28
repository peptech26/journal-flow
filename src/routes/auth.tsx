import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock } from "lucide-react";

const CLAIMED_ROLES_KEY = "gjf:claimed-singleton-roles";
type SingletonRole = "secretary" | "eic";
function readClaimedRoles(): SingletonRole[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(CLAIMED_ROLES_KEY) ?? "[]"); } catch { return []; }
}
function claimRole(role: SingletonRole) {
  if (typeof window === "undefined") return;
  const current = readClaimedRoles();
  if (!current.includes(role)) {
    localStorage.setItem(CLAIMED_ROLES_KEY, JSON.stringify([...current, role]));
  }
}

import { Leaf } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Ghana Journal of Forestry" },
      { name: "description", content: "Sign in or create an account to submit and track manuscripts." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [signupRole, setSignupRole] = useState<"author" | "reviewer" | "secretary" | "eic">("author");

  function notWired(label: string) {
    toast.info(`${label} — connect your database to enable.`);
  }

  function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    toast.success("Account created — welcome!");
    const dashboardPath =
      signupRole === "reviewer"
        ? "/reviewer"
        : signupRole === "secretary"
          ? "/secretary"
          : signupRole === "eic"
            ? "/eic"
            : "/author";
    navigate({ to: dashboardPath });
  }


  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden bg-primary text-primary-foreground lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-primary-foreground/10"><Leaf className="h-5 w-5" /></span>
          <div className="leading-tight">
            <div className="font-serif text-base font-semibold">Ghana Journal</div>
            <div className="text-[11px] uppercase tracking-[0.18em] opacity-80">of Forestry</div>
          </div>
        </Link>
        <div>
          <p className="font-serif text-2xl leading-snug text-balance">
            "A trusted record of forestry research from across West Africa — rigorous, open, and rooted in place."
          </p>
          <p className="mt-4 text-sm opacity-80">Editorial Office, Ghana Journal of Forestry</p>
        </div>
        <div className="text-xs opacity-70">© {new Date().getFullYear()} Ghana Journal of Forestry</div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Back to library</Link>
          </div>
          <h1 className="font-serif text-3xl font-semibold text-foreground">Welcome</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Sign in to submit and track your manuscripts.</p>

          <Button onClick={() => notWired("Google sign-in")} variant="outline" className="mt-6 w-full" type="button">
            <GoogleIcon /> Continue with Google
          </Button>

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
          </div>

          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <form onSubmit={(e) => { e.preventDefault(); notWired("Sign in"); }} className="space-y-4">
                <Field label="Email" name="email" type="email" required />
                <Field label="Password" name="password" type="password" required />
                <div className="-mt-2 flex justify-end">
                  <button type="button" onClick={() => setForgotOpen(true)} className="text-xs text-muted-foreground hover:text-foreground">
                    Forgot password?
                  </button>
                </div>
                <Button type="submit" className="w-full">Sign in</Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <Field label="Full name" name="full_name" required />
                <Field label="Email" name="email" type="email" required />
                <Field label="Password" name="password" type="password" required minLength={8} />
                <div className="space-y-1.5">
                  <Label htmlFor="requested_role">I'm joining as</Label>
                  <Select name="requested_role" value={signupRole} onValueChange={(v) => setSignupRole(v as "author" | "reviewer")}>
                    <SelectTrigger id="requested_role"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="author">Author — submit manuscripts</SelectItem>
                      <SelectItem value="reviewer">Reviewer — peer review submissions</SelectItem>
                      <SelectItem value="secretary">Editorial Secretary — manage workflow</SelectItem>
                      <SelectItem value="eic">Editor-in-Chief — oversee journal</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Editorial staff accounts are provisioned by the editorial office.</p>
                </div>
                <Button type="submit" className="w-full">Create account</Button>
              </form>
            </TabsContent>

          </Tabs>
        </div>
      </div>

      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset your password</DialogTitle>
            <DialogDescription>Enter your account email and we'll send you a secure link to choose a new password.</DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="forgot-email">Email</Label>
            <Input id="forgot-email" type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setForgotOpen(false)} type="button">Cancel</Button>
            <Button onClick={() => { setForgotOpen(false); notWired("Password reset email"); }} type="button">Send reset link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, ...p }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={p.name}>{label}</Label>
      <Input id={p.name} {...p} />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/>
    </svg>
  );
}
