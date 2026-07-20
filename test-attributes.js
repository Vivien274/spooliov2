const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Checking DB via prisma...");
    const count = await prisma.attribute.count();
    console.log("Success! Count of attributes:", count);
  } catch (err) {
    console.error("Prisma error caught:", err.message || err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
