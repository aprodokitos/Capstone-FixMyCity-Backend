const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const roles = ['admin', 'user'];

  for (const name of roles) {
    // Cek apakah role sudah ada
    const role = await prisma.role.findFirst({
      where: {
        role_name: name, // Cek berdasarkan role_name
      },
    });

    // Jika tidak ada, maka buat role baru
    if (!role) {
      await prisma.role.create({
        data: {
          role_name: name,
        },
      });
      console.log(`Role ${name} created`);
    } else {
      console.log(`Role ${name} already exists`);
    }
  }

  // Bisa tambahkan data user atau data lain yang dibutuhkan

  await prisma.$disconnect();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
