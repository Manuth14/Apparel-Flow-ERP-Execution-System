// Fixed locale + UTC so server and client render identical text (no hydration mismatch).
export function fmtDateTime(iso: string): string {
  return (
    new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }) + " UTC"
  );
}
