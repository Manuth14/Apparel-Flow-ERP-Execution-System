"use client";
import { useMemo, useState } from "react";
import { ORDERS, CuttingOrder, GateStatus, evaluateGate, shortageOf } from "@/lib/production";
import { stitch } from "@/lib/theme";
import Sidebar from "@/components/Sidebar";
import OrderDrawer from "@/components/OrderDrawer";
import StatusBadge from "@/components/StatusBadge";

type Filter = "all" | GateStatus;
const FILTERS: { key: Filter; label: string }[] = [
    { key: "all", label: "All" }, { key: "green", label: "Approved" },
    { key: "yellow", label: "Warning" }, { key: "red", label: "Blocked" },
];
const focus = "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#E4B23C]/60";

export default function DashboardPage() {
    const [nav, setNav] = useState(false);
    const [filter, setFilter] = useState<Filter>("all");
    const [selected, setSelected] = useState<CuttingOrder | null>(null);

    const rows = useMemo(() => ORDERS.map((o) => ({ o, gate: evaluateGate(o) })), []);
    const shown = rows.filter((r) => filter === "all" || r.gate.status === filter);
    const blockedCount = rows.filter((r) => r.gate.status === "red").length;
    const metrics = [
        { label: "Total orders", value: rows.length, hint: "Open cutting orders" },
        { label: "Active shortages", value: rows.filter((r) => r.o.components.some((c) => shortageOf(c) > 0)).length, hint: `${blockedCount} blocked from sewing` },
        { label: "Approved batches", value: rows.filter((r) => r.gate.status === "green").length, hint: "Ready for sewing" },
    ];

    return (
        <div className="flex min-h-screen bg-[#F6F5F1] text-[#14202F]">
            <Sidebar open={nav} onClose={() => setNav(false)} />
            <div className="flex min-w-0 flex-1 flex-col">
                <header className="relative flex items-center gap-3 px-4 py-5 sm:px-8">
                    <button onClick={() => setNav(true)} aria-label="Open navigation" className={`rounded-lg border border-[#D9D8D2] bg-white px-3 py-2 text-sm font-medium lg:hidden ${focus}`}>Menu</button>
                    <div>
                        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight">Production dashboard</h1>
                        <p className="text-sm text-[#5B6676]">Material gatekeeper for cutting and sewing</p>
                    </div>
                    <div className="absolute inset-x-4 bottom-0 h-[2px] opacity-80 sm:inset-x-8" style={stitch} aria-hidden />
                </header>

                <main className="flex-1 space-y-6 p-4 sm:p-8">
                    <section aria-label="Summary" className="grid gap-4 sm:grid-cols-3">
                        {metrics.map((m) => (
                            <div key={m.label} className="rounded-xl border border-[#E4E2DA] bg-white p-5">
                                <p className="text-sm font-medium text-[#5B6676]">{m.label}</p>
                                <p className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold">{m.value}</p>
                                <p className="mt-1 text-sm text-[#5B6676]">{m.hint}</p>
                            </div>
                        ))}
                    </section>

                    <section className="rounded-xl border border-[#E4E2DA] bg-white">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E4E2DA] p-4 sm:px-5">
                            <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">Cutting orders</h2>
                            <div role="group" aria-label="Filter by status" className="flex gap-1 rounded-lg bg-[#F6F5F1] p-1">
                                {FILTERS.map((f) => (
                                    <button key={f.key} onClick={() => setFilter(f.key)} aria-pressed={filter === f.key}
                                            className={`rounded-md px-3 py-1.5 text-sm font-medium ${focus} ${filter === f.key ? "bg-[#1B2F4E] text-white" : "text-[#14202F] hover:bg-white"}`}>
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[720px] text-left text-sm">
                                <thead className="border-b border-[#E4E2DA] bg-[#FAFAF8] text-[#5B6676]">
                                <tr>{["Order", "Style / recipe", "Qty", "Due", "Fabric allocated", "Wastage", "Status", ""].map((h, i) => <th key={i} scope="col" className="px-4 py-3 font-medium">{h || <span className="sr-only">Actions</span>}</th>)}</tr>
                                </thead>
                                <tbody className="divide-y divide-[#EEECE5]">
                                {shown.map(({ o, gate }) => {
                                    const f = o.components[0];
                                    return (
                                        <tr key={o.id} onClick={() => setSelected(o)} className="cursor-pointer hover:bg-[#FAFAF8]">
                                            <td className="px-4 py-3.5 font-semibold">{o.id}</td>
                                            <td className="px-4 py-3.5"><div>{o.style}</div><div className="text-xs text-[#5B6676]">{o.recipe}</div></td>
                                            <td className="px-4 py-3.5">{o.qty.toLocaleString()}</td>
                                            <td className="px-4 py-3.5">{o.due}</td>
                                            <td className="px-4 py-3.5">{Math.round((f.allocated / f.required) * 100)}%</td>
                                            <td className={`px-4 py-3.5 ${o.wastageActual > o.wastageCap ? "font-semibold text-amber-800" : ""}`}>{o.wastageActual}% / {o.wastageCap}%</td>
                                            <td className="px-4 py-3.5"><StatusBadge status={gate.status} /></td>
                                            <td className="px-4 py-3.5 text-right">
                                                <button onClick={(e) => { e.stopPropagation(); setSelected(o); }} className={`rounded-lg border border-[#D9D8D2] bg-white px-3 py-1.5 font-medium hover:bg-[#F6F5F1] ${focus}`}>
                                                    Details<span className="sr-only"> for {o.id}</span>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {!shown.length && <tr><td colSpan={8} className="px-4 py-10 text-center text-[#5B6676]">No orders match this filter.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </main>
            </div>
            {selected && <OrderDrawer key={selected.id} order={selected} onClose={() => setSelected(null)} />}
        </div>
    );
}