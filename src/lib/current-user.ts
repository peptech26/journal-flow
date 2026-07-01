import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Role = "author" | "reviewer" | "secretary" | "eic";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

const KEY = "gjf:current-user";

// Synchronous accessor — reads cached current user (set by useCurrentUser or
// the auth flow). Demo fallback so dashboards still render in the preview
// before the user signs in.
export function getCurrentUser(): CurrentUser {
  if (typeof window === "undefined") {
    return { id: "demo", name: "Demo User", email: "demo@gjf.org", role: "author" };
  }
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { id: "demo", name: "Demo User", email: "demo@gjf.org", role: "author" };
}

export function setCurrentUser(u: CurrentUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(u));
  window.dispatchEvent(new CustomEvent("gjf:user-change"));
}

export function clearCurrentUser() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent("gjf:user-change"));
}

function roleFromDb(db: string | null | undefined): Role {
  switch (db) {
    case "reviewer": return "reviewer";
    case "editorial_secretary": return "secretary";
    case "editor_in_chief": return "eic";
    case "admin": return "secretary";
    default: return "author";
  }
}

// Hook: hydrates the cached user from Supabase session + user_roles.
export function useCurrentUser(): CurrentUser {
  const [user, setUser] = useState<CurrentUser>(getCurrentUser);
  useEffect(() => {
    let cancelled = false;

    async function hydrate(session: { user: { id: string; email?: string | null } } | null) {
      if (!session?.user) return;
      const { user: u } = session;
      const [{ data: profile }, { data: roles }] = await Promise.all([
        supabase.from("profiles").select("full_name").eq("id", u.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", u.id),
      ]);
      if (cancelled) return;
      // Pick highest-priority role.
      const priority = ["admin", "editor_in_chief", "editorial_secretary", "reviewer", "author"];
      const picked = priority.find((p) => roles?.some((r) => r.role === p));
      const next: CurrentUser = {
        id: u.id,
        name: profile?.full_name ?? u.email ?? "User",
        email: u.email ?? "",
        role: roleFromDb(picked ?? "author"),
      };
      setCurrentUser(next);
      setUser(next);
    }

    supabase.auth.getSession().then(({ data }) => hydrate(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        clearCurrentUser();
        setUser(getCurrentUser());
        return;
      }
      if (session && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED")) {
        hydrate(session);
      }
    });

    const onChange = () => setUser(getCurrentUser());
    window.addEventListener("gjf:user-change", onChange);

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
      window.removeEventListener("gjf:user-change", onChange);
    };
  }, []);
  return user;
}

function roleToDb(r: Role): "author" | "reviewer" | "editorial_secretary" | "editor_in_chief" {
  switch (r) {
    case "author": return "author";
    case "reviewer": return "reviewer";
    case "secretary": return "editorial_secretary";
    case "eic": return "editor_in_chief";
  }
}

export function ensureRole(role: Role) {
  // Testing mode: cache the role locally AND grant it in the DB so RLS
  // policies (has_role) allow the signed-in user to see queues for that role.
  const u = getCurrentUser();
  if (u.role !== role) setCurrentUser({ ...u, role });
  (async () => {
    const { data } = await supabase.auth.getUser();
    const uid = data.user?.id;
    if (!uid) return;
    await supabase
      .from("user_roles")
      .upsert({ user_id: uid, role: roleToDb(role) }, { onConflict: "user_id,role" });
  })();
}
