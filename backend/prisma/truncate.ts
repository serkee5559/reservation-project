import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Cleaning up database...');

    // 1. Delete all bookings
    const deletedBookings = await prisma.bookings.deleteMany({});
    console.log(`Deleted ${deletedBookings.count} bookings.`);

    // 2. Reset seats
    const updatedSeats = await prisma.seats.updateMany({
        where: {
            NOT: {
                held_by: null
            }
        },
        data: {
            held_by: null,
            status: 'available',
            held_until: null
        }
    });
    console.log(`Reset ${updatedSeats.count} seats.`);

    // 3. Delete all users
    const deletedUsers = await prisma.appUser.deleteMany({});
    console.log(`Deleted ${deletedUsers.count} users.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
