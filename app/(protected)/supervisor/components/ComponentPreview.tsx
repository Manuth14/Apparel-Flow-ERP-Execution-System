"use client";

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

export default function ComponentPreview({ recipe, targetQty }: { recipe: Recipe | null; targetQty: number }) {
    if (!recipe) {
        return (
            <div className="rounded-lg border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500">
                Select a recipe to preview required component breakdowns.
            </div>
        );
    }

    const estimatedFabric = (recipe.stdFabricYards * (targetQty || 0)).toFixed(2);

    return (
        <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="text-sm font-semibold text-slate-900">Recipe Breakdown: {recipe.name}</h4>
                    <p className="text-xs text-slate-500">Code: {recipe.recipeCode} | Std Fabric: {recipe.stdFabricYards} yds/pc</p>
                </div>
                <div className="text-right">
                    <span className="text-xs font-medium text-slate-600">Est. Total Fabric:</span>
                    <p className="text-sm font-bold text-blue-600">{estimatedFabric} yards</p>
                </div>
            </div>

            <div className="overflow-x-auto rounded border border-slate-200 bg-white">
                <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700">
                    <tr>
                        <th className="px-3 py-2">Component Name</th>
                        <th className="px-3 py-2">Pcs / Garment</th>
                        <th className="px-3 py-2">Expected Total ({targetQty} units)</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                    {recipe.components.map((comp) => (
                        <tr key={comp.id} className="hover:bg-slate-50">
                            <td className="px-3 py-2 font-medium text-slate-800">{comp.componentName}</td>
                            <td className="px-3 py-2 text-slate-600">{comp.piecesPerGarment}</td>
                            <td className="px-3 py-2 font-bold text-slate-900">{comp.piecesPerGarment * (targetQty || 0)} pcs</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}