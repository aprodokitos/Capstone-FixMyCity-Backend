const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function getAllUser(req, res) {
  try {
    const allUserData = await prisma.user.findMany({
      where: {
        deleted_at: null, // Menambahkan kondisi untuk tidak mengambil user yang soft deleted
      },
    });
    if (!allUserData || allUserData.length === 0) {
      throw new Error("Data User tidak ditemukan");
    }

    res.status(200).json({ success: true, data: allUserData });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const userData = await prisma.user.findUnique({
      where: {
        id_user: id,
        deleted_at: null, // Pastikan hanya user yang tidak dihapus yang diambil
      },
    });

    if (!userData) {
      throw new Error("User tidak ditemukan");
    }

    if (userData.user_profile) {
      userData.user_profile = `http://localhost:3000/${userData.user_profile}`;
    }
    res.status(200).json({ success: true, data: userData });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

async function updateUserById(req, res) {
  try {
    const id = req.params.id;

    // Cari data pengguna berdasarkan id
    const userData = await prisma.user.findUnique({
      where: {
        id_user: id,
      },
    });

    if (!userData) {
      throw new Error("Data pengguna tidak ditemukan");
    }

    // Cek apakah data sudah dihapus (soft delete)
    if (userData.deleted_at !== null) {
      throw new Error("Data pengguna sudah dihapus dan tidak dapat diubah");
    }

    // Ambil data yang ingin diupdate dari body request
    const { user_name, user_birthday, user_profile } = req.body;

    const updateData = {};

    // Periksa apakah ada field yang akan diupdate
    if (user_name) updateData.user_name = user_name;
    if (user_profile) updateData.user_profile = user_profile;
    if (user_birthday) updateData.user_birthday = new Date(user_birthday);

    // Lakukan update pada data pengguna
    const updatedUser = await prisma.user.update({
      where: {
        id_user: id,
      },
      data: updateData,
    });

    res.status(200).json({
      success: true,
      message: "Data pengguna berhasil diubah",
      data: updatedUser,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

async function deleteUserById(req, res) {
  try {
    const id = req.params.id;
    const userData = await prisma.user.findUnique({
      where: {
        id_user: id,
      },
    });

    if (!userData) {
      throw new Error("Data pengguna tidak ditemukan. Gagal menghapus data");
    }

    // Lakukan update pada field deleted_at
    await prisma.user.update({
      where: {
        id_user: id, // Update berdasarkan id_user
      },
      data: {
        deleted_at: new Date(), // Tandai dengan tanggal saat ini
      },
    });

    res.status(200).json({
      success: true,
      message: "Data pengguna berhasil dihapus",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

module.exports = { getAllUser, getUserById, updateUserById, deleteUserById };
