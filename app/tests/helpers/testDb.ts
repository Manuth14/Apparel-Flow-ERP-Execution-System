import "dotenv/config";
import {Pool} from "pg";
import {PrismaPg} from "@prisma/adapter-pg";
import {PrismaClient, Role, OrderStatus, TrafficStatus,} from "@prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error("DATABASE_URL is not defined");
}
const pool = new Pool({connectionString,});
const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({adapter,});

export async function resetTestDb() {
    await prisma.verificationLog.deleteMany();
    await prisma.verificationItem.deleteMany();
    await prisma.cuttingOrder.deleteMany();
}

export async function getTestUsers() {
    const supervisor = await prisma.user.findUnique(
        {where: {email: "supervisor@apparelflow.com",},}
    );
    const verifier = await prisma.user.findUnique(
        {where: {email: "verifier@apparelflow.com",},}
    );
    const sewing = await prisma.user.findUnique(
        {where: {email: "sewing@apparelflow.com",},}
    );
    if (!supervisor || !verifier || !sewing) {
        throw new Error("Test users not found. Run the seed script first.");
    }
    return {supervisor, verifier, sewing,};
}

export async function getTestRecipe() {
    const recipe = await prisma.recipe.findUnique({where: {recipeCode: "REC-BL01",}, include: {components: true,},});
    if (!recipe) {
        throw new Error("Test recipe REC-BL01 not found. Run the seed script first.");
    }
    return recipe;
}

export async function createTestOrder(createdBy: string, status: OrderStatus, trafficStatus: TrafficStatus) {
    const recipe = await getTestRecipe();
    const component = recipe.components[0];
    if (!component) {
        throw new Error("Test recipe has no components");
    }
    const order = await prisma.cuttingOrder.create({
        data: {
            orderNo: `TEST-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
            recipeId: recipe.id,
            targetQty: 100,
            fabricRollId: `TEST-ROLL-${Date.now()}`,
            actualFabricYds: 185,
            status,
            createdBy,
            items: {
                create: {
                    componentId: component.id,
                    expectedQty: 100,
                    actualQty: trafficStatus === TrafficStatus.RED ? 80 : 100,
                    status: trafficStatus,
                },
            },
        }, include: {items: true,},
    });
    return order;
}

export async function disconnectTestDb() {
    await prisma.$disconnect();
    await pool.end();
}