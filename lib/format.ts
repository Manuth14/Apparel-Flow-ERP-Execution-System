const dateTime = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" });

export function fmtDateTime(iso: string): string {
  return dateTime.format(new Date(iso));
}