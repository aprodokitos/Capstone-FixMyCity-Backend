// file index.js
const express = require("express");
const Router = require("./Routes");
const cors = require("cors");
const dotenv = require("dotenv");
// const multer = require("multer"); // Tidak perlu Multer di sini jika hanya untuk middleware global ini
const cookieParser = require("cookie-parser");

dotenv.config();

const app = express();

// Konfigurasi middleware
app.use(cors());
app.use(cookieParser(process.env.JWT_SECRET_KEY));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Untuk form-data sederhana (tanpa file)

// Hapus atau komentari middleware global multer.none() ini
/*
// Konfigurasi multer untuk form-data
const upload = multer();
app.use((req, res, next) => {
  if (
    req.headers["content-type"] &&
    req.headers["content-type"].includes("multipart/form-data")
  ) {
    upload.none()(req, res, next);
  } else {
    next();
  }
});
*/

app.use("/uploads", express.static("public/uploads"));

// Middleware upload (dari upload_middleware.js) akan diterapkan di definisi route

app.use(Router); // Router Anda yang akan berisi route update

app.get("/", (req, res) => {
    res.send("hello world");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});