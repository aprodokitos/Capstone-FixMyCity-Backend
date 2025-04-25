const express = require("express");
const {
  getAllUser,
  getUserById,
  deleteUserById,
  updateUserById,
} = require("../controllers/user_controllers");

const validateUpdateUser = require("../Middlewares/validation/update-user-validation");
const validateCreateUser = require("../Middlewares/validation/create-user-validation");
const { registerUser } = require("../controllers/auth_controllers");
const router = express.Router();

router.get("/user/all", getAllUser);
router.get("/user/:id", getUserById);
router.post("/user/new", validateCreateUser, registerUser);
router.delete("/user/:id", deleteUserById);
router.put("/user/:id", validateUpdateUser, updateUserById);

module.exports = router;
