"use client";

import { useEffect, useState } from "react";

const MIN = 5;
const MAX = 500;

export default function RejectDialog({
                                         isOpen,
                                         onClose,
                                         onConfirm,
                                     }: {
    isOpen: boolean;
    onClose: () => void;
    // Resolves to an error message on failure, or null on success
    onConfirm: (note: string) => Promise<string | null>;
}) {
    const [note, setNote] = useState("");
    const [touched, setTouched] = useState(false);
    const [busy, setBusy] = useState(false);
    const [serverError, setServerError] = useState("");

    useEffect(() => {
        if (isOpen) {
            setNote("");
            setTouched(false);
            setServerError("");
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && !busy && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen, busy, onClose]);

    if (!isOpen) return null;

    const trimmed = note.trim();
    const error = !trimmed
        ? "A rejection reason is required."
        : trimmed.length < MIN
            ? `Reason must be at least ${MIN} characters.`
            : trimmed.length > MAX
                ? `Reason must be at most ${MAX} characters.`
                : "";

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setTouched(true);
        if (error || busy) return;
        setBusy(true);
        setServerError("");
        const err = await onConfirm(trimmed);
        if (err) setServerError(err);
        setBusy(false);
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            style={{ colorScheme: "light" }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="reject-title"
                className="w-full max-w-lg rounded-xl border border-[#E4E2DA] bg-white p-6 text-[#14202F] shadow-xl"
            >
                <h3 id="reject-title" className="font-[family-name:var(--font-display)] text-lg font-bold">
                    Reject batch
                </h3>
                <p className="mt-1 text-sm text-[#5B6676]">
                    The batch returns to the Cutting Supervisor for re-cutting. The reason is recorded in the audit trail.
                </p>

                {serverError && (
                    <div role="alert" className="mt-4 rounded-lg border border-red-700 bg-red-50 p-3 text-sm text-red-900">
                        {serverError}
                    </div>
                )}

                <form onSubmit={submit} noValidate className="mt-4 space-y-4">
                    <div>
                        <label htmlFor="reject-note" className="block text-xs font-semibold uppercase tracking-wide">
                            Reason (required)
                        </label>
                        <textarea
                            id="reject-note"
                            rows={4}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            onBlur={() => setTouched(true)}
                            placeholder="e.g. 4 Sleeve Cuffs short; fabric defect on bundle 3"
                            aria-invalid={touched && !!error}
                            aria-describedby={touched && error ? "reject-err" : undefined}
                            className={`mt-1 block w-full rounded-lg border bg-white p-2.5 text-sm text-[#14202F] placeholder:text-[#5B6676] focus:outline-none focus:ring-4 focus:ring-[#E4B23C]/60 ${
                                touched && error ? "border-red-700" : "border-[#6B7280] focus:border-[#1B2F4E]"
                            }`}
                        />
                        <div className="mt-1 flex justify-between gap-3">
                            {touched && error ? (
                                <p id="reject-err" className="text-sm text-red-800">{error}</p>
                            ) : (
                                <span />
                            )}
                            <p className="text-xs text-[#5B6676]">{trimmed.length}/{MAX}</p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 border-t border-[#E4E2DA] pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={busy}
                            className="rounded-lg border border-[#6B7280] bg-white px-4 py-2 text-sm font-medium text-[#14202F] hover:bg-[#F6F5F1] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#E4B23C]/60 disabled:opacity-60"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={busy}
                            className="rounded-lg bg-red-800 px-4 py-2 text-sm font-semibold text-white hover:bg-red-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#E4B23C]/60 disabled:opacity-60"
                        >
                            {busy ? "Rejecting..." : "Reject batch"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}