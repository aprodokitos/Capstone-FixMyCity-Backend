// file Middlewares/verify.js
const jwt = require("jsonwebtoken");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(); 

const verifyToken = (req, res, next) => {
  const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token tidak ditemukan' });
  }

  console.log("JWT VERIFYING KEY:", process.env.JWT_SECRET_KEY);
  console.log("Token received:", token);

  jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decoded) => {
    if (err) {
      console.error("JWT Verification Error:", err.message);
      return res.status(403).json({ message: 'Token tidak valid' });
    }

    // --- Gunakan instance prisma yang sudah dibuat di atas ---
    const user = await prisma.user.findUnique({
      where: { id_user: decoded.id_user },
      select: { role: true }
    });
    // ----------------------------------------------------

    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    req.user = {
      id_user: decoded.id_user,
      // Pastikan user.role ada dan punya properti role_name
      role: user.role ? user.role.role_name : null, // Tambahkan cek nullish jika role bisa null di DB
    };

    next();
  });
};

const verifyAdmin = (req, res, next) => {
  // Pastikan req.user dan req.user.role ada (karena verifyToken sudah dijalankan sebelumnya)
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: "Akses hanya untuk admin." });
  }
  next();
};

module.exports = { verifyToken, verifyAdmin };