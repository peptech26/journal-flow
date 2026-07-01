import { Link } from "@tanstack/react-router";
import { Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notification-bell";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground">
            <Leaf className="h-5 w-5" />
          </span>
          <div className="leading-tight">
            <div className="font-serif text-base font-semibold text-foreground">Ghana Journal</div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">of Forestry</div>
          </div>
        </Link>
        <nav className="hidden items-center gap-5 text-sm md:flex">
          <Link to="/" activeOptions={{ exact: true }} className="text-foreground/80 hover:text-foreground" activeProps={{ className: "text-foreground font-medium" }}>Library</Link>
          <Link to="/guidelines" className="text-foreground/80 hover:text-foreground" activeProps={{ className: "text-foreground font-medium" }}>Guidelines</Link>
          <Link to="/about" className="text-foreground/80 hover:text-foreground" activeProps={{ className: "text-foreground font-medium" }}>About</Link>
          <Link to="/contact" className="text-foreground/80 hover:text-foreground" activeProps={{ className: "text-foreground font-medium" }}>Contact</Link>
          <span className="h-4 w-px bg-border" />
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Testing</span>
          <Link to="/author" className="text-foreground/80 hover:text-foreground" activeProps={{ className: "text-foreground font-medium" }}>Author</Link>
          <Link to="/reviewer" className="text-foreground/80 hover:text-foreground" activeProps={{ className: "text-foreground font-medium" }}>Reviewer</Link>
          <Link to="/secretary" className="text-foreground/80 hover:text-foreground" activeProps={{ className: "text-foreground font-medium" }}>Secretary</Link>
          <Link to="/eic" className="text-foreground/80 hover:text-foreground" activeProps={{ className: "text-foreground font-medium" }}>EiC</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="ghost"><Link to="/auth">Sign in</Link></Button>
          <Button asChild size="sm"><Link to="/submit">Submit manuscript</Link></Button>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div>
          <div className="font-serif text-lg font-semibold text-foreground">Ghana Journal of Forestry</div>
          <p className="mt-2 text-sm text-muted-foreground">
            Peer-reviewed research on the forests, ecology and people of West Africa.
          </p>
        </div>
        <div>
          <h4 className="font-sans text-xs font-semibold uppercase tracking-wider text-foreground">Read</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-foreground">Latest articles</Link></li>
            <li><Link to="/about" className="hover:text-foreground">About the journal</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-sans text-xs font-semibold uppercase tracking-wider text-foreground">Authors</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/guidelines" className="hover:text-foreground">Submission guidelines</Link></li>
            <li><Link to="/submit" className="hover:text-foreground">Submit manuscript</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-sans text-xs font-semibold uppercase tracking-wider text-foreground">Contact</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/contact" className="hover:text-foreground">Editorial office</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto max-w-7xl px-4 py-5 text-xs text-muted-foreground sm:px-6 lg:px-8">
          © {new Date().getFullYear()} Ghana Journal of Forestry. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
