"use server";
import { ORDERS, evaluateGate, GateResult, GateStatus } from "@/lib/production";

export async function checkOrderStatus(orderId: string): Promise<GateResult | null> {
    const order = ORDERS.find((o) => o.id === orderId);
    return order ? evaluateGate(order) : null;
}

/** Server-enforced gate: the client cannot bypass a red status. */
export async function requestSewingRelease(
    orderId: string,
    supervisorApproved: boolean
): Promise<{ ok: boolean; status: GateStatus; message: string }> {
    const order = ORDERS.find((o) => o.id === orderId);
    if (!order) return { ok: false, status: "red", message: "Order not found." };
    const { status, reasons } = evaluateGate(order);
    if (status === "red") return { ok: false, status, message: `Blocked. ${reasons[0]}` };
    if (status === "yellow" && !supervisorApproved)
        return { ok: false, status, message: "Supervisor review is required before release." };
    return { ok: true, status, message: `${order.id} released to sewing.` };
}