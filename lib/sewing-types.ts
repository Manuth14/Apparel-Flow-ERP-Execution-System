import type { ItemStatus } from "@/lib/gatekeeper";

export type SewingBatch = {
  id: string;
  orderNo: string;
  status: "VERIFIED" | "IN_SEWING";
  targetQty: number;
  fabricRollId: string;
  actualFabricYds: number;
  recipe: { name: string; recipeCode: string; wastageCap: number };

  wastagePct: number | null;
  verifiedAt: string | null;
  verifierId: string | null;
  verifierName: string;

  sewingStartedAt: string | null;
  sewingStartedByName: string | null;

  items: {
    id: string;
    componentName: string;
    expectedQty: number;
    actualQty: number | null;
    status: ItemStatus | null;
    variance: number | null;
  }[];

  trail: {
    id: string;
    decision: string;
    rejectionNote: string | null;
    wastagePct: number | null;
    timestamp: string;
    verifierName: string;
  }[];
};
