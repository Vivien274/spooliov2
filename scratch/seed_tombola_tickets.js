const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding 50 tombola tickets...');
  for (let i = 1; i <= 50; i++) {
    await prisma.tombolaTicket.upsert({
      where: { ticketNumber: i },
      update: {},
      create: {
        ticketNumber: i,
        status: 'available',
      },
    });
  }
  console.log('50 tombola tickets initialized successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
