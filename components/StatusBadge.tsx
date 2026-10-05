import { GateStatus } from "@/lib/production";

const CFG: Record<GateStatus, { label: string; icon: string; cls: string }> = {
    green: { label: "Approved", icon: "✓", cls: "bg-emerald-950 text-emerald-200 ring-emerald-500" },
    yellow: { label: "Warning", icon: "!", cls: "bg-amber-950 text-amber-100 ring-amber-500" },
    red: { label: "Blocked", icon: "✕", cls: "bg-red-950 text-red-100 ring-red-500" },
};

export default function StatusBadge({ status }: { status: GateStatus }) {
    const c = CFG[status];
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${c.cls}`}>
      <span aria-hidden className="text-sm leading-none">{c.icon}</span>
            {c.label}
    </span>
    );
}