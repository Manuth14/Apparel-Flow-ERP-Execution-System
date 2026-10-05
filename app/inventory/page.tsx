'use client';

import { useMemo, useState } from "react";
import { ORDERS, shortageOf } from "@/lib/production";
import { stitch } from "@/lib/theme";

interface InventoryItem {
    id: string;
    name: string;
    category: "Fabric" | "Trims" | "Accessories";
    inStock: number;
    allocated: number;
    unit: string;
    warehouseLocation: string;
    status: "Optimal" | "Low Stock" | "Critical";
}

const INITIAL_INVENTORY: InventoryItem[] = [
    { id: "INV-001", name: "Cotton Fabric (White)", category: "Fabric", inStock: 2500, allocated: 1500, unit: "meters", warehouseLocation: "Rack A-01", status: "Optimal" },
    { id: "INV-002", name: "Rib Knit Spandex", category: "Fabric", inStock: 1850, allocated: 1850, unit: "meters", warehouseLocation: "Rack A-03", status: "Low Stock" },
    { id: "INV-003", name: "Denim Twill 12oz", category: "Fabric", inStock: 3000, allocated: 1600, unit: "meters", warehouseLocation: "Rack B-02", status: "Optimal" },
    { id: "INV-004", name: "Brushed Fleece Fabric", category: "Fabric", inStock: 2700, allocated: 2700, unit: "meters", warehouseLocation: "Rack B-04", status: "Critical" },
    { id: "INV-005", name: "Buttons (Standard 4-hole)", category: "Trims", inStock: 10000, allocated: 6000, unit: "pcs", warehouseLocation: "Bin C-12", status: "Optimal" },
    { id: "INV-006", name: "Metal Zippers 7in", category: "Trims", inStock: 1200, allocated: 800, unit: "pcs", warehouseLocation: "Bin C-15", status: "Low Stock" },
    { id: "INV-007", name: "Polyester Thread Spools", category: "Accessories", inStock: 200, allocated: 50, unit: "spools", warehouseLocation: "Bin D-01", status: "Optimal" },
];

export default function InventoryDashboardPage() {
    const [filter, setFilter] = useState<string>("all");
    const [search, setSearch] = useState("");

    const inventory = useMemo(() => INITIAL_INVENTORY, []);

    const totalItems = inventory.length;
    const criticalCount = inventory.filter((i) => i.status === "Critical" || i.status === "Low Stock").length;
    const totalStockValue = inventory.reduce((acc, curr) => acc + curr.inStock, 0);

    const filteredItems = inventory.filter((item) => {
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.id.toLowerCase().includes(search.toLowerCase());
        if (filter === "critical") return matchesSearch && (item.status === "Critical" || item.status === "Low Stock");
        if (filter === "fabric") return matchesSearch && item.category === "Fabric";
        return matchesSearch;
    });

    const handleRestock = (id: string) => {
        alert(`Restock request triggered for item ${id}. Purchase order sent to supplier queue.`);
    };

    return (
        <div className="flex min-h-screen bg-[#F6F5F1] text-[#14202F]">
            <div className="flex min-w-0 flex-1 flex-col">
                <header className="relative flex items-center justify-between px-4 py-5 sm:px-8 bg-white border-b border-[#E4E2DA]">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="rounded bg-[#1B2F4E] px-2 py-0.5 text-xs font-semibold text-white">Warehouse Portal</span>
                            <span className="text-xs text-[#5B6676]">Live Gatekeeper Stock Synchronizer</span>
                        </div>
                        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight mt-1">Inventory & Fabric Stock</h1>
                        <p className="text-sm text-[#5B6676]">Track raw material rolls, trims, warehouse locations, and shortage alerts</p>
                    </div>
                    <div className="flex gap-2">
                        <a href="/dashboard" className="rounded-lg border border-[#D9D8D2] bg-white px-4 py-2 text-sm font-medium hover:bg-[#F6F5F1]">
                            Production View
                        </a>
                        <a href="/manager" className="rounded-lg border border-[#D9D8D2] bg-white px-4 py-2 text-sm font-medium hover:bg-[#F6F5F1]">
                            Manager View
                        </a>
                    </div>
                    <div className="absolute inset-x-4 bottom-0 h-[2px] opacity-80 sm:inset-x-8" style={stitch} aria-hidden />
                </header>

                <main className="flex-1 space-y-6 p-4 sm:p-8">
                    {/* Warehouse Metrics Cards */}
                    <section aria-label="Inventory Metrics" className="grid gap-4 sm:grid-cols-3">
                        <div className="rounded-xl border border-[#E4E2DA] bg-white p-5">
                            <p className="text-sm font-medium text-[#5B6676]">Total SKU / Items Tracked</p>
                            <p className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold">{totalItems}</p>
                            <p className="mt-1 text-sm text-[#5B6676]">Active in warehouse database</p>
                        </div>
                        <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-5">
                            <p className="text-sm font-medium text-rose-800">Shortage & Low Stock Alerts</p>
                            <p className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold text-rose-900">{criticalCount}</p>
                            <p className="mt-1 text-sm text-rose-700">Triggering sewing hard stops</p>
                        </div>
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5">
                            <p className="text-sm font-medium text-emerald-800">Total Material Units</p>
                            <p className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold text-emerald-900">{totalStockValue.toLocaleString()}</p>
                            <p className="mt-1 text-sm text-emerald-700">Meters, pieces, & spools combined</p>
                        </div>
                    </section>

                    {/* Inventory Table & Search Filter */}
                    <section className="rounded-xl border border-[#E4E2DA] bg-white">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E4E2DA] p-4 sm:px-5">
                            <div className="flex items-center gap-3">
                                <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">Warehouse Stock Directory</h2>
                                <input
                                    type="text"
                                    placeholder="Search item or ID..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="rounded-lg border border-[#D9D8D2] px-3 py-1.5 text-sm outline-none focus:border-[#1B2F4E]"
                                />
                            </div>
                            <div role="group" aria-label="Filter inventory" className="flex gap-1 rounded-lg bg-[#F6F5F1] p-1">
                                {[
                                    { key: "all", label: "All Items" },
                                    { key: "fabric", label: "Fabrics Only" },
                                    { key: "critical", label: "Low / Critical" },
                                ].map((f) => (
                                    <button key={f.key} onClick={() => setFilter(f.key)} aria-pressed={filter === f.key}
                                            className={`rounded-md px-3 py-1.5 text-sm font-medium ${filter === f.key ? "bg-[#1B2F4E] text-white" : "text-[#14202F] hover:bg-white"}`}>
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[720px] text-left text-sm">
                                <thead className="border-b border-[#E4E2DA] bg-[#FAFAF8] text-[#5B6676]">
                                <tr>
                                    {["Item ID", "Material Name", "Category", "Location", "In Stock", "Allocated", "Status", "Action"].map((h, i) => (
                                        <th key={i} scope="col" className="px-4 py-3 font-medium">{h}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-[#EEECE5]">
                                {filteredItems.map((item) => {
                                    const available = item.inStock - item.allocated;
                                    return (
                                        <tr key={item.id} className="hover:bg-[#FAFAF8]">
                                            <td className="px-4 py-3.5 font-semibold">{item.id}</td>
                                            <td className="px-4 py-3.5 font-medium">{item.name}</td>
                                            <td className="px-4 py-3.5 text-xs text-[#5B6676]">{item.category}</td>
                                            <td className="px-4 py-3.5 text-xs font-mono bg-gray-50 rounded px-2 w-fit">{item.warehouseLocation}</td>
                                            <td className="px-4 py-3.5 font-bold">{item.inStock.toLocaleString()} {item.unit}</td>
                                            <td className="px-4 py-3.5 text-gray-600">{item.allocated.toLocaleString()} {item.unit}</td>
                                            <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                              item.status === "Optimal" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                  item.status === "Low Stock" ? "bg-amber-50 text-amber-800 border-amber-200" :
                                      "bg-rose-50 text-rose-700 border-rose-200"
                          }`}>
                            {item.status}
                          </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-right">
                                                <button onClick={() => handleRestock(item.id)} className="rounded-lg border border-[#D9D8D2] bg-white px-3 py-1.5 text-xs font-semibold hover:bg-[#F6F5F1]">
                                                    Restock
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {!filteredItems.length && (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-10 text-center text-[#5B6676]">No warehouse inventory items found matching your filter.</td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}