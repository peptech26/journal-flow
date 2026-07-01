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
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
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

function dashboardFor(role: SignupRole) {
  return role === "reviewer" ? "/reviewer"
    : role === "editorial_secretary" ? "/secretary"
    : role === "editor_in_chief" ? "/eic"
    : "/author";
}

function nextPath(): string | null {
  if (typeof window === "undefined") return null;
  const n = new URLSearchParams(window.location.search).get("next");
  if (!n || !n.startsWith("/")) return null;
  return n;
}


function AuthPage() {
  const navigate = useNavigate();
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [signupRole, setSignupRole] = useState<SignupRole>("author");
  const [busy, setBusy] = useState(false);
  const [secretaryTaken, setSecretaryTaken] = useState(false);
  const [eicTaken, setEicTaken] = useState(false);

  // OTP step state — shown after signUp until the email code is verified.
  const [otpEmail, setOtpEmail] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [pendingRole, setPendingRole] = useState<SignupRole>("author");

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
    navigate({ to: (nextPath() ?? "/author") as string });
  }


  async function handleGoogle() {
    if (busy) return;
    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth` },
    });
    setBusy(false);
    if (error) toast.error(error.message);
  }

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "");
    const password = String(fd.get("password") ?? "");
    const fullName = String(fd.get("full_name") ?? "");
    setBusy(true);
    const { data: signUpData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth`,
        data: { full_name: fullName },
      },
    });
    if (error) { setBusy(false); toast.error(error.message); return; }

    // TESTING MODE: skip email verification. Try to sign in immediately.
    let userId = signUpData.user?.id;
    if (!signUpData.session) {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setBusy(false);
        toast.error("Turn off 'Confirm email' in Supabase Auth settings for testing mode.");
        return;
      }
      userId = signInData.user?.id ?? userId;
    }

    if (userId) {
      await supabase.from("user_roles").insert({ user_id: userId, role: signupRole });
    }
    setBusy(false);
    toast.success("Account created — welcome!");
    navigate({ to: (nextPath() ?? dashboardFor(signupRole)) as string });
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!otpEmail || busy) return;
    if (otpCode.length < 4) { toast.error("Enter the code from your email"); return; }
    setBusy(true);
    const { data, error } = await supabase.auth.verifyOtp({
      email: otpEmail,
      token: otpCode,
      type: "signup",
    });
    if (error) { setBusy(false); toast.error(error.message); return; }
    const userId = data.user?.id;
    if (userId) {
      if (pendingRole === "author" || pendingRole === "reviewer") {
        await supabase.from("user_roles").insert({ user_id: userId, role: pendingRole });
      } else {
        await supabase.from("role_requests").insert({
          user_id: userId,
          requested_role: pendingRole,
          justification: "Requested at signup",
        });
        toast.success("Email verified. Your editorial role request is pending admin approval.");
      }
    }
    setBusy(false);
    toast.success("Email verified — welcome!");
    const dest = (pendingRole === "author" || pendingRole === "reviewer") ? (nextPath() ?? dashboardFor(pendingRole)) : dashboardFor(pendingRole);
    navigate({ to: dest as string });
  }


  async function handleResendOtp() {
    if (!otpEmail) return;
    const { error } = await supabase.auth.resend({ type: "signup", email: otpEmail });
    if (error) toast.error(error.message);
    else toast.success("A new code is on the way.");
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

          {otpEmail ? (
            <>
              <h1 className="font-serif text-3xl font-semibold text-foreground">Verify your email</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Enter the code we sent to <span className="font-medium text-foreground">{otpEmail}</span>.
              </p>
              <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4">
                <div className="space-y-1.5">
                  <Label>Verification code</Label>
                  <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                  <p className="text-xs text-muted-foreground">Codes are 4–6 digits, depending on your Supabase Auth settings.</p>
                </div>
                <Button type="submit" className="w-full" disabled={busy}>{busy ? "Verifying…" : "Verify & continue"}</Button>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <button type="button" onClick={() => { setOtpEmail(null); setOtpCode(""); }} className="hover:text-foreground">← Use a different email</button>
                  <button type="button" onClick={handleResendOtp} className="hover:text-foreground">Resend code</button>
                </div>
              </form>
            </>
          ) : (
            <>
              <h1 className="font-serif text-3xl font-semibold text-foreground">Welcome</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">Sign in to submit and track your manuscripts.</p>

              <Tabs defaultValue="signin" className="mt-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign in</TabsTrigger>
                  <TabsTrigger value="signup">Create account</TabsTrigger>
                </TabsList>
                <TabsContent value="signin">
                  <Button type="button" variant="outline" className="w-full" onClick={handleGoogle} disabled={busy}>
                    <GoogleIcon /> Continue with Google
                  </Button>
                  <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
                  </div>
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
                        We'll email a verification code before you can access your dashboard. Editorial roles also require admin approval.
                      </p>
                    </div>
                    <Button type="submit" className="w-full" disabled={busy}>{busy ? "Sending code…" : "Create account"}</Button>
                  </form>
                </TabsContent>
              </Tabs>
            </>
          )}
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

function GoogleIcon() {
  return (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.6 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1S8.7 6 12 6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.4 14.6 2.4 12 2.4 6.8 2.4 2.6 6.6 2.6 11.8s4.2 9.5 9.4 9.5c5.4 0 9-3.8 9-9.2 0-.6-.1-1.1-.2-1.6H12z"/>
    </svg>
  );
}
