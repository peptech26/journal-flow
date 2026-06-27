// Lightweight APA-ish reference normaliser. Not a full parser — fixes
// the most common author/typing issues so the editorial team isn't doing
// it by hand.
export function autoFormatReferences(raw: string): string {
  return raw
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      // Collapse whitespace
      let l = line.replace(/\s+/g, " ");
      // Normalise common separators
      l = l.replace(/\s*,\s*/g, ", ").replace(/\s*\.\s*/g, ". ");
      // Year in parentheses spacing
      l = l.replace(/\s*\(\s*(\d{4})\s*\)\s*/g, " ($1). ");
      // Volume(Issue) spacing
      l = l.replace(/(\d+)\s*\(\s*(\d+)\s*\)/g, "$1($2)");
      // Page ranges with en-dash
      l = l.replace(/(\d+)\s*-\s*(\d+)\b/g, "$1–$2");
      // DOI prefix
      l = l.replace(/\bdoi:\s*/i, "https://doi.org/");
      return l.replace(/\s{2,}/g, " ").trim();
    })
    .join("\n");
}
