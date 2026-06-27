import { Link } from "@tanstack/react-router";
import { Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Leaf className="h-4.5 w-4.5" strokeWidth={2.2} />
          </span>
          <span className="font-serif text-lg leading-none font-semibold tracking-tight">
            Ghana Journal<br />
            <span className="text-xs font-sans font-medium uppercase tracking-[0.18em] text-muted-foreground">
              of Forestry
            </span>
          </span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm md:flex">
          <Link to="/" className="text-foreground/80 hover:text-foreground transition-colors">
            Library
          </Link>
          <Link to="/about" className="text-foreground/80 hover:text-foreground transition-colors">
            About
          </Link>
          <Link to="/submit" className="text-foreground/80 hover:text-foreground transition-colors">
            Submit
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/auth">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/submit">Submit manuscript</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <p className="font-serif text-lg font-semibold">Ghana Journal of Forestry</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Peer-reviewed research on forests, biodiversity, and sustainable land use in West Africa.
          </p>
        </div>
        <div className="text-sm">
          <p className="font-medium">Journal</p>
          <ul className="mt-2 space-y-1.5 text-muted-foreground">
            <li>Aims & scope</li>
            <li>Editorial board</li>
            <li>Author guidelines</li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-medium">Contact</p>
          <ul className="mt-2 space-y-1.5 text-muted-foreground">
            <li>editor@gjf.org.gh</li>
            <li>Forestry Research Institute of Ghana</li>
            <li>Kumasi, Ghana</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Ghana Journal of Forestry. ISSN forthcoming.
      </div>
    </footer>
  );
}
