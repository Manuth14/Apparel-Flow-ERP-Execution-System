import type { SewingBatch } from "@/lib/sewing-types";
import { fmtDateTime } from "@/lib/format";
import TrafficLight from "@/app/(protected)/verifier/components/TrafficLight";

function fmtVariance(v: number | null) {
  if (v === null) return "—";
  if (v === 0) return "0";
  return v > 0 ? `+${v}` : `−${Math.abs(v)}`;
}

export default function AuditCard({ batch }: { batch: SewingBatch }) {
  const overCap = batch.wastagePct !== null && batch.wastagePct > batch.recipe.wastageCap;
  const excess = batch.items.filter((i) => i.status === "YELLOW");

  const summary: [string, string][] = [
    ["Recipe", `${batch.recipe.name} (${batch.recipe.recipeCode})`],
    ["Batch quantity", `${batch.targetQty.toLocaleString("en-US")} garments`],
    ["Fabric roll", batch.fabricRollId],
    ["Fabric used", `${batch.actualFabricYds.toLocaleString("en-US")} yds`],
  ];

  return (
    <div className="space-y-5 text-[#14202F]">
      {/* Summary */}
      <section aria-label="Batch summary">
        <dl className="grid gap-3 sm:grid-cols-2">
          {summary.map(([k, v]) => (
            <div key={k} className="rounded-lg border border-[#EEECE5] bg-[#FAFAF8] p-3">
              <dt className="text-xs font-medium uppercase tracking-wide text-[#5B6676]">{k}</dt>
              <dd className="mt-0.5 text-sm font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Verifier attribution + immutable wastage */}
      <section aria-label="Verifier attribution" className="rounded-lg border border-emerald-300 bg-emerald-50 p-4">
        <h3 className="text-sm font-semibold text-emerald-900">Verified and signed off</h3>
        <dl className="mt-2 grid gap-2 text-sm text-emerald-900 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-medium text-emerald-800">Verifier</dt>
            <dd className="font-semibold">{batch.verifierName}</dd>
            {batch.verifierId && <dd className="break-all text-xs text-emerald-800">ID: {batch.verifierId}</dd>}
          </div>
          <div>
            <dt className="text-xs font-medium text-emerald-800">Verified at</dt>
            <dd className="font-semibold">{batch.verifiedAt ? fmtDateTime(batch.verifiedAt) : "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-emerald-800">Fabric wastage (cap {batch.recipe.wastageCap}%)</dt>
            <dd className={`font-semibold ${overCap ? "text-amber-900" : ""}`}>
              {batch.wastagePct === null ? "—" : `${batch.wastagePct}%`}
              {overCap && <span className="ml-1 text-xs">over cap</span>}
            </dd>
          </div>
        </dl>
      </section>

      {/* Piece counts */}
      <section aria-label="Component counts">
        <h3 className="mb-2 text-sm font-semibold">Verified piece counts</h3>
        <div className="overflow-x-auto rounded-lg border border-[#E4E2DA]">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="border-b border-[#E4E2DA] bg-[#FAFAF8] text-[#5B6676]">
              <tr>
                <th scope="col" className="px-3 py-2 font-medium">Component</th>
                <th scope="col" className="px-3 py-2 font-medium">Expected</th>
                <th scope="col" className="px-3 py-2 font-medium">Actual</th>
                <th scope="col" className="px-3 py-2 font-medium">Variance</th>
                <th scope="col" className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEECE5]">
              {batch.items.map((i) => (
                <tr key={i.id}>
                  <td className="px-3 py-2.5 font-medium">{i.componentName}</td>
                  <td className="px-3 py-2.5">{i.expectedQty.toLocaleString("en-US")}</td>
                  <td className="px-3 py-2.5">{i.actualQty === null ? "—" : i.actualQty.toLocaleString("en-US")}</td>
                  <td className="px-3 py-2.5">{fmtVariance(i.variance)}</td>
                  <td className="px-3 py-2.5">
                    <TrafficLight status={i.status} variance={i.variance} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {excess.length > 0 && (
          <p className="mt-2 text-sm text-amber-900">
            Surplus pieces recorded for {excess.map((i) => i.componentName).join(", ")}. The verifier cleared the
            batch to proceed.
          </p>
        )}
      </section>

      {/* Audit trail: earlier rejections show their reasons */}
      <section aria-label="Verifier audit trail">
        <h3 className="mb-2 text-sm font-semibold">Verifier audit trail</h3>
        {batch.trail.length === 0 ? (
          <p className="text-sm text-[#5B6676]">No audit entries.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {batch.trail.map((t) => (
              <li key={t.id} className="rounded-lg border border-[#EEECE5] bg-[#FAFAF8] p-3">
                <span className="font-semibold">{t.decision}</span> by {t.verifierName} · {fmtDateTime(t.timestamp)}
                {t.wastagePct !== null && <span className="text-[#5B6676]"> · wastage {t.wastagePct}%</span>}
                {t.rejectionNote && <p className="mt-1 text-red-900">Reason: {t.rejectionNote}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
