import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

const CreateOrderSchema = z.object({
    recipeId: z.string().min(1),
    targetQty: z.number().int().min(1).max(100000),
    fabricRollId: z
        .string()
        .trim()
        .regex(/^[A-Za-z0-9-]{3,30}$/),
    actualFabricYds: z.number().int().min(1).max(1000000),
});

type OrderWithRelations = Prisma.CuttingOrderGetPayload<{
    include: {
        recipe: { select: { name: true; recipeCode: true } };
        logs: { select: { rejectionNote: true } };
    };
}>;

function toRow(o: OrderWithRelations) {
    return {
        id: o.id,
        orderNo: o.orderNo,
        recipeName: o.recipe.name,
        recipeCode: o.recipe.recipeCode,
        targetQty: o.targetQty,
        fabricRollId: o.fabricRollId,
        actualFabricYds: o.actualFabricYds,
        status: o.status,
        rejectionNote: o.status === "REJECTED" ? (o.logs[0]?.rejectionNote ?? null) : null,
        createdAt: o.createdAt.toISOString(),
    };
}

const orderInclude = {
    recipe: { select: { name: true, recipeCode: true } },
    logs: {
        where: { decision: "REJECTED" as const },
        orderBy: { timestamp: "desc" as const },
        take: 1,
        select: { rejectionNote: true },
    },
};

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
        }
        if (session.role !== "cutting_supervisor") {
            return NextResponse.json({ error: "Forbidden." }, { status: 403 });
        }

        const body = await req.json().catch(() => null);
        const parsed = CreateOrderSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid order input data." }, { status: 400 });
        }
        const { recipeId, targetQty, fabricRollId, actualFabricYds } = parsed.data;

        const recipe = await prisma.recipe.findUnique({
            where: { id: recipeId },
            include: { components: true },
        });
        if (!recipe) {
            return NextResponse.json({ error: "Recipe not found." }, { status: 404 });
        }

        for (let attempt = 0; attempt < 5; attempt++) {
            const count = await prisma.cuttingOrder.count();
            const orderNo = `CO-${2041 + count + attempt}`;

            try {
                const created = await prisma.cuttingOrder.create({
                    data: {
                        orderNo,
                        recipeId,
                        targetQty,
                        fabricRollId,
                        actualFabricYds,
                        status: "PENDING_VERIFICATION",
                        createdBy: session.userId,

                        items: {
                            create: recipe.components.map((c) => ({
                                componentId: c.id,
                                expectedQty: c.piecesPerGarment * targetQty,
                            })),
                        },
                    },
                    include: orderInclude,
                });
                return NextResponse.json(toRow(created), { status: 201 });
            } catch (err) {
                if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") continue;
                throw err;
            }
        }

        return NextResponse.json({ error: "Could not generate an order number. Try again." }, { status: 409 });
    } catch (error) {
        console.error("Error creating cutting order:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
        }

        if (session.role === "sewing_supervisor") {
            return NextResponse.json({ error: "Forbidden." }, { status: 403 });
        }

        const orders = await prisma.cuttingOrder.findMany({
            where: session.role === "cutting_verifier" ? { status: "PENDING_VERIFICATION" } : undefined,
            include: orderInclude,
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(orders.map(toRow), { status: 200 });
    } catch (error) {
        console.error("Error fetching cutting orders:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}