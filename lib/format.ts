export function fmtDateTime(iso: string): string {
  return (
    new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }) + " UTC"
  );
}
