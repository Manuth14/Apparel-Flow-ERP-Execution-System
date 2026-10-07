// Pure functions only (no Prisma, no Next imports) so the UI and the API
// evaluate the traffic lights with exactly the same rules.

export type ItemStatus = "GREEN" | "YELLOW" | "RED";

export type GateItem = { expectedQty: number; actualQty: number | null };

/** GREEN: actual == expected, YELLOW: actual > expected, RED: actual < expected */
export function itemStatus(expected: number, actual: number): ItemStatus {
  if (actual === expected) return "GREEN";
  return actual > expected ? "YELLOW" : "RED";
}

export type GateResult = {
  green: number;
  yellow: number;
  red: number;
  uncounted: number;
  canApprove: boolean;
};

/**
 * Hard-stop rule: a batch can only be approved when it has at least one
 * component, none is RED (shortage) and none is uncounted (null).
 */
export function evaluateGate(items: GateItem[]): GateResult {
  let green = 0;
  let yellow = 0;
  let red = 0;
  let uncounted = 0;

  for (const i of items) {
    if (i.actualQty === null) {
      uncounted++;
      continue;
    }
    const s = itemStatus(i.expectedQty, i.actualQty);
    if (s === "GREEN") green++;
    else if (s === "YELLOW") yellow++;
    else red++;
  }

  return { green, yellow, red, uncounted, canApprove: items.length > 0 && red === 0 && uncounted === 0 };
}

export function expectedFabricYds(stdYardsPerPiece: number, targetQty: number): number {
  return stdYardsPerPiece * targetQty;
}

/** Fabric Wastage % = ((Actual - Expected) / Expected) x 100, rounded to 2 decimals */
export function fabricWastagePct(actualYds: number, stdYardsPerPiece: number, targetQty: number): number {
  const expected = expectedFabricYds(stdYardsPerPiece, targetQty);
  if (expected <= 0) return 0;
  return Math.round(((actualYds - expected) / expected) * 10000) / 100;
}
