"use client";

export type OrderStatus =
    | "CUTTING_IN_PROGRESS"
    | "PENDING_VERIFICATION"
    | "REJECTED"
    | "VERIFIED"
    | "IN_SEWING";

export type OrderRow = {
    id: string;
    orderNo: string;
    recipeName: string;
    recipeCode: string;
    targetQty: number;
    fabricRollId: string;
    actualFabricYds: number;
    status: OrderStatus;
    rejectionNote: string | null; // only set when REJECTED
    createdAt: string; // ISO date
};

export const STATUS_LABEL: Record<OrderStatus, string> = {
    CUTTING_IN_PROGRESS: "In progress",
    PENDING_VERIFICATION: "Pending verification",
    REJECTED: "Rejected",
    VERIFIED: "Verified",
    IN_SEWING: "In sewing",
};

const STATUS_STYLE: Record<OrderStatus, { badge: string; dot: string }> = {
    CUTTING_IN_PROGRESS: {
        badge: "border-slate-300 bg-slate-100 text-slate-800",
        dot: "bg-slate-500",
    },
    PENDING_VERIFICATION: {
        badge: "border-amber-300 bg-amber-50 text-amber-900",
        dot: "bg-amber-500",
    },
    REJECTED: {
        badge: "border-red-300 bg-red-50 text-red-900",
        dot: "bg-red-600",
    },
    VERIFIED: {
        badge: "border-emerald-300 bg-emerald-50 text-emerald-900",
        dot: "bg-emerald-600",
    },
    IN_SEWING: {
        badge: "border-blue-300 bg-blue-50 text-blue-900",
        dot: "bg-blue-600",
    },
};

const focus =
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#E4B23C]/60";

function OrderStatusBadge({ status }: { status: OrderStatus }) {
    const s = STATUS_STYLE[status];
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${s.badge}`}
        >
      <span className={`h-2 w-2 rounded-full ${s.dot}`} aria-hidden="true" />
            {STATUS_LABEL[status]}
    </span>
    );
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
    });
}

const HEADERS = [
    "Order",
    "Recipe",
    "Target qty",
    "Fabric roll",
    "Fabric used",
    "Status",
    "Created",
    "",
];

export default function OrdersTable({
                                        orders,
                                        onSelect,
                                        emptyMessage = "No orders match this filter.",
                                    }: {
    orders: OrderRow[];
    onSelect?: (order: OrderRow) => void;
    emptyMessage?: string;
}) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-215 text-left text-sm text-[#14202F]">
                <thead className="border-b border-[#E4E2DA] bg-[#FAFAF8] text-[#5B6676]">
                <tr>
                    {HEADERS.map((h, i) => (
                        <th key={i} scope="col" className="px-4 py-3 font-medium">
                            {h || <span className="sr-only">Actions</span>}
                        </th>
                    ))}
                </tr>
                </thead>

                <tbody className="divide-y divide-[#EEECE5]">
                {orders.map((o) => {
                    return (
                        <tr
                            key={o.id}
                            onClick={() => onSelect?.(o)}
                            className={onSelect ? "cursor-pointer hover:bg-[#FAFAF8]" : undefined}
                        >
                            <td className="px-4 py-3.5 font-semibold">{o.orderNo}</td>

                            <td className="px-4 py-3.5">
                                <div>{o.recipeName}</div>
                                <div className="text-xs text-[#5B6676]">{o.recipeCode}</div>
                            </td>

                            <td className="px-4 py-3.5">{o.targetQty.toLocaleString("en-US")}</td>

                            <td className="px-4 py-3.5">{o.fabricRollId}</td>

                            <td className="px-4 py-3.5">{o.actualFabricYds.toLocaleString("en-US")} yds</td>

                            <td className="px-4 py-3.5">
                                <OrderStatusBadge status={o.status} />
                                {o.status === "REJECTED" && o.rejectionNote && (
                                    <p
                                        className="mt-1.5 max-w-55 truncate text-xs text-red-900"
                                        title={o.rejectionNote}
                                    >
                                        Reason: {o.rejectionNote}
                                    </p>
                                )}
                            </td>

                            <td className="px-4 py-3.5 whitespace-nowrap">{formatDate(o.createdAt)}</td>

                            <td className="px-4 py-3.5 text-right">
                                {onSelect && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onSelect(o);
                                        }}
                                        className={`rounded-lg border border-[#D9D8D2] bg-white px-3 py-1.5 font-medium text-[#14202F] hover:bg-[#F6F5F1] ${focus}`}
                                    >
                                        Details<span className="sr-only"> for {o.orderNo}</span>
                                    </button>
                                )}
                            </td>
                        </tr>
                    );
                })}

                {!orders.length && (
                    <tr>
                        <td colSpan={HEADERS.length} className="px-4 py-10 text-center text-[#5B6676]">
                            {emptyMessage}
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
}