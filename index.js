const express = require("express");
const Router = require("./Routes");

const app = express();

app.use(express.json());

app.use(Router);

app.get("/", (req, res) => {
  res.send("hello world");
});

app.listen(3000, () => {
  console.log("server berjalan di http://localhost:3000");
});
