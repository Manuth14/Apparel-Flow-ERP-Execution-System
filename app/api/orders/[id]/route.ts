import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/rbac";
import { ApiError, errorResponse } from "@/lib/errors";
import { expectedFabricYds, fabricWastagePct, type ItemStatus } from "@/lib/gatekeeper";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
    try {
        // Sewing supervisors are rejected here with 403
        const session = await requireRole("cutting_supervisor", "cutting_verifier");
        const { id } = await params;

        const order = await prisma.cuttingOrder.findUnique({
            where: { id },
            include: {
                recipe: true,
                items: { include: { component: true }, orderBy: { id: "asc" } },
                logs: { orderBy: { timestamp: "desc" } },
            },
        });

        // Verifiers only ever see batches waiting at the QC station
        if (!order || (session.role === "cutting_verifier" && order.status !== "PENDING_VERIFICATION")) {
            throw new ApiError(404, "Order not found.");
        }

        // Look up verifier names separately (no dependency on a relation name)
        const verifierIds = [...new Set(order.logs.map((l) => l.verifierId))];
        const users = await prisma.user.findMany({
            where: { id: { in: verifierIds } },
            select: { id: true, fullName: true },
        });
        const nameById = new Map(users.map((u) => [u.id, u.fullName]));

        return NextResponse.json({
            id: order.id,
            orderNo: order.orderNo,
            status: order.status,
            targetQty: order.targetQty,
            fabricRollId: order.fabricRollId,
            actualFabricYds: order.actualFabricYds,
            recipe: {
                name: order.recipe.name,
                recipeCode: order.recipe.recipeCode,
                stdFabricYards: order.recipe.stdFabricYards,
                wastageCap: order.recipe.wastageCap,
            },
            expectedFabricYds: expectedFabricYds(order.recipe.stdFabricYards, order.targetQty),
            wastagePct: fabricWastagePct(order.actualFabricYds, order.recipe.stdFabricYards, order.targetQty),
            items: order.items.map((i) => ({
                id: i.id,
                componentName: i.component.componentName,
                expectedQty: i.expectedQty,
                actualQty: i.actualQty,
                status: (i.status ?? null) as ItemStatus | null,
            })),
            logs: order.logs.map((l) => ({
                id: l.id,
                decision: l.decision,
                rejectionNote: l.rejectionNote,
                wastagePct: l.wastagePct,
                timestamp: l.timestamp.toISOString(),
                verifierName: nameById.get(l.verifierId) ?? "Unknown",
            })),
        });
    } catch (e) {
        return errorResponse(e);
    }
}