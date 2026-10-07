import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/rbac";
import { ApiError, errorResponse } from "@/lib/errors";
import { evaluateGate, fabricWastagePct, itemStatus } from "@/lib/gatekeeper";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Ctx) {
    try {
        const session = await requireRole("cutting_verifier"); // 401 / 403
        const { id } = await params;

        const result = await prisma.$transaction(async (tx) => {
            const order = await tx.cuttingOrder.findUnique({
                where: { id },
                include: { recipe: true, items: { include: { component: true } } },
            });
            if (!order) throw new ApiError(404, "Order not found.");

            if (order.status !== "PENDING_VERIFICATION") {
                throw new ApiError(409, `Order is ${order.status}; only PENDING_VERIFICATION batches can be approved.`);
            }

            const gate = evaluateGate(order.items);
            if (!gate.canApprove) {
                const blocking = order.items
                    .filter((i) => i.actualQty === null || itemStatus(i.expectedQty, i.actualQty) === "RED")
                    .map((i) => ({
                        componentName: i.component.componentName,
                        expectedQty: i.expectedQty,
                        actualQty: i.actualQty,
                    }));
                throw new ApiError(
                    422,
                    order.items.length === 0
                        ? "Approval blocked: this order has no components to verify."
                        : `Approval blocked: ${blocking.length} component(s) are short or uncounted.`,
                    blocking,
                );
            }

            const wastagePct = fabricWastagePct(order.actualFabricYds, order.recipe.stdFabricYards, order.targetQty);

            const moved = await tx.cuttingOrder.updateMany({
                where: { id, status: "PENDING_VERIFICATION" },
                data: { status: "VERIFIED" },
            });
            if (moved.count !== 1) throw new ApiError(409, "Order was already processed.");

            await tx.verificationLog.create({
                data: {
                    orderId: id,
                    verifierId: session.userId,
                    decision: "APPROVED",
                    wastagePct,
                    timestamp: new Date(),
                },
            });

            return { status: "VERIFIED" as const, wastagePct };
        });

        return NextResponse.json({ ok: true, ...result });
    } catch (e) {
        return errorResponse(e);
    }
}