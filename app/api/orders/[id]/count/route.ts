import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/rbac";
import { ApiError, errorResponse } from "@/lib/errors";
import { CountSchema, parse } from "@/lib/validation";
import { itemStatus } from "@/lib/gatekeeper";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Ctx) {
    try {
        await requireRole("cutting_verifier");
        const { id } = await params;
        const { counts } = parse(CountSchema, await req.json().catch(() => null));

        await prisma.$transaction(async (tx) => {
            const order = await tx.cuttingOrder.findUnique({ where: { id }, include: { items: true } });
            if (!order) throw new ApiError(404, "Order not found.");

            // State machine: counts can only change while the batch is at the QC station
            if (order.status !== "PENDING_VERIFICATION") {
                throw new ApiError(409, `Order is ${order.status}; counts can no longer be changed.`);
            }

            const byId = new Map(order.items.map((i) => [i.id, i]));
            const seen = new Set<string>();
            for (const c of counts) {
                if (!byId.has(c.itemId)) throw new ApiError(400, "A count does not belong to this order.");
                if (seen.has(c.itemId)) throw new ApiError(400, "Duplicate component in request.");
                seen.add(c.itemId);
            }

            for (const c of counts) {
                const item = byId.get(c.itemId)!;
                await tx.verificationItem.update({
                    where: { id: c.itemId },
                    // The traffic light is derived here; a client-sent status is never used
                    data: { actualQty: c.actualQty, status: itemStatus(item.expectedQty, c.actualQty) },
                });
            }
        });

        return NextResponse.json({ ok: true });
    } catch (e) {
        return errorResponse(e);
    }
}