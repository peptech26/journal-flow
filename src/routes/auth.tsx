import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Leaf } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Ghana Journal of Forestry" },
      { name: "description", content: "Sign in or create an account to submit and track manuscripts." },
    ],
  }),
  component: AuthPage,
});

type SignupRole = "author" | "reviewer" | "editorial_secretary" | "editor_in_chief";

function AuthPage() {
  const navigate = useNavigate();
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [signupRole, setSignupRole] = useState<SignupRole>("author");
  const [busy, setBusy] = useState(false);
  const [secretaryTaken, setSecretaryTaken] = useState(false);
  const [eicTaken, setEicTaken] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("user_roles").select("role").in("role", ["editorial_secretary", "editor_in_chief"]);
      setSecretaryTaken(!!data?.some((r) => r.role === "editorial_secretary"));
      setEicTaken(!!data?.some((r) => r.role === "editor_in_chief"));
    })();
  }, []);

  async function handleSignin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(fd.get("email") ?? ""),
      password: String(fd.get("password") ?? ""),
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Signed in");
    navigate({ to: "/author" });
  }

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    if (signupRole === "editorial_secretary" && secretaryTaken) {
      toast.error("Editorial Secretary is already filled. Submit a role request to the editorial office.");
    }
    if (signupRole === "editor_in_chief" && eicTaken) {
      toast.error("Editor-in-Chief is already filled. Submit a role request to the editorial office.");
    }
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "");
    const password = String(fd.get("password") ?? "");
    const fullName = String(fd.get("full_name") ?? "");
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth`,
        data: { full_name: fullName },
      },
    });
    if (error) { setBusy(false); toast.error(error.message); return; }

    const userId = data.user?.id;
    if (userId) {
      // Author + reviewer get the role granted immediately.
      if (signupRole === "author" || signupRole === "reviewer") {
        await supabase.from("user_roles").insert({ user_id: userId, role: signupRole });
      } else {
        // Singleton editorial roles → role_request for admin approval.
        await supabase.from("role_requests").insert({
          user_id: userId,
          requested_role: signupRole,
          justification: "Requested at signup",
        });
        toast.success("Account created. Your editorial role request is pending admin approval.");
      }
    }
    setBusy(false);
    toast.success("Account created — welcome!");
    const dashboardPath =
      signupRole === "reviewer" ? "/reviewer" :
      signupRole === "editorial_secretary" ? "/secretary" :
      signupRole === "editor_in_chief" ? "/eic" : "/author";
    navigate({ to: dashboardPath });
  }

  async function handleForgot() {
    if (!forgotEmail) { toast.error("Enter your email"); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setForgotOpen(false);
    if (error) toast.error(error.message);
    else toast.success("Password reset email sent");
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

          <Tabs defaultValue="signin" className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <form onSubmit={handleSignin} className="space-y-4">
                <Field label="Email" name="email" type="email" required />
                <Field label="Password" name="password" type="password" required />
                <div className="-mt-2 flex justify-end">
                  <button type="button" onClick={() => setForgotOpen(true)} className="text-xs text-muted-foreground hover:text-foreground">
                    Forgot password?
                  </button>
                </div>
                <Button type="submit" className="w-full" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <Field label="Full name" name="full_name" required />
                <Field label="Email" name="email" type="email" required />
                <Field label="Password" name="password" type="password" required minLength={8} />
                <div className="space-y-1.5">
                  <Label htmlFor="requested_role">I'm joining as</Label>
                  <Select value={signupRole} onValueChange={(v) => setSignupRole(v as SignupRole)}>
                    <SelectTrigger id="requested_role"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="author">Author — submit manuscripts</SelectItem>
                      <SelectItem value="reviewer">Reviewer — peer review submissions</SelectItem>
                      <SelectItem value="editorial_secretary">Editorial Secretary — manage workflow{secretaryTaken ? " (request approval)" : ""}</SelectItem>
                      <SelectItem value="editor_in_chief">Editor-in-Chief — oversee journal{eicTaken ? " (request approval)" : ""}</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Editorial roles require admin approval before they take effect.
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={busy}>{busy ? "Creating…" : "Create account"}</Button>
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
            <Button onClick={handleForgot} type="button">Send reset link</Button>
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
