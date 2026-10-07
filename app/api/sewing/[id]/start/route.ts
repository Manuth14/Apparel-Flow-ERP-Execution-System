import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/rbac";
import { ApiError, errorResponse } from "@/lib/errors";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Ctx) {
    try {
        const session = await requireRole("sewing_supervisor"); // 401 / 403
        const { id } = await params;

        const moved = await prisma.cuttingOrder.updateMany({
            where: { id, status: "VERIFIED" },
            data: { status: "IN_SEWING", sewingStartedAt: new Date(), sewingStartedBy: session.userId },
        });

        if (moved.count !== 1) {
            const already = await prisma.cuttingOrder.findFirst({
                where: { id, status: "IN_SEWING" },
                select: { id: true },
            });
            if (already) throw new ApiError(409, "Sewing has already started for this batch.");
            throw new ApiError(404, "Batch not found in the sewing queue.");
        }

        return NextResponse.json({ ok: true, status: "IN_SEWING" });
    } catch (e) {
        return errorResponse(e);
    }
}