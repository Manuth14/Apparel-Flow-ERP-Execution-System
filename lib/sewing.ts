import { prisma } from "@/lib/db";
import { itemStatus } from "@/lib/gatekeeper";
import type { SewingBatch } from "@/lib/sewing-types";

const include = {
  recipe: { select: { name: true, recipeCode: true, wastageCap: true } },
  items: {
    include: { component: { select: { componentName: true } } },
    orderBy: { id: "asc" as const },
  },
  logs: { orderBy: { timestamp: "desc" as const } },
};

async function loadByStatus(status: "VERIFIED" | "IN_SEWING"): Promise<SewingBatch[]> {
  const orders = await prisma.cuttingOrder.findMany({
    where: { status },
    include,
    orderBy: { createdAt: "desc" },
  });

  const userIds = new Set<string>();
  for (const o of orders) {
    for (const l of o.logs) userIds.add(l.verifierId);
    if (o.sewingStartedBy) userIds.add(o.sewingStartedBy);
  }
  const users = await prisma.user.findMany({
    where: { id: { in: [...userIds] } },
    select: { id: true, fullName: true },
  });
  const nameOf = (id: string | null) => (id ? (users.find((u) => u.id === id)?.fullName ?? "Unknown") : null);

  const batches: SewingBatch[] = orders.map((o) => {

    const approval = o.logs.find((l) => l.decision === "APPROVED") ?? null;

    return {
      id: o.id,
      orderNo: o.orderNo,
      status,
      targetQty: o.targetQty,
      fabricRollId: o.fabricRollId,
      actualFabricYds: o.actualFabricYds,
      recipe: {
        name: o.recipe.name,
        recipeCode: o.recipe.recipeCode,
        wastageCap: o.recipe.wastageCap,
      },
      wastagePct: approval?.wastagePct ?? null,
      verifiedAt: approval ? approval.timestamp.toISOString() : null,
      verifierId: approval?.verifierId ?? null,
      verifierName: nameOf(approval?.verifierId ?? null) ?? "Unknown",
      sewingStartedAt: o.sewingStartedAt ? o.sewingStartedAt.toISOString() : null,
      sewingStartedByName: nameOf(o.sewingStartedBy),
      items: o.items.map((i) => ({
        id: i.id,
        componentName: i.component.componentName,
        expectedQty: i.expectedQty,
        actualQty: i.actualQty,
        status: i.actualQty === null ? null : itemStatus(i.expectedQty, i.actualQty),
        variance: i.actualQty === null ? null : i.actualQty - i.expectedQty,
      })),
      trail: o.logs.map((l) => ({
        id: l.id,
        decision: l.decision,
        rejectionNote: l.rejectionNote,
        wastagePct: l.wastagePct,
        timestamp: l.timestamp.toISOString(),
        verifierName: nameOf(l.verifierId) ?? "Unknown",
      })),
    };
  });

  // Most recently verified first
  return batches.sort((a, b) => (b.verifiedAt ?? "").localeCompare(a.verifiedAt ?? ""));
}

/** The Sewing Queue: WHERE status = 'VERIFIED' and nothing else. */
export const getSewingQueue = () => loadByStatus("VERIFIED");

/** Batches the sewing floor has already started (post-verification only). */
export const getSewingInProgress = () => loadByStatus("IN_SEWING");
