import type { ItemStatus } from "@/lib/gatekeeper";

export type OrderDetail = {
  id: string;
  orderNo: string;
  status: string;
  targetQty: number;
  fabricRollId: string;
  actualFabricYds: number;
  recipe: { name: string; recipeCode: string; stdFabricYards: number; wastageCap: number };
  expectedFabricYds: number;
  wastagePct: number;
  items: {
    id: string;
    componentName: string;
    expectedQty: number;
    actualQty: number | null;
    status: ItemStatus | null;
  }[];
  logs: {
    id: string;
    decision: string;
    rejectionNote: string | null;
    wastagePct: number | null;
    timestamp: string;
    verifierName: string;
  }[];
};

export type ItemRow = {
  id: string;
  componentName: string;
  expectedQty: number;
  raw: string;
  error: string | null;
  value: number | null;
};
