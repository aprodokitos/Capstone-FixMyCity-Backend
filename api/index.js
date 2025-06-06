require("dotenv").config();

const express = require("express");
const Router = require("../Routes");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const fs = require("fs");
const path = require("path");

const app = express();

const allowedOrigins = process.env.FRONTEND_ORIGIN?.split(",") || [
  "http://localhost:5173",
  "https://capstone-fixmycity.vercel.app",
];


app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));



app.use(cookieParser(process.env.JWT_SECRET_KEY));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const swaggerDocument = JSON.parse(fs.readFileSync(path.join(__dirname, "docs", "api-docs.json"), "utf8"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));


app.use("/uploads", express.static("public/uploads"));


app.use(Router);

app.get("/", (req, res) => {
  res.send("Cannot get");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
