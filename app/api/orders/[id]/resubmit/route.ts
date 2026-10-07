import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/rbac";
import { ApiError, errorResponse } from "@/lib/errors";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Ctx) {
    try {
        await requireRole("cutting_supervisor");
        const { id } = await params;

        const updated = await prisma.cuttingOrder.updateMany({
            where: { id, status: "REJECTED" },
            data: { status: "PENDING_VERIFICATION" },
        });

        if (updated.count !== 1) {
            throw new ApiError(400, "Order is not in REJECTED state or does not exist.");
        }

        return NextResponse.json({ ok: true, status: "PENDING_VERIFICATION" });
    } catch (e) {
        return errorResponse(e);
    }
}