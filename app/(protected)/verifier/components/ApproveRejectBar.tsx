"use client";

const focus = "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#E4B23C]/60";

export default function ApproveRejectBar({
                                             summary,
                                             blockedReason,
                                             canSave,
                                             busy,
                                             onSave,
                                             onApprove,
                                             onReject,
                                         }: {
    summary: { green: number; yellow: number; red: number; uncounted: number };
    blockedReason: string | null;
    canSave: boolean;
    busy: boolean;
    onSave: () => void;
    onApprove: () => void;
    onReject: () => void;
}) {
    const approveDisabled = blockedReason !== null || busy;

    return (
        <div className="space-y-4 border-t border-[#E4E2DA] p-4 sm:p-5">
            <ul className="flex flex-wrap gap-2 text-xs font-semibold" aria-label="Count summary">
                <li className="rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-emerald-900">
                    {summary.green} match
                </li>
                <li className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-amber-900">
                    {summary.yellow} excess
                </li>
                <li className="rounded-full border border-red-300 bg-red-50 px-2.5 py-1 text-red-900">
                    {summary.red} shortage
                </li>
                <li className="rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1 text-slate-800">
                    {summary.uncounted} not counted
                </li>
            </ul>

            {blockedReason && (
                <p id="approve-blocked" role="status" className="text-sm font-medium text-red-900">
                    {blockedReason}
                </p>
            )}

            <div className="flex flex-wrap justify-end gap-3">
                <button
                    type="button"
                    onClick={onSave}
                    disabled={!canSave || busy}
                    className={`rounded-lg border border-[#1B2F4E] bg-white px-4 py-2 text-sm font-semibold text-[#1B2F4E] hover:bg-[#F6F5F1] disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-600 ${focus}`}
                >
                    Save counts
                </button>

                <button
                    type="button"
                    onClick={onReject}
                    disabled={busy}
                    className={`rounded-lg border border-red-800 bg-white px-4 py-2 text-sm font-semibold text-red-900 hover:bg-red-50 disabled:opacity-60 ${focus}`}
                >
                    Reject Batch
                </button>

                <button
                    type="button"
                    onClick={onApprove}
                    disabled={approveDisabled}
                    aria-describedby={blockedReason ? "approve-blocked" : undefined}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold ${focus} ${
                        approveDisabled
                            ? "cursor-not-allowed bg-slate-300 text-slate-700"
                            : "bg-emerald-800 text-white hover:bg-emerald-900"
                    }`}
                >
                    {busy ? "Working..." : "Approve Batch"}
                </button>
            </div>
        </div>
    );
}