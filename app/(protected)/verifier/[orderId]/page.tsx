"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { evaluateGate } from "@/lib/gatekeeper";
import type { ItemRow, OrderDetail } from "../components/types";
import ApproveRejectBar from "@/app/(protected)/verifier/components/ApproveRejectBar";
import VerificationTable from "@/app/(protected)/verifier/components/VerificationTable";
import RejectDialog from "@/app/(protected)/verifier/components/RejectDialog";
import {fmtDateTime} from "@/lib/format";

const WHOLE = /^\d+$/;
const MAX_COUNT = 1000000;

export default function VerificationTerminalPage() {
    const { orderId } = useParams<{ orderId: string }>();
    const router = useRouter();

    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [inputs, setInputs] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [busy, setBusy] = useState(false);
    const [notice, setNotice] = useState<{ type: "ok" | "error"; text: string } | null>(null);
    const [rejectOpen, setRejectOpen] = useState(false);

    const load = useCallback(async () => {
        try {
            const res = await fetch(`/api/orders/${orderId}`);
            const data = await res.json().catch(() => null);
            if (!res.ok) throw new Error(data?.error ?? "Failed to load order.");
            setOrder(data as OrderDetail);
            setInputs(
                Object.fromEntries((data as OrderDetail).items.map((i) => [i.id, i.actualQty === null ? "" : String(i.actualQty)])),
            );
        } catch (e) {
            setLoadError(e instanceof Error ? e.message : "Failed to load order.");
        } finally {
            setLoading(false);
        }
    }, [orderId]);

    useEffect(() => {
        load();
    }, [load]);

    // Rows with parsed values + inline validation errors
    const rows: ItemRow[] = useMemo(() => {
        if (!order) return [];
        return order.items.map((i) => {
            const raw = (inputs[i.id] ?? "").trim();
            if (raw === "") return { id: i.id, componentName: i.componentName, expectedQty: i.expectedQty, raw: inputs[i.id] ?? "", error: null, value: null };
            const valid = WHOLE.test(raw) && Number(raw) <= MAX_COUNT;
            return {
                id: i.id,
                componentName: i.componentName,
                expectedQty: i.expectedQty,
                raw: inputs[i.id] ?? "",
                error: valid ? null : "Whole numbers only (0 to 1,000,000). No negatives, decimals or letters.",
                value: valid ? Number(raw) : null,
            };
        });
    }, [order, inputs]);

    const live = useMemo(() => evaluateGate(rows.map((r) => ({ expectedQty: r.expectedQty, actualQty: r.value }))), [rows]);
    const saved = useMemo(() => (order ? evaluateGate(order.items) : null), [order]);

    const savedById = useMemo(() => new Map((order?.items ?? []).map((i) => [i.id, i.actualQty])), [order]);
    const hasError = rows.some((r) => r.error);
    const allFilled = rows.length > 0 && rows.every((r) => r.value !== null);
    const dirty = rows.some((r) => r.error || r.value !== savedById.get(r.id));
    const isPending = order?.status === "PENDING_VERIFICATION";

    // null = approval allowed. The server re-checks all of this independently.
    let blockedReason: string | null = null;
    if (!isPending) blockedReason = "This batch is no longer pending verification.";
    else if (live.red > 0) blockedReason = `${live.red} component(s) have a shortage. Approval is blocked; reject the batch with a reason.`;
    else if (hasError || !allFilled) blockedReason = "Count every component (whole numbers only) to enable approval.";
    else if (dirty) blockedReason = "Save your counts to enable approval.";
    else if (!saved?.canApprove) blockedReason = "Saved counts do not satisfy the gatekeeper rules.";

    async function post(path: string, body?: unknown) {
        const res = await fetch(`/api/orders/${orderId}/${path}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: body ? JSON.stringify(body) : undefined,
        });
        const data = await res.json().catch(() => ({}));
        return { ok: res.ok, data };
    }

    async function saveCounts() {
        if (!allFilled || hasError) return;
        setBusy(true);
        setNotice(null);
        const { ok, data } = await post("count", {
            counts: rows.map((r) => ({ itemId: r.id, actualQty: r.value })),
        });
        if (ok) {
            await load();
            setNotice({ type: "ok", text: "Counts saved." });
        } else {
            setNotice({ type: "error", text: data.error ?? "Failed to save counts." });
        }
        setBusy(false);
    }

    async function approve() {
        setBusy(true);
        setNotice(null);
        const { ok, data } = await post("approve");
        if (ok) {
            router.push("/verifier");
            router.refresh();
            return;
        }
        setNotice({ type: "error", text: data.error ?? "Approval failed." });
        await load();
        setBusy(false);
    }

    async function reject(note: string): Promise<string | null> {
        const { ok, data } = await post("reject", { note });
        if (ok) {
            router.push("/verifier");
            router.refresh();
            return null;
        }
        return data.error ?? "Rejection failed.";
    }

    if (loading) return <main className="p-8 text-[#5B6676]">Loading order...</main>;

    if (loadError || !order) {
        return (
            <main className="space-y-4 p-4 sm:p-8">
                <div role="alert" className="rounded-lg border border-red-700 bg-red-50 p-3 text-sm text-red-900">
                    {loadError || "Order not found."}
                </div>
                <Link href="/verifier" className="text-sm font-medium text-blue-900 underline">
                    Back to pending batches
                </Link>
            </main>
        );
    }

    const overCap = order.wastagePct > order.recipe.wastageCap;

    return (
        <main className="space-y-6 p-4 sm:p-8">
            <div>
                <Link href="/verifier" className="text-sm font-medium text-blue-900 underline">
                    ← Back to pending batches
                </Link>
                <h1 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight">
                    Verify {order.orderNo}
                </h1>
                <p className="text-sm text-[#5B6676]">
                    {order.recipe.name} ({order.recipe.recipeCode}) · {order.targetQty.toLocaleString("en-US")} garments · Roll{" "}
                    {order.fabricRollId}
                </p>
            </div>

            {/* Fabric wastage */}
            <section aria-label="Fabric wastage" className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-[#E4E2DA] bg-white p-5">
                    <p className="text-sm font-medium text-[#5B6676]">Expected fabric</p>
                    <p className="mt-1 text-2xl font-bold">{order.expectedFabricYds.toLocaleString("en-US", { maximumFractionDigits: 2 })} yds</p>
                </div>
                <div className="rounded-xl border border-[#E4E2DA] bg-white p-5">
                    <p className="text-sm font-medium text-[#5B6676]">Actual fabric used</p>
                    <p className="mt-1 text-2xl font-bold">{order.actualFabricYds.toLocaleString("en-US")} yds</p>
                </div>
                <div className={`rounded-xl border p-5 ${overCap ? "border-amber-300 bg-amber-50" : "border-emerald-300 bg-emerald-50"}`}>
                    <p className={`text-sm font-medium ${overCap ? "text-amber-800" : "text-emerald-800"}`}>
                        Fabric wastage (cap {order.recipe.wastageCap}%)
                    </p>
                    <p className={`mt-1 text-2xl font-bold ${overCap ? "text-amber-900" : "text-emerald-900"}`}>{order.wastagePct}%</p>
                    {overCap && <p className="mt-1 text-xs text-amber-900">Over the recipe cap. Recorded in the audit trail.</p>}
                </div>
            </section>

            {/* Previous decisions (e.g. an earlier rejection of this batch) */}
            {order.logs.length > 0 && (
                <section aria-label="Previous decisions" className="rounded-xl border border-[#E4E2DA] bg-white p-5">
                    <h2 className="font-[family-name:var(--font-display)] text-base font-semibold">Previous decisions</h2>
                    <ul className="mt-3 space-y-2 text-sm">
                        {order.logs.map((l) => (
                            <li key={l.id} className="rounded-lg border border-[#EEECE5] bg-[#FAFAF8] p-3">
                                <span className="font-semibold">{l.decision}</span> by {l.verifierName} · {fmtDateTime(l.timestamp)}
                                {l.rejectionNote && <p className="mt-1 text-red-900">Reason: {l.rejectionNote}</p>}
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {notice && (
                <div
                    role={notice.type === "error" ? "alert" : "status"}
                    className={`rounded-lg border p-3 text-sm ${
                        notice.type === "error" ? "border-red-700 bg-red-50 text-red-900" : "border-emerald-700 bg-emerald-50 text-emerald-900"
                    }`}
                >
                    {notice.text}
                </div>
            )}

            {/* Counting terminal */}
            <section className="rounded-xl border border-[#E4E2DA] bg-white">
                <div className="border-b border-[#E4E2DA] p-4 sm:px-5">
                    <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">Component count</h2>
                    <p className="text-sm text-[#5B6676]">Enter the physical piece count for every component.</p>
                </div>

                <VerificationTable
                    rows={rows}
                    disabled={busy || !isPending}
                    onChange={(id, value) => {
                        setNotice(null);
                        setInputs((prev) => ({ ...prev, [id]: value }));
                    }}
                />

                <ApproveRejectBar
                    summary={live}
                    blockedReason={blockedReason}
                    canSave={isPending && allFilled && !hasError && dirty}
                    busy={busy}
                    onSave={saveCounts}
                    onApprove={approve}
                    onReject={() => setRejectOpen(true)}
                />
            </section>

            <RejectDialog isOpen={rejectOpen} onClose={() => setRejectOpen(false)} onConfirm={reject} />
        </main>
    );
}