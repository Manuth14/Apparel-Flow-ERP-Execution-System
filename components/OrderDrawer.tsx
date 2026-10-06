// "use client";
// import { useEffect, useState, useTransition } from "react";
// import { CuttingOrder, GateResult, evaluateGate, shortageOf, shortagePct } from "@/lib/production";
// import { checkOrderStatus, requestSewingRelease } from "@/app/dashboard/actions";
// import StatusBadge from "./StatusBadge";
//
// export default function OrderDrawer({ order, onClose }: { order: CuttingOrder; onClose: () => void }) {
//     const [gate, setGate] = useState<GateResult>(() => evaluateGate(order));
//     const [approved, setApproved] = useState(false);
//     const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
//     const [pending, start] = useTransition();
//
//     useEffect(() => {
//         const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
//         window.addEventListener("keydown", onKey);
//         return () => window.removeEventListener("keydown", onKey);
//     }, [onClose]);
//
//     const recheck = () =>
//         start(async () => {
//             // const r = await checkOrderStatus(order.id);
//             if (r) setGate(r);
//             setMsg({ ok: true, text: "Status check complete." });
//         });
//
//     const release = () =>
//         start(async () => {
//             const r = await requestSewingRelease(order.id, approved);
//             setMsg({ ok: r.ok, text: r.message });
//         });
//
//     const blocked = gate.status === "red";
//     const needsApproval = gate.status === "yellow";
//
//     return (
//         <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={`Order ${order.id} details`}>
//             <button className="absolute inset-0 bg-black/60" onClick={onClose} aria-label="Close details" tabIndex={-1} />
//             <div className="relative flex h-full w-full max-w-lg flex-col overflow-y-auto border-l border-slate-700 bg-slate-900 p-6">
//                 <div className="flex items-start justify-between gap-4">
//                     <div>
//                         <h2 className="text-xl font-semibold text-white">{order.id}</h2>
//                         <p className="mt-1 text-sm text-slate-300">{order.style} · {order.recipe} · {order.qty.toLocaleString()} pcs</p>
//                     </div>
//                     <button autoFocus onClick={onClose} className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm font-medium text-slate-100 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400">
//                         Close
//                     </button>
//                 </div>
//
//                 <div className="mt-5 flex items-center gap-3"><StatusBadge status={gate.status} /></div>
//                 <ul className="mt-3 space-y-1.5 text-sm text-slate-200">
//                     {gate.reasons.map((r) => <li key={r}>• {r}</li>)}
//                 </ul>
//
//                 <h3 className="mt-6 text-sm font-semibold text-white">Component breakdown</h3>
//                 <ul className="mt-3 space-y-3">
//                     {order.components.map((c) => {
//                         const short = shortageOf(c);
//                         const pct = Math.min(100, (c.allocated / c.required) * 100);
//                         const bar = !short ? "bg-emerald-400" : shortagePct(c) > 5 ? "bg-red-400" : "bg-amber-400";
//                         return (
//                             <li key={c.name} className="rounded-lg border border-slate-700 bg-slate-800/60 p-3">
//                                 <div className="flex justify-between text-sm">
//                                     <span className="font-medium text-white">{c.name}</span>
//                                     <span className="text-slate-300">{c.allocated.toLocaleString()} / {c.required.toLocaleString()} {c.unit}</span>
//                                 </div>
//                                 <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-700">
//                                     <div className={`h-full ${bar}`} style={{ width: `${pct}%` }} />
//                                 </div>
//                                 {short > 0 && <p className="mt-1.5 text-xs text-slate-300">Short {short.toLocaleString()} {c.unit} ({shortagePct(c).toFixed(1)}%)</p>}
//                             </li>
//                         );
//                     })}
//                 </ul>
//                 <p className="mt-3 text-sm text-slate-300">Wastage: <span className="font-medium text-white">{order.wastageActual}%</span> of {order.wastageCap}% cap</p>
//
//                 {needsApproval && (
//                     <label className="mt-5 flex items-center gap-2.5 text-sm text-slate-100">
//                         <input type="checkbox" checked={approved} onChange={(e) => setApproved(e.target.checked)} className="h-4 w-4 accent-amber-400" />
//                         Supervisor has reviewed this warning
//                     </label>
//                 )}
//                 {blocked && (
//                     <p role="alert" className="mt-5 rounded-lg border border-red-500 bg-red-950 px-3 py-2 text-sm text-red-100">
//                         Hard stop: this order cannot move to sewing until the shortage is resolved.
//                     </p>
//                 )}
//                 {msg && (
//                     <p role="status" className={`mt-4 rounded-lg border px-3 py-2 text-sm ${msg.ok ? "border-emerald-500 bg-emerald-950 text-emerald-100" : "border-red-500 bg-red-950 text-red-100"}`}>
//                         {msg.text}
//                     </p>
//                 )}
//
//                 <div className="mt-auto flex flex-col gap-3 pt-6 sm:flex-row">
//                     <button onClick={recheck} disabled={pending} className="flex-1 rounded-lg border border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-100 hover:bg-slate-800 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400">
//                         Run status check
//                     </button>
//                     <button onClick={release} disabled={pending || blocked || (needsApproval && !approved)}
//                             className="flex-1 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
//                         Release to sewing
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// }