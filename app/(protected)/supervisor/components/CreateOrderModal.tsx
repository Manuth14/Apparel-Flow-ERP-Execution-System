"use client";

import { useEffect, useMemo, useState } from "react";
import ComponentPreview from "./ComponentPreview";

interface RecipeComponent {
    id: string;
    componentName: string;
    piecesPerGarment: number;
}

interface Recipe {
    id: string;
    recipeCode: string;
    name: string;
    stdFabricYards: number;
    components: RecipeComponent[];
}

type Field = "recipeId" | "targetQty" | "fabricRollId" | "actualFabricYds";
type Values = Record<Field, string>;
type Errors = Partial<Record<Field, string>>;

const EMPTY: Values = { recipeId: "", targetQty: "", fabricRollId: "", actualFabricYds: "" };
const WHOLE_NUMBER = /^\d+$/;
const ROLL_ID = /^[A-Za-z0-9-]{3,30}$/;
const FIELD_ORDER: Field[] = ["recipeId", "targetQty", "fabricRollId", "actualFabricYds"];

// Strict guards: string input so we can tell "empty" apart from 0, and reject
// negatives, decimals, exponents ("1e5") and letters. The server re-validates all of this.
function validate(v: Values): Errors {
    const e: Errors = {};

    if (!v.recipeId) e.recipeId = "Select a recipe.";

    const qty = v.targetQty.trim();
    if (!qty) e.targetQty = "Enter the target quantity.";
    else if (!WHOLE_NUMBER.test(qty)) e.targetQty = "Whole numbers only. No negatives, decimals or letters.";
    else if (Number(qty) < 1 || Number(qty) > 100000) e.targetQty = "Enter a value between 1 and 100,000.";

    const roll = v.fabricRollId.trim();
    if (!roll) e.fabricRollId = "Enter the fabric roll ID.";
    else if (!ROLL_ID.test(roll)) e.fabricRollId = "3-30 characters: letters, numbers and hyphens only.";

    const yds = v.actualFabricYds.trim();
    if (!yds) e.actualFabricYds = "Enter the fabric used in yards.";
    else if (!WHOLE_NUMBER.test(yds)) e.actualFabricYds = "Whole numbers only. No negatives, decimals or letters.";
    else if (Number(yds) < 1 || Number(yds) > 1000000) e.actualFabricYds = "Enter a value between 1 and 1,000,000.";

    return e;
}

const focusRing =
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#E4B23C]/60";

const inputClass = (invalid: boolean) =>
    `mt-1 block w-full rounded-lg border bg-white p-2.5 text-sm text-[#14202F] placeholder:text-[#5B6676] ` +
    `focus:outline-none focus:ring-4 focus:ring-[#E4B23C]/60 ` +
    (invalid ? "border-red-700 focus:border-red-700" : "border-[#6B7280] focus:border-[#1B2F4E]");

export default function CreateOrderModal({
                                             isOpen,
                                             onClose,
                                             onCreated,
                                         }: {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
}) {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [recipesLoading, setRecipesLoading] = useState(false);
    const [values, setValues] = useState<Values>(EMPTY);
    const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState("");

    const errors = useMemo(() => validate(values), [values]);
    const showError = (f: Field) => (submitted || touched[f]) && errors[f];

    // Reset the form and load recipes every time the modal opens
    useEffect(() => {
        if (!isOpen) return;
        setValues(EMPTY);
        setTouched({});
        setSubmitted(false);
        setServerError("");
        setRecipesLoading(true);

        fetch("/api/recipes")
            .then(async (res) => {
                if (!res.ok) throw new Error();
                const data = await res.json();
                if (Array.isArray(data)) {
                    setRecipes(data);
                    if (data.length > 0) setValues((v) => ({ ...v, recipeId: data[0].id }));
                }
            })
            .catch(() => setServerError("Failed to load recipes."))
            .finally(() => setRecipesLoading(false));
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && !loading && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen, loading, onClose]);

    if (!isOpen) return null;

    const selectedRecipe = recipes.find((r) => r.id === values.recipeId) ?? null;
    const previewQty = !errors.targetQty ? Number(values.targetQty) : 0;

    function set(field: Field, value: string) {
        setValues((v) => ({ ...v, [field]: value }));
        setTouched((t) => ({ ...t, [field]: true }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (loading) return;
        setSubmitted(true);
        setServerError("");

        const firstInvalid = FIELD_ORDER.find((f) => errors[f]);
        if (firstInvalid) {
            document.getElementById(`order-${firstInvalid}`)?.focus();
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    recipeId: values.recipeId,
                    targetQty: Number(values.targetQty),
                    fabricRollId: values.fabricRollId.trim(),
                    actualFabricYds: Number(values.actualFabricYds),
                }),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Failed to create order.");

            onCreated();
            onClose();
        } catch (err: unknown) {
            setServerError(err instanceof Error ? err.message : "Failed to create order.");
        } finally {
            setLoading(false);
        }
    }

    const labelClass = "block text-xs font-semibold uppercase tracking-wide text-[#14202F]";
    const errorClass = "mt-1 text-sm text-red-800";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            style={{ colorScheme: "light" }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="create-order-title"
                className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-xl border border-[#E4E2DA] bg-white p-6 text-[#14202F] shadow-xl"
            >
                <div className="mb-4 flex items-center justify-between border-b border-[#E4E2DA] pb-3">
                    <h3
                        id="create-order-title"
                        className="font-[family-name:var(--font-display)] text-lg font-bold"
                    >
                        Create Cutting Order
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className={`rounded-lg px-2 py-1 text-slate-700 hover:bg-[#F6F5F1] hover:text-[#14202F] ${focusRing}`}
                    >
                        <span aria-hidden="true">✕</span>
                    </button>
                </div>

                {serverError && (
                    <div
                        role="alert"
                        className="mb-4 rounded-lg border border-red-700 bg-red-50 p-3 text-sm text-red-900"
                    >
                        {serverError}
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                    {/* Recipe */}
                    <div>
                        <label htmlFor="order-recipeId" className={labelClass}>
                            Production Recipe
                        </label>
                        <select
                            id="order-recipeId"
                            value={values.recipeId}
                            onChange={(e) => set("recipeId", e.target.value)}
                            disabled={recipesLoading}
                            aria-invalid={!!showError("recipeId")}
                            aria-describedby={showError("recipeId") ? "err-recipeId" : undefined}
                            className={`${inputClass(!!showError("recipeId"))} disabled:bg-[#F6F5F1]`}
                        >
                            {recipesLoading && <option value="">Loading recipes...</option>}
                            {!recipesLoading && recipes.length === 0 && <option value="">No recipes available</option>}
                            {recipes.map((r) => (
                                <option key={r.id} value={r.id} className="bg-white text-[#14202F]">
                                    {r.name} ({r.recipeCode})
                                </option>
                            ))}
                        </select>
                        {showError("recipeId") && (
                            <p id="err-recipeId" className={errorClass}>
                                {errors.recipeId}
                            </p>
                        )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        {/* Target qty */}
                        <div>
                            <label htmlFor="order-targetQty" className={labelClass}>
                                Target Batch Qty
                            </label>
                            <input
                                id="order-targetQty"
                                type="text"
                                inputMode="numeric"
                                autoComplete="off"
                                placeholder="e.g. 50"
                                value={values.targetQty}
                                onChange={(e) => set("targetQty", e.target.value)}
                                onBlur={() => setTouched((t) => ({ ...t, targetQty: true }))}
                                aria-invalid={!!showError("targetQty")}
                                aria-describedby={showError("targetQty") ? "err-targetQty" : undefined}
                                className={inputClass(!!showError("targetQty"))}
                            />
                            {showError("targetQty") && (
                                <p id="err-targetQty" className={errorClass}>
                                    {errors.targetQty}
                                </p>
                            )}
                        </div>

                        {/* Fabric roll */}
                        <div>
                            <label htmlFor="order-fabricRollId" className={labelClass}>
                                Fabric Roll ID
                            </label>
                            <input
                                id="order-fabricRollId"
                                type="text"
                                autoComplete="off"
                                placeholder="e.g. FAB-ROLL-882"
                                value={values.fabricRollId}
                                onChange={(e) => set("fabricRollId", e.target.value)}
                                onBlur={() => setTouched((t) => ({ ...t, fabricRollId: true }))}
                                aria-invalid={!!showError("fabricRollId")}
                                aria-describedby={showError("fabricRollId") ? "err-fabricRollId" : undefined}
                                className={inputClass(!!showError("fabricRollId"))}
                            />
                            {showError("fabricRollId") && (
                                <p id="err-fabricRollId" className={errorClass}>
                                    {errors.fabricRollId}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Fabric yards */}
                    <div>
                        <label htmlFor="order-actualFabricYds" className={labelClass}>
                            Actual Fabric Used (Yards)
                        </label>
                        <input
                            id="order-actualFabricYds"
                            type="text"
                            inputMode="numeric"
                            autoComplete="off"
                            placeholder="e.g. 95"
                            value={values.actualFabricYds}
                            onChange={(e) => set("actualFabricYds", e.target.value)}
                            onBlur={() => setTouched((t) => ({ ...t, actualFabricYds: true }))}
                            aria-invalid={!!showError("actualFabricYds")}
                            aria-describedby={showError("actualFabricYds") ? "err-actualFabricYds" : undefined}
                            className={inputClass(!!showError("actualFabricYds"))}
                        />
                        {showError("actualFabricYds") && (
                            <p id="err-actualFabricYds" className={errorClass}>
                                {errors.actualFabricYds}
                            </p>
                        )}
                    </div>

                    <ComponentPreview recipe={selectedRecipe} targetQty={previewQty} />

                    <div className="flex justify-end gap-3 border-t border-[#E4E2DA] pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className={`rounded-lg border border-[#6B7280] bg-white px-4 py-2 text-sm font-medium text-[#14202F] hover:bg-[#F6F5F1] disabled:opacity-60 ${focusRing}`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || recipesLoading}
                            className={`rounded-lg bg-[#1B2F4E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#14243C] disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
                        >
                            {loading ? "Creating..." : "Submit Order"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}