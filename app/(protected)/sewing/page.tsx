"use client";

import { useCallback, useEffect, useState } from "react";
import type { SewingBatch } from "@/lib/sewing-types";
import QueueTable from "./components/QueueTable";
import BatchDrawer from "./components/BatchDrawer";

async function getJson(url: string): Promise<SewingBatch[]> {
    const res = await fetch(url);
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error ?? "Failed to load sewing data.");
    return Array.isArray(data) ? data : [];
}

export default function SewingPage() {
    const [queue, setQueue] = useState<SewingBatch[]>([]);
    const [started, setStarted] = useState<SewingBatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selected, setSelected] = useState<{ batch: SewingBatch; mode: "queue" | "started" } | null>(null);

    const load = useCallback(async () => {
        try {
            const [q, s] = await Promise.all([getJson("/api/sewing/queue"), getJson("/api/sewing/started")]);
            setQueue(q);
            setStarted(s);
            setError("");
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load sewing data.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    return (
        <main className="space-y-6 p-4 sm:p-8">
            <div>
                <h1 className="font-(family-name:--font-display) text-2xl font-bold tracking-tight">Sewing Queue</h1>
                <p className="text-sm text-[#5B6676]">
                    Only batches signed off by a Cutting Verifier appear here.
                </p>
            </div>

            <section aria-label="Summary" className="grid grid-cols-2 gap-2 sm:gap-4">
                <div className="min-w-0 rounded-xl border border-emerald-300 bg-emerald-50 p-3 sm:p-5">
                    <p className="text-xs font-medium text-emerald-800 sm:text-sm">Ready for sewing</p>
                    <p className="mt-1 font-(family-name:--font-display) text-3xl font-bold text-emerald-900 sm:text-4xl">
                        {loading ? "–" : queue.length}
                    </p>
                </div>
                <div className="min-w-0 rounded-xl border border-slate-300 bg-slate-100 p-3 sm:p-5">
                    <p className="text-xs font-medium text-slate-800 sm:text-sm">In sewing</p>
                    <p className="mt-1 font-(family-name:--font-display) text-3xl font-bold text-slate-900 sm:text-4xl">
                        {loading ? "–" : started.length}
                    </p>
                </div>
            </section>

            {error && (
                <div role="alert" className="rounded-lg border border-red-700 bg-red-50 p-3 text-sm text-red-900">
                    {error}
                </div>
            )}

            <section className="rounded-xl border border-[#E4E2DA] bg-white">
                <div className="border-b border-[#E4E2DA] p-4 sm:px-5">
                    <h2 className="font-(family-name:--font-display) text-lg font-semibold">Verified batches</h2>
                </div>
                {loading ? (
                    <div className="py-10 text-center text-[#5B6676]">Loading queue...</div>
                ) : (
                    <QueueTable
                        batches={queue}
                        mode="queue"
                        onSelect={(batch) => setSelected({ batch, mode: "queue" })}
                        emptyMessage="No verified batches are waiting. Approved batches appear here."
                    />
                )}
            </section>

            {started.length > 0 && (
                <section className="rounded-xl border border-[#E4E2DA] bg-white">
                    <div className="border-b border-[#E4E2DA] p-4 sm:px-5">
                        <h2 className="font-(family-name:--font-display) text-lg font-semibold">In sewing</h2>
                    </div>
                    <QueueTable
                        batches={started}
                        mode="started"
                        onSelect={(batch) => setSelected({ batch, mode: "started" })}
                        emptyMessage="Nothing in sewing yet."
                    />
                </section>
            )}

            {selected && (
                <BatchDrawer
                    key={selected.batch.id}
                    batch={selected.batch}
                    mode={selected.mode}
                    onClose={() => setSelected(null)}
                    onStarted={async () => {
                        setSelected(null);
                        await load();
                    }}
                />
            )}
        </main>
    );
}