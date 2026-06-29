export type Role = "author" | "reviewer" | "secretary" | "eic";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

const KEY = "gjf:current-user";

export function getCurrentUser(): CurrentUser {
  if (typeof window === "undefined") {
    return { id: "demo", name: "Demo User", email: "demo@gjf.org", role: "author" };
  }
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  const fallback: CurrentUser = { id: "demo", name: "Demo User", email: "demo@gjf.org", role: "author" };
  return fallback;
}

export function setCurrentUser(u: CurrentUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(u));
  window.dispatchEvent(new CustomEvent("gjf:user-change"));
}

export function ensureRole(role: Role) {
  // For demo: ensure current-user has this role when entering a role dashboard.
  const u = getCurrentUser();
  if (u.role !== role) setCurrentUser({ ...u, role });
}
