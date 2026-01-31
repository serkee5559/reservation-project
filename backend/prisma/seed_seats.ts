
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ROWS = 10;
const COLS = 10;
const THEATERS = [1, 2, 3, 4, 5];
const SHOWTIMES = ['10:00', '15:00', '20:00'];

async function main() {
    console.log('Seeding seats for multiple theaters and showtimes...');

    // Clear existing seats to avoid unique constraint issues if necessary
    // await prisma.seats.deleteMany();

    const seatsData: { theater_id: number; seat_label: string; showtime: string; status: 'available' }[] = [];

    for (const theaterId of THEATERS) {
        for (const showtime of SHOWTIMES) {
            for (let row = 0; row < ROWS; row++) {
                for (let col = 0; col < COLS; col++) {
                    const seatLabel = `${String.fromCharCode(65 + row)}${col + 1}`;
                    seatsData.push({
                        theater_id: theaterId,
                        showtime: showtime,
                        seat_label: seatLabel,
                        status: 'available',
                    });
                }
            }
        }
    }

    // Chunking to avoid large payload errors if needed, but 1500 rows should be fine for createMany
    await prisma.seats.createMany({
        data: seatsData,
        skipDuplicates: true,
    });

    console.log(`Seeded ${seatsData.length} seat-time slots across ${THEATERS.length} theaters and ${SHOWTIMES.length} showtimes.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
