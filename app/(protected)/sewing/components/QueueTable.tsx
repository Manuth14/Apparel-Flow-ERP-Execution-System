"use client";

import type { SewingBatch } from "@/lib/sewing-types";
import { fmtDateTime } from "@/lib/format";

const focus = "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#E4B23C]/60";

export default function QueueTable({
  batches,
  mode,
  onSelect,
  emptyMessage,
}: {
  batches: SewingBatch[];
  mode: "queue" | "started";
  onSelect: (b: SewingBatch) => void;
  emptyMessage: string;
}) {
  const headers = [
    "Order",
    "Recipe",
    "Qty",
    "Fabric roll",
    "Wastage",
    "Verified by",
    mode === "queue" ? "Verified at" : "Sewing started",
    "",
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-215 text-left text-sm text-[#14202F]">
        <thead className="border-b border-[#E4E2DA] bg-[#FAFAF8] text-[#5B6676]">
          <tr>
            {headers.map((h, i) => (
              <th key={i} scope="col" className="px-4 py-3 font-medium">
                {h || <span className="sr-only">Actions</span>}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-[#EEECE5]">
          {batches.map((b) => {
            const overCap = b.wastagePct !== null && b.wastagePct > b.recipe.wastageCap;
            const when = mode === "queue" ? b.verifiedAt : b.sewingStartedAt;
            return (
              <tr key={b.id} onClick={() => onSelect(b)} className="cursor-pointer hover:bg-[#FAFAF8]">
                <td className="px-4 py-3.5 font-semibold">{b.orderNo}</td>
                <td className="px-4 py-3.5">
                  <div>{b.recipe.name}</div>
                  <div className="text-xs text-[#5B6676]">{b.recipe.recipeCode}</div>
                </td>
                <td className="px-4 py-3.5">{b.targetQty.toLocaleString("en-US")}</td>
                <td className="px-4 py-3.5">{b.fabricRollId}</td>
                <td className={`px-4 py-3.5 ${overCap ? "font-semibold text-amber-800" : ""}`}>
                  {b.wastagePct === null ? (
                    <span className="text-[#5B6676]">
                      <span aria-hidden="true">&mdash;</span>
                      <span className="sr-only">No wastage recorded</span>
                    </span>
                  ) : (
                    `${b.wastagePct}% / ${b.recipe.wastageCap}%`
                  )}
                </td>
                <td className="px-4 py-3.5">{b.verifierName}</td>
                <td className="whitespace-nowrap px-4 py-3.5">{when ? fmtDateTime(when) : "—"}</td>
                <td className="px-4 py-3.5 text-right">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(b);
                    }}
                    className={`rounded-lg border border-[#D9D8D2] bg-white px-3 py-1.5 font-medium text-[#14202F] hover:bg-[#F6F5F1] ${focus}`}
                  >
                    {mode === "queue" ? "Inspect" : "View"}
                    <span className="sr-only"> {b.orderNo}</span>
                  </button>
                </td>
              </tr>
            );
          })}

          {!batches.length && (
            <tr>
              <td colSpan={headers.length} className="px-4 py-10 text-center text-[#5B6676]">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
