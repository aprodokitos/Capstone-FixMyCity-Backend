const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();

async function registerUser(req, res) {
  try {
    const {
      user_name,
      user_birthday,
      user_email,
      user_password,
      isLoginAfterRegister,
    } = req.body;

    if (!user_name || !user_email || !user_password) {
      throw new Error("Username, email, dan password harus ada");
    }

    const dataUser = await prisma.user.findUnique({
      where: { user_email },
    });

    if (dataUser) {
      throw new Error(
        "Email sudah ada. Masuk atau gunakan email lain untuk mendaftar"
      );
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(user_password, saltRounds);

    const role = "user";

    const newUser = await prisma.user.create({
      data: {
        user_name,
        user_birthday: new Date(user_birthday),
        user_email,
        user_password: hashedPassword,
        created_at: new Date(),
        user_profile: null,
        role: {
          connectOrCreate: {
            where: {
              role_name: "user", // Pastikan role dengan nama 'user' ada
            },
            create: {
              role_name: "user", // Jika belum ada, buat role baru dengan nama 'user'
            },
          },
        },
      },
    });

    if (isLoginAfterRegister) {
      const token = jwt.sign(
        { id_user: newUser.id_user, role: newUser.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      return res
        .status(201)
        .cookie("token", token, { signed: true, httpOnly: true })
        .json({
          success: true,
          message: "Successfully registered and logged in",
          data: {
            user_name: newUser.user_name,
            user_email: newUser.user_email,
          },
          token,
        });
    }

    res.status(201).json({
      success: true,
      message: "Successfully registered a new user",
      data: { user_name: newUser.user_name, user_email: newUser.user_email },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to register new user.",
    });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email dan password harus diisi." });
    }

    let dataUser = await prisma.user.findUnique({
      where: { user_email: email },
      select: {
        id_user: true,
        user_name: true,
        user_birthday: true,
        user_email: true,
        user_password: true,
        role: {
          select: { role_name: true },
        },
        deleted_at: true,
      },
    });

    if (!dataUser) {
      throw new Error("Email tidak ditemukan");
    }

    // Pastikan user tidak dihapus (soft delete)
    if (dataUser.deleted_at !== null) {
      throw new Error("User  telah dihapus dan tidak dapat login");
    }

    const match = await bcrypt.compare(password, dataUser.user_password);
    if (!match) {
      throw new Error("Password tidak valid");
    }

    const id_user = dataUser.id_user;
    const userRole = dataUser.role.role_name;

    console.log("JWT SIGNING KEY:", process.env.JWT_SECRET_KEY); // <<< Tambahkan ini

    const token = jwt.sign(
      { id_user, role: userRole },
      process.env.JWT_SECRET_KEY, // Pastikan ini sesuai
      { expiresIn: "1h" }
    );

    // tidak menyertakan password pada response
    delete dataUser.user_password;
    dataUser.role = userRole;

    res
      .cookie("token", token, {
        signed: true,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" || false,
      })
      .status(200)
      .json({
        success: true,
        message: "Berhasil login",
        data: dataUser,
        token,
      });
  } catch (error) {
    console.log("login error:", error.message);
    res.status(400).json({
      success: false,
      message: error.message || "Gagal login.",
    });
  }
}

async function logout(req, res, next) {
  try {
    // Clear the token by setting it to expire in the past
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" || false,
      signed: true,
    });

    res.status(200).json({
      success: true,
      message: "Successfully logged out",
    });
  } catch (error) {
    console.log("logout error: " + error);
    next(error);
  }
}

module.exports = { registerUser, login, logout };
