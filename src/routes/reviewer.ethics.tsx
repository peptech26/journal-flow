import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, FileText } from "lucide-react";

export const Route = createFileRoute("/reviewer/ethics")({
  component: EthicsPage,
});

function EthicsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Ethics & confidentiality</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The standards every reviewer for the Ghana Journal of Forestry agrees to uphold.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-4 w-4 text-primary" /> Confidentiality agreement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Manuscripts submitted to the Journal are privileged communications. Reviewers must not share the
            manuscript, its data, or its findings with any third party, and must not retain copies after the
            review is complete.
          </p>
          <p>
            <strong className="text-foreground">Generative AI:</strong> Reviewers must not upload, paste, or
            otherwise input any portion of a manuscript into generative AI tools (including chat assistants,
            translation tools, or summarisers) without prior written permission from the editor. Doing so
            constitutes a breach of confidentiality.
          </p>
          <p>
            Reviewers must not use information learned during peer review to advance their own work or that
            of collaborators before the manuscript is published.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Conflict of interest</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Reviewers must disclose any personal, professional, financial, or institutional relationship that
            could be perceived to bias their review. When in doubt, disclose.
          </p>
          <ul className="ml-5 list-disc space-y-1">
            <li>Recent collaboration or co-authorship with any author (within 3 years).</li>
            <li>Shared institution or funding source.</li>
            <li>Personal or family relationship with any author.</li>
            <li>Financial interest in the outcome of the work.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sub-reviewer policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Delegating a review (in whole or in part) requires the editor's prior written approval. The
            sub-reviewer must be named and is bound by the same confidentiality terms. Requests are submitted
            from the assignment page.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => window.print()}>
          <FileText className="mr-1.5 h-4 w-4" /> Print / save as PDF
        </Button>
      </div>
    </div>
  );
}
