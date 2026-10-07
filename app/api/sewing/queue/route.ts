import { NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { errorResponse } from "@/lib/errors";
import { getSewingQueue } from "@/lib/sewing";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        await requireRole("sewing_supervisor"); // 401 / 403
        return NextResponse.json(await getSewingQueue());
    } catch (e) {
        return errorResponse(e);
    }
}
