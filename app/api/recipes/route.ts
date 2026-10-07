import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
    try {
        const recipes = await prisma.recipe.findMany({
            include: {
                components: true,
            },
            orderBy: {
                recipeCode: "asc",
            },
        });

        return NextResponse.json(recipes, { status: 200 });
    } catch (error) {
        console.error("Error fetching recipes:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}