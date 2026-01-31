
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const count = await prisma.seats.count();
    console.log(`Total seats: ${count}`);

    if (count === 0) {
        console.log('Seats table is empty.');
    } else {
        const firstSeat = await prisma.seats.findFirst();
        console.log('First seat:', firstSeat);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
