import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/rbac";
import { ApiError, errorResponse } from "@/lib/errors";
import { RejectSchema, parse } from "@/lib/validation";
import { fabricWastagePct } from "@/lib/gatekeeper";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Ctx) {
    try {
        const session = await requireRole("cutting_verifier"); // 401 / 403
        const { id } = await params;
        const { note } = parse(RejectSchema, await req.json().catch(() => null)); // 400 without a reason

        await prisma.$transaction(async (tx) => {
            const order = await tx.cuttingOrder.findUnique({ where: { id }, include: { recipe: true } });
            if (!order) throw new ApiError(404, "Order not found.");

            if (order.status !== "PENDING_VERIFICATION") {
                throw new ApiError(409, `Order is ${order.status}; only PENDING_VERIFICATION batches can be rejected.`);
            }

            const moved = await tx.cuttingOrder.updateMany({
                where: { id, status: "PENDING_VERIFICATION" },
                data: { status: "REJECTED" },
            });
            if (moved.count !== 1) throw new ApiError(409, "Order was already processed.");

            await tx.verificationLog.create({
                data: {
                    orderId: id,
                    verifierId: session.userId,
                    decision: "REJECTED",
                    rejectionNote: note,
                    wastagePct: fabricWastagePct(order.actualFabricYds, order.recipe.stdFabricYards, order.targetQty),
                    timestamp: new Date(),
                },
            });
        });

        return NextResponse.json({ ok: true, status: "REJECTED" });
    } catch (e) {
        return errorResponse(e);
    }
}