export type GateStatus = "green" | "yellow" | "red";

export interface Component { name: string; unit: string; required: number; allocated: number }
export interface CuttingOrder {
    id: string; style: string; recipe: string; qty: number; due: string;
    wastageCap: number;
    wastageActual: number;
    components: Component[];
}
export interface GateResult { status: GateStatus; reasons: string[] }

/** Shortage above this % of required quantity is a hard stop. */
export const HARD_STOP_PCT = 5;

export const ORDERS: CuttingOrder[] = [
    { id: "CO-2041", style: "Casual Blouse", recipe: "REC-BL01", qty: 1200, due: "2026-10-14", wastageCap: 6, wastageActual: 4.8,
        components: [
            { name: "Poplin fabric", unit: "m", required: 2640, allocated: 2640 },
            { name: "Lining", unit: "m", required: 960, allocated: 960 },
            { name: "Buttons", unit: "pcs", required: 7200, allocated: 7200 },
        ] },
    { id: "CO-2042", style: "Basic Crop Top", recipe: "REC-CT02", qty: 2500, due: "2026-10-16", wastageCap: 5, wastageActual: 3.9,
        components: [
            { name: "Cotton jersey", unit: "m", required: 3125, allocated: 3125 },
            { name: "Rib trim", unit: "m", required: 500, allocated: 500 },
            { name: "Woven labels", unit: "pcs", required: 2500, allocated: 2500 },
        ] },
    { id: "CO-2043", style: "Casual Blouse", recipe: "REC-BL01", qty: 1800, due: "2026-10-18", wastageCap: 6, wastageActual: 5.2,
        components: [
            { name: "Poplin fabric", unit: "m", required: 3960, allocated: 3880 },
            { name: "Lining", unit: "m", required: 1440, allocated: 1440 },
            { name: "Buttons", unit: "pcs", required: 10800, allocated: 10800 },
        ] },
    { id: "CO-2044", style: "Basic Crop Top", recipe: "REC-CT02", qty: 3000, due: "2026-10-12", wastageCap: 5, wastageActual: 5.8,
        components: [
            { name: "Cotton jersey", unit: "m", required: 3750, allocated: 3200 },
            { name: "Rib trim", unit: "m", required: 600, allocated: 600 },
            { name: "Woven labels", unit: "pcs", required: 3000, allocated: 3000 },
        ] },
    { id: "CO-2045", style: "Casual Blouse", recipe: "REC-BL01", qty: 900, due: "2026-10-22", wastageCap: 6, wastageActual: 2.1,
        components: [
            { name: "Poplin fabric", unit: "m", required: 1980, allocated: 1980 },
            { name: "Lining", unit: "m", required: 720, allocated: 600 },
            { name: "Buttons", unit: "pcs", required: 5400, allocated: 5400 },
        ] },
    { id: "CO-2046", style: "Basic Crop Top", recipe: "REC-CT02", qty: 1500, due: "2026-10-25", wastageCap: 5, wastageActual: 3.0,
        components: [
            { name: "Cotton jersey", unit: "m", required: 1875, allocated: 1875 },
            { name: "Rib trim", unit: "m", required: 300, allocated: 300 },
            { name: "Woven labels", unit: "pcs", required: 1500, allocated: 1500 },
        ] },
];

export const shortageOf = (c: Component) => Math.max(0, c.required - c.allocated);
export const shortagePct = (c: Component) => (shortageOf(c) / c.required) * 100;

/** Single source of truth for the gatekeeper. Also re-run on the server before release. */
export function evaluateGate(o: CuttingOrder): GateResult {
    const reasons: string[] = [];
    let status: GateStatus = "green";
    for (const c of o.components) {
        const short = shortageOf(c);
        if (!short) continue;
        const pct = shortagePct(c).toFixed(1);
        if (shortagePct(c) > HARD_STOP_PCT) {
            status = "red";
            reasons.push(`${c.name}: short ${short} ${c.unit} (${pct}%), above the ${HARD_STOP_PCT}% hard-stop limit.`);
        } else {
            if (status === "green") status = "yellow";
            reasons.push(`${c.name}: minor shortage of ${short} ${c.unit} (${pct}%).`);
        }
    }
    if (o.wastageActual > o.wastageCap) {
        if (status === "green") status = "yellow";
        reasons.push(`Wastage ${o.wastageActual}% is over the ${o.wastageCap}% cap for ${o.recipe}.`);
    }
    if (!reasons.length) reasons.push("All components allocated and wastage is within the cap.");
    return { status, reasons };
}