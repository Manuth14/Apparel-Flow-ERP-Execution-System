"use client";

import {useState, useEffect, useMemo} from "react";
import OrdersTable, {OrderStatus} from "@/app/(protected)/supervisor/components/OrdersTable";
import CreateOrderModal from "@/app/(protected)/supervisor/components/CreateOrderModal";
import {shortageOf} from "@/lib/production";

export default function SupervisorDashboard() {
    const [orders, setOrders] = useState<any[]>([]);
    const [filter, setFilter] = useState("ALL");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/orders");
            const data = await res.json();
            if (Array.isArray(data)) setOrders(data);
        } catch (err) {
            console.error("Error fetching orders:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const filteredOrders = orders.filter((o: any) => {
        if (filter === "ALL") return true;
        return o.status === filter;
    });

    const TONE = {
        slate:   { card: "border-slate-300 bg-slate-100",     value: "text-slate-900",   hint: "text-slate-700",   dot: "bg-slate-500" },
        amber:   { card: "border-amber-300 bg-amber-50",      value: "text-amber-900",   hint: "text-amber-800",   dot: "bg-amber-500" },
        red:     { card: "border-red-300 bg-red-50",          value: "text-red-900",     hint: "text-red-800",     dot: "bg-red-600" },
        emerald: { card: "border-emerald-300 bg-emerald-50",  value: "text-emerald-900", hint: "text-emerald-800", dot: "bg-emerald-600" },
    } as const;

    const metrics = useMemo(() => {
        const count = (s: OrderStatus) => orders.filter((o) => o.status === s).length;
        return [
            { label: "Total orders",         value: orders.length,                  hint: "All cutting orders",     tone: "slate" },
            { label: "Pending verification", value: count("PENDING_VERIFICATION"),  hint: "Waiting at QC station",  tone: "amber" },
            { label: "Rejected",             value: count("REJECTED"),              hint: "Need re-cutting",        tone: "red" },
            { label: "Verified",             value: count("VERIFIED"),              hint: "Released to sewing",     tone: "emerald" },
        ] as const;
    }, [orders]);

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Cutting Supervisor Dashboard</h1>
                    <p className="text-sm text-slate-500">Manage cutting orders, track fabric usage, and initiate verification queues.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 transition"
                >
                    + Create Cutting Order
                </button>
            </div>

            <section aria-label="Summary" className="grid grid-cols-4 gap-2 sm:gap-4">
                {metrics.map((m) => {
                    const t = TONE[m.tone];
                    return (
                        <div key={m.label} className={`min-w-0 rounded-xl border p-2.5 sm:p-5 ${t.card}`}>
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <span className={`hidden h-2.5 w-2.5 shrink-0 rounded-full sm:block ${t.dot}`} aria-hidden="true" />
                                <p className={`text-[11px] font-medium leading-tight sm:text-sm ${t.hint}`}>{m.label}</p>
                            </div>
                            <p className={`mt-1 font-[family-name:var(--font-display)] text-2xl font-bold sm:mt-2 sm:text-4xl ${t.value}`}>
                                {loading ? "–" : m.value}
                            </p>
                            <p className={`mt-0.5 hidden text-sm sm:block ${t.hint}`}>{m.hint}</p>
                        </div>
                    );
                })}
            </section>

            {/*Filter Tabs*/}
            <div className="flex gap-2 border-b pb-3">
                {["ALL", "PENDING_VERIFICATION", "VERIFIED", "REJECTED"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                            filter === tab ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                    >
                        {tab.replace("_", " ")}
                    </button>
                ))}
            </div>

            {loading ? <div className="py-8 text-center text-slate-500">Loading orders...</div> : <OrdersTable orders={filteredOrders} />}

            <CreateOrderModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreated={fetchOrders} />
        </div>
    );
}