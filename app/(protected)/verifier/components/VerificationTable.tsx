"use client";

import { itemStatus } from "@/lib/gatekeeper";
import type { ItemRow } from "./types";
import TrafficLight from "@/app/(protected)/verifier/components/TrafficLight";

export default function VerificationTable({
                                              rows,
                                              onChange,
                                              disabled,
                                          }: {
    rows: ItemRow[];
    onChange: (id: string, value: string) => void;
    disabled: boolean;
}) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm text-[#14202F]">
                <thead className="border-b border-[#E4E2DA] bg-[#FAFAF8] text-[#5B6676]">
                <tr>
                    <th scope="col" className="px-4 py-3 font-medium">Component</th>
                    <th scope="col" className="px-4 py-3 font-medium">Expected</th>
                    <th scope="col" className="px-4 py-3 font-medium">Actual count</th>
                    <th scope="col" className="px-4 py-3 font-medium">Status</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-[#EEECE5]">
                {rows.map((r) => {
                    const status = r.value !== null ? itemStatus(r.expectedQty, r.value) : null;
                    const variance = r.value !== null ? r.value - r.expectedQty : null;
                    const errId = `err-${r.id}`;

                    return (
                        <tr key={r.id} className="align-top">
                            <td className="px-4 py-3.5 font-medium">{r.componentName}</td>
                            <td className="px-4 py-3.5">{r.expectedQty.toLocaleString("en-US")}</td>
                            <td className="px-4 py-3.5">
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="off"
                                    placeholder="Count"
                                    value={r.raw}
                                    disabled={disabled}
                                    onChange={(e) => onChange(r.id, e.target.value)}
                                    aria-label={`Actual count for ${r.componentName}`}
                                    aria-invalid={!!r.error}
                                    aria-describedby={r.error ? errId : undefined}
                                    className={`w-32 rounded-lg border bg-white p-2.5 text-sm text-[#14202F] placeholder:text-[#5B6676] focus:outline-none focus:ring-4 focus:ring-[#E4B23C]/60 disabled:bg-[#F6F5F1] ${
                                        r.error ? "border-red-700" : "border-[#6B7280] focus:border-[#1B2F4E]"
                                    }`}
                                />
                                {r.error && (
                                    <p id={errId} className="mt-1 max-w-[220px] text-sm text-red-800">
                                        {r.error}
                                    </p>
                                )}
                            </td>
                            <td className="px-4 py-3.5">
                                <TrafficLight status={status} variance={variance} />
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
}