import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const search = z.object({ mode: z.enum(["signin", "signup"]).optional() });

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Ghana Journal of Forestry" },
      { name: "description", content: "Sign in or create an account to submit manuscripts or review for the Ghana Journal of Forestry." },
    ],
  }),
  validateSearch: search,
  component: Auth,
});

function Auth() {
  const { mode: initial } = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">(initial ?? "signin");
  const [role, setRole] = useState<"author" | "reviewer">("author");

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between bg-primary p-10 text-primary-foreground md:flex">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/15">
            <Leaf className="h-4.5 w-4.5" />
          </span>
          <span className="font-serif text-lg">Ghana Journal of Forestry</span>
        </Link>
        <div>
          <p className="font-serif text-3xl leading-snug tracking-tight">
            "Sound science, applied to the forests we share."
          </p>
          <p className="mt-3 text-sm text-primary-foreground/70">— Editorial board</p>
        </div>
        <p className="text-xs text-primary-foreground/60">
          © {new Date().getFullYear()} GJF · ISSN forthcoming
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex rounded-full border border-border bg-muted p-1 text-sm">
            <button
              onClick={() => setMode("signin")}
              className={`flex-1 rounded-full px-4 py-1.5 transition-colors ${
                mode === "signin" ? "bg-background shadow-sm" : "text-muted-foreground"
              }`}
            >
              Sign in
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 rounded-full px-4 py-1.5 transition-colors ${
                mode === "signup" ? "bg-background shadow-sm" : "text-muted-foreground"
              }`}
            >
              Create account
            </button>
          </div>

          <h1 className="font-serif text-3xl tracking-tight">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Sign in to manage your submissions and reviews."
              : "Authors and reviewers can register here. Editorial roles require admin approval."}
          </p>

          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            {mode === "signup" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName">First name</Label>
                  <Input id="firstName" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input id="lastName" required />
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required autoComplete="email" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {mode === "signin" && (
                  <button type="button" className="text-xs text-muted-foreground hover:text-foreground">
                    Forgot password?
                  </button>
                )}
              </div>
              <Input
                id="password"
                type="password"
                required
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
              />
            </div>

            {mode === "signup" && (
              <div className="space-y-2 rounded-lg border border-border bg-muted/40 p-3">
                <Label className="text-sm">I'm registering as</Label>
                <RadioGroup
                  value={role}
                  onValueChange={(v) => setRole(v as typeof role)}
                  className="grid grid-cols-2 gap-2"
                >
                  <label className={`flex cursor-pointer items-start gap-2 rounded-md border p-3 text-sm transition-colors ${role === "author" ? "border-primary bg-background" : "border-border"}`}>
                    <RadioGroupItem value="author" className="mt-0.5" />
                    <span>
                      <span className="block font-medium">Author</span>
                      <span className="block text-xs text-muted-foreground">Submit manuscripts</span>
                    </span>
                  </label>
                  <label className={`flex cursor-pointer items-start gap-2 rounded-md border p-3 text-sm transition-colors ${role === "reviewer" ? "border-primary bg-background" : "border-border"}`}>
                    <RadioGroupItem value="reviewer" className="mt-0.5" />
                    <span>
                      <span className="block font-medium">Reviewer</span>
                      <span className="block text-xs text-muted-foreground">Review submissions</span>
                    </span>
                  </label>
                </RadioGroup>
                <p className="text-xs text-muted-foreground">
                  Editorial Secretary, Editor-in-Chief, and Admin roles require admin approval — request access from your account after signing in.
                </p>
              </div>
            )}

            <Button type="submit" className="w-full" size="lg">
              {mode === "signin" ? "Sign in" : "Create account"}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                className="font-medium text-primary hover:underline"
              >
                {mode === "signin" ? "Create an account" : "Sign in"}
              </button>
            </p>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">← Back to library</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
