import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, Role } from '@prisma/client'

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('Seeding database...')

    // 1. Create a Supervisor User
    const supervisor = await prisma.user.upsert({
        where: { email: 'supervisor@apparelflow.com' },
        update: {},
        create: {
            email: 'supervisor@apparelflow.com',
            passwordHash: 'hashed_password_placeholder',
            fullName: 'Kamal Perera',
            role: Role.cutting_supervisor,
        },
    })

    // 2. Create Sample Recipes (Casual Blouse & Crop Top)
    const recipeBlouse = await prisma.recipe.upsert({
        where: { recipeCode: 'REC-BL01' },
        update: {},
        create: {
            recipeCode: 'REC-BL01',
            name: 'Casual Summer Blouse',
            category: 'Blouses',
            stdFabricYards: 1.8,
            wastageCap: 5.0,
            components: {
                create: [
                    { componentName: 'Front Panel', piecesPerGarment: 1 },
                    { componentName: 'Back Panel', piecesPerGarment: 1 },
                    { componentName: 'Sleeves', piecesPerGarment: 2 },
                ],
            },
        },
    })

    const recipeCropTop = await prisma.recipe.upsert({
        where: { recipeCode: 'REC-CT02' },
        update: {},
        create: {
            recipeCode: 'REC-CT02',
            name: 'Basic Crop Top',
            category: 'Tops',
            stdFabricYards: 1.2,
            wastageCap: 4.0,
            components: {
                create: [
                    { componentName: 'Main Bodice', piecesPerGarment: 1 },
                    { componentName: 'Neck Ribbing', piecesPerGarment: 1 },
                ],
            },
        },
    })

    console.log({ supervisor, recipeBlouse, recipeCropTop })
    console.log('Seeding finished successfully!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
        await pool.end()
    })