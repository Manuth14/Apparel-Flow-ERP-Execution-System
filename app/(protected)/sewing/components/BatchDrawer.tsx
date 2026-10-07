"use client";

import { useEffect, useState } from "react";
import type { SewingBatch } from "@/lib/sewing-types";
import { fmtDateTime } from "@/lib/format";
import AuditCard from "./AuditCard";

const focus = "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#E4B23C]/60";

export default function BatchDrawer({
  batch,
  mode,
  onClose,
  onStarted,
}: {
  batch: SewingBatch;
  mode: "queue" | "started";
  onClose: () => void;
  onStarted: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !busy && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  async function start() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/sewing/${batch.id}/start`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not start sewing.");
      onStarted();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start sewing.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      style={{ colorScheme: "light" }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="batch-title"
        className="flex max-h-[92vh] w-full max-w-3xl flex-col rounded-xl border border-[#E4E2DA] bg-white text-[#14202F] shadow-xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-[#E4E2DA] p-5">
          <div>
            <h2 id="batch-title" className="font-[family-name:var(--font-display)] text-lg font-bold">
              Batch {batch.orderNo}
            </h2>
            <p className="text-sm text-[#5B6676]">
              {mode === "queue"
                ? "Review the verifier's counts, then release this batch to the assembly line."
                : `Sewing started${batch.sewingStartedAt ? ` ${fmtDateTime(batch.sewingStartedAt)}` : ""}${
                    batch.sewingStartedByName ? ` by ${batch.sewingStartedByName}` : ""
                  }.`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={`rounded-lg px-2 py-1 text-slate-700 hover:bg-[#F6F5F1] hover:text-[#14202F] ${focus}`}
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        <div className="overflow-y-auto p-5">
          {error && (
            <div role="alert" className="mb-4 rounded-lg border border-red-700 bg-red-50 p-3 text-sm text-red-900">
              {error}
            </div>
          )}
          <AuditCard batch={batch} />
        </div>

        <div className="flex justify-end gap-3 border-t border-[#E4E2DA] p-4">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className={`rounded-lg border border-[#6B7280] bg-white px-4 py-2 text-sm font-medium text-[#14202F] hover:bg-[#F6F5F1] disabled:opacity-60 ${focus}`}
          >
            Close
          </button>
          {mode === "queue" && (
            <button
              type="button"
              onClick={start}
              disabled={busy}
              className={`rounded-lg bg-[#1B2F4E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#14243C] disabled:cursor-not-allowed disabled:opacity-60 ${focus}`}
            >
              {busy ? "Starting..." : "Start Sewing Assembly"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
