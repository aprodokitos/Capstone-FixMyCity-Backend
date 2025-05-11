// file Routes/user_routes.js
const express = require("express");
const multer = require('multer'); // Import multer di sini
const upload = multer(); // Buat instance multer dasar untuk none()

const {
  getAllUser,
  getUserById,
  deleteUserById,
  updateUserById,
} = require("../controllers/user_controllers");

const validateUpdateUser = require("../Middlewares/validation/update-user-validation");
const validateCreateUser = require("../Middlewares/validation/create-user-validation");
const { registerUser, login } = require("../controllers/auth_controllers");
const router = express.Router();
const verifyToken = require("../Middlewares/verify"); // verifyToken sepertinya tidak dipakai di route yang ada saat ini di file ini

router.get("/user/all", getAllUser);
router.get("/user/:id", getUserById);

// Tambahkan upload.none() di route pendaftaran
router.post("/user/new", upload.none(), validateCreateUser, registerUser);

router.delete("/user/:id", deleteUserById);

router.put("/user/:id", validateUpdateUser, updateUserById); // Jika route ini juga menggunakan form-data tanpa file, tambahkan upload.none() juga

// Tambahkan upload.none() di route login
router.post("/user/login", upload.none(), login );

module.exports = router;