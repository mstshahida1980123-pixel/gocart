const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('admin123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'idrisrashel@gmail.com' },
    update: { password: hash, role: 'ADMIN' },
    create: { email: 'idrisrashel@gmail.com', password: hash, role: 'ADMIN' },
  });
  console.log('Done:', user);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
