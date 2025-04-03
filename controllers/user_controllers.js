const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function addNewUser(req, res) {
  try {
    const {
      user_name,
      user_birthday,
      user_email,
      user_password,
      user_profile,
    } = req.body;

    const dataUser = await prisma.user.findUnique({
      where: {
        user_email,
      },
    });

    if (dataUser) {
      throw new Error(
        "Email sudah ada. Masuk atau gunakan email lain untuk mendaftar "
      );
    }

    const data = await prisma.user.create({
      data: {
        user_name,
        user_birthday: new Date(user_birthday),
        user_email,
        user_password,
        user_profile,
        created_at: new Date(),
        id_level: "1",
      },
    });

    if (!data) {
      throw new Error("gagal membuat akun baru");
    }

    res
      .status(201)
      .json({ success: true, message: "Akun berhasil dibuat", data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

module.exports = {
  addNewUser,
};
