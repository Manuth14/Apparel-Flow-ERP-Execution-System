'use client';

import { useMemo, useState } from "react";
import { ORDERS, evaluateGate, shortageOf } from "@/lib/production";
import { stitch } from "@/lib/theme";
import StatusBadge from "@/components/StatusBadge";

export default function ManagerDashboardPage() {
    const [filter, setFilter] = useState<"all" | "blocked" | "warning">("all");

    const rows = useMemo(() => ORDERS.map((o) => ({ o, gate: evaluateGate(o) })), []);

    // Manager specific metrics
    const totalOrders = rows.length;
    const blockedRows = rows.filter((r) => r.gate.status === "red");
    const warningRows = rows.filter((r) => r.gate.status === "yellow");
    const approvedRows = rows.filter((r) => r.gate.status === "green");

    const shown = rows.filter((r) => {
        if (filter === "blocked") return r.gate.status === "red";
        if (filter === "warning") return r.gate.status === "yellow";
        return true;
    });

    const handleManagerOverride = (orderId: string) => {
        alert(`Manager Override applied for ${orderId}. Batch released to sewing with caution flag.`);
    };

    return (
        <div className="flex min-h-screen bg-[#F6F5F1] text-[#14202F]">
            <div className="flex min-w-0 flex-1 flex-col">
                <header className="relative flex items-center justify-between px-4 py-5 sm:px-8 bg-white border-b border-[#E4E2DA]">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="rounded bg-[#1B2F4E] px-2 py-0.5 text-xs font-semibold text-white">Manager Portal</span>
                            <span className="text-xs text-[#5B6676]">Server-Enforced RBAC Active</span>
                        </div>
                        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight mt-1">Production Manager Overview</h1>
                        <p className="text-sm text-[#5B6676]">Factory-wide floor analytics, bottlenecks, and gatekeeper overrides</p>
                    </div>
                    <a href="/dashboard" className="rounded-lg border border-[#D9D8D2] bg-white px-4 py-2 text-sm font-medium hover:bg-[#F6F5F1]">
                        Switch to Cutting View
                    </a>
                    <div className="absolute inset-x-4 bottom-0 h-0.5 opacity-80 sm:inset-x-8" style={stitch} aria-hidden />
                </header>

                <main className="flex-1 space-y-6 p-4 sm:p-8">
                    {/* High-level Analytics Summary Cards */}
                    <section aria-label="Manager Metrics" className="grid gap-4 sm:grid-cols-4">
                        <div className="rounded-xl border border-[#E4E2DA] bg-white p-5">
                            <p className="text-sm font-medium text-[#5B6676]">Total Active Batches</p>
                            <p className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold">{totalOrders}</p>
                            <p className="mt-1 text-sm text-[#5B6676]">Across all sewing lines</p>
                        </div>
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5">
                            <p className="text-sm font-medium text-emerald-800">Approved (Green)</p>
                            <p className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold text-emerald-900">{approvedRows.length}</p>
                            <p className="mt-1 text-sm text-emerald-700">Moving smoothly</p>
                        </div>
                        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5">
                            <p className="text-sm font-medium text-amber-800">Warnings (Yellow)</p>
                            <p className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold text-amber-900">{warningRows.length}</p>
                            <p className="mt-1 text-sm text-amber-700">Exceeding wastage caps</p>
                        </div>
                        <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-5">
                            <p className="text-sm font-medium text-rose-800">Hard Stops (Red)</p>
                            <p className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold text-rose-900">{blockedRows.length}</p>
                            <p className="mt-1 text-sm text-rose-700">Material shortages detected</p>
                        </div>
                    </section>

                    {/* Actionable Bottlenecks & Approvals Table */}
                    <section className="rounded-xl border border-[#E4E2DA] bg-white">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E4E2DA] p-4 sm:px-5">
                            <div>
                                <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">Factory Bottlenecks & Gatekeeper Logs</h2>
                                <p className="text-xs text-[#5B6676]">Batches requiring management intervention or material replenishment</p>
                            </div>
                            <div role="group" aria-label="Filter bottlenecks" className="flex gap-1 rounded-lg bg-[#F6F5F1] p-1">
                                {[
                                    { key: "all", label: "All Active" },
                                    { key: "blocked", label: "Blocked Only (Red)" },
                                    { key: "warning", label: "Warnings (Yellow)" },
                                ].map((f) => (
                                    <button key={f.key} onClick={() => setFilter(f.key as any)} aria-pressed={filter === f.key}
                                            className={`rounded-md px-3 py-1.5 text-sm font-medium ${filter === f.key ? "bg-[#1B2F4E] text-white" : "text-[#14202F] hover:bg-white"}`}>
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[720px] text-left text-sm">
                                <thead className="border-b border-[#E4E2DA] bg-[#FAFAF8] text-[#5B6676]">
                                <tr>
                                    {["Order ID", "Style / Recipe", "Qty", "Gate Status", "Bottleneck Reason", "Manager Action"].map((h, i) => (
                                        <th key={i} scope="col" className="px-4 py-3 font-medium">{h}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-[#EEECE5]">
                                {shown.map(({ o, gate }) => (
                                    <tr key={o.id} className="hover:bg-[#FAFAF8]">
                                        <td className="px-4 py-3.5 font-semibold">{o.id}</td>
                                        <td className="px-4 py-3.5">
                                            <div>{o.style}</div>
                                            <div className="text-xs text-[#5B6676]">{o.recipe}</div>
                                        </td>
                                        <td className="px-4 py-3.5">{o.qty.toLocaleString()}</td>
                                        <td className="px-4 py-3.5"><StatusBadge status={gate.status} /></td>
                                        <td className="px-4 py-3.5 text-xs text-gray-700">
                                            {gate.status === "red" ? (
                                                <span className="text-rose-700 font-medium">Material Shortage: {o.components.filter(c => c.allocated < c.required).map(c => `${c.name} (${c.required - c.allocated} ${c.unit})`).join(", ")}</span>
                                            ) : gate.status === "yellow" ? (
                                                <span className="text-amber-800 font-medium">Wastage Alert: Actual {o.wastageActual}% exceeds cap {o.wastageCap}%</span>
                                            ) : (
                                                <span className="text-emerald-700">No bottlenecks reported</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            {gate.status === "red" ? (
                                                <button onClick={() => handleManagerOverride(o.id)} className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500 shadow-sm">
                                                    Force Override
                                                </button>
                                            ) : (
                                                <span className="text-xs text-gray-400 font-medium">No action needed</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {!shown.length && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-10 text-center text-[#5B6676]">No bottlenecks found matching this filter. Great job on the floor!</td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}