// file index.js
const express = require("express");
const Router = require("../Routes");
const cors = require("cors");
const dotenv = require("dotenv");
// const multer = require("multer"); // Tidak perlu Multer di sini jika hanya untuk middleware global ini
const cookieParser = require("cookie-parser");
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');

const allowedOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

dotenv.config();

const app = express();

// Konfigurasi middleware
app.use(cors({
  origin: allowedOrigin,
  method: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(cookieParser(process.env.JWT_SECRET_KEY));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 


const swaggerDocument = JSON.parse(fs.readFileSync(path.join(__dirname, 'docs', 'api-docs.json'), 'utf8'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/uploads", express.static("public/uploads"));



app.use(Router); 

app.get("/", (req, res) => {
    res.send("hello world");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});