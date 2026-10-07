"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OrdersTable, { type OrderRow } from "@/app/(protected)/supervisor/components/OrdersTable";

export default function VerifierPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const pendingCount = orders.filter((o) => o.status === "PENDING_VERIFICATION").length;

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/orders");
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.error ?? "Failed to load orders.");
        setOrders(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load orders.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <main className="space-y-6 p-4 sm:p-8">
      <div>
        <h1 className="font-(family-name:--font-display) text-2xl font-bold tracking-tight">
          Verification Terminal
        </h1>
        <p className="text-sm text-[#5B6676]">
          Count every component. No batch reaches the sewing queue without your sign-off.
        </p>
      </div>

      <section
          aria-label="Summary"
          className="rounded-xl border border-amber-300 bg-amber-50 p-5">
        <p className="text-sm font-medium text-amber-800">Pending verification</p>
        <p className="mt-1 font-(family-name:--font-display) text-4xl font-bold text-amber-900">
          {loading ? "–" : pendingCount}
        </p>
        <p className="mt-1 text-sm text-amber-800">Batches waiting at the QC station</p>
      </section>

      {error && (
        <div role="alert" className="rounded-lg border border-red-700 bg-red-50 p-3 text-sm text-red-900">
          {error}
        </div>
      )}

      <section className="rounded-xl border border-[#E4E2DA] bg-white">
        <div className="border-b border-[#E4E2DA] p-4 sm:px-5">
          <h2 className="font-(family-name:--font-display) text-lg font-semibold">Batches at QC station</h2>
        </div>
        {loading ? (
          <div className="py-10 text-center text-[#5B6676]">Loading orders...</div>
        ) : (
          <OrdersTable
            orders={orders}
            onSelect={(o) => router.push(`/verifier/${o.id}`)}
            emptyMessage="No batches are waiting for verification."
          />
        )}
      </section>
    </main>
  );
}
