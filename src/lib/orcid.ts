// ORCID validator with ISO 7064 Mod 11-2 checksum.
export function isValidOrcid(input: string): boolean {
  const v = input.replace(/[\s-]/g, "").toUpperCase();
  if (!/^\d{15}[\dX]$/.test(v)) return false;
  let total = 0;
  for (let i = 0; i < 15; i++) total = (total + Number(v[i])) * 2;
  const remainder = total % 11;
  const result = (12 - remainder) % 11;
  const check = result === 10 ? "X" : String(result);
  return check === v[15];
}

export function formatOrcid(input: string): string {
  const v = input.replace(/[\s-]/g, "").toUpperCase().slice(0, 16);
  return v.replace(/(.{4})(?=.)/g, "$1-");
}
