"use client";

import { useState, useEffect } from "react";
import OrdersTable from "@/app/(protected)/supervisor/components/OrdersTable";
import CreateOrderModal from "@/app/(protected)/supervisor/components/CreateOrderModal";

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

            {/* Filter Tabs */}
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