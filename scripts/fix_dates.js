import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting universal backfill of updatedAt...');
    const now = new Date();

    // 1. Users
    console.log("Updating ALL Users...");
    try {
        const users = await prisma.user.updateMany({
            where: {}, // Update ALL records to ensure valid state
            data: { updatedAt: now }
        });
        console.log(`Updated ${users.count} users.`);
    } catch (err) {
        console.error("Error updating users:", err.message);
    }

    // 2. Tenants
    console.log("Updating ALL Tenants...");
    try {
        const tenants = await prisma.tenant.updateMany({
            where: {},
            data: { updatedAt: now }
        });
        console.log(`Updated ${tenants.count} tenants.`);
    } catch (err) {
        console.error("Error updating tenants:", err.message);
    }

    // 3. Contacts
    console.log("Updating ALL Contacts...");
    try {
        const contacts = await prisma.contact.updateMany({
            where: {},
            data: { updatedAt: now }
        });
        console.log(`Updated ${contacts.count} contacts.`);
    } catch (err) {
        console.error("Error updating contacts:", err.message);
    }
}

main()
    .catch((e) => {
        console.error("Critical error:", e.message);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
