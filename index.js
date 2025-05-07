const express = require("express");
const Router = require("./Routes");
const cors = require("cors");
const dotenv = require("dotenv");
const app = express();

dotenv.config();
app.use(cors());
app.use(express.json());

app.use('/uploads', express.static('public/uploads'));

app.use(Router);

app.get("/", (req, res) => {
  res.send("hello world");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
