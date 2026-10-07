import type { ItemStatus } from "@/lib/gatekeeper";

const STYLE: Record<ItemStatus, { badge: string; dot: string }> = {
    GREEN: { badge: "border-emerald-300 bg-emerald-50 text-emerald-900", dot: "bg-emerald-600" },
    YELLOW: { badge: "border-amber-300 bg-amber-50 text-amber-900", dot: "bg-amber-500" },
    RED: { badge: "border-red-300 bg-red-50 text-red-900", dot: "bg-red-600" },
};

// variance = actual - expected. Colour is never the only signal: the label is text too.
export default function TrafficLight({
                                         status,
                                         variance,
                                     }: {
    status: ItemStatus | null;
    variance: number | null;
}) {
    if (!status || variance === null) {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-800">
        <span className="h-2 w-2 rounded-full bg-slate-400" aria-hidden="true" />
        Not counted
      </span>
        );
    }

    const label =
        status === "GREEN"
            ? "GREEN · Match"
            : status === "YELLOW"
                ? `YELLOW · Excess +${variance}`
                : `RED · Shortage −${Math.abs(variance)}`;

    const s = STYLE[status];
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${s.badge}`}
        >
      <span className={`h-2 w-2 rounded-full ${s.dot}`} aria-hidden="true" />
            {label}
    </span>
    );
}