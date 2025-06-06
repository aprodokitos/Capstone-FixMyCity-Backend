const express = require("express");
const multer = require('multer'); 
const upload = multer(); 

const {
  getAllUser,
  getUserById,
  deleteUserById,
  updateUserById,
} = require("../controllers/user_controllers");

const validateUpdateUser = require("../Middlewares/validation/update-user-validation");
const validateCreateUser = require("../Middlewares/validation/create-user-validation");
const { registerUser, login , logout} = require("../controllers/auth_controllers");
const router = express.Router();
const verifyToken = require("../Middlewares/verify"); 

router.get("/user/all", getAllUser);
router.get("/user/:id", getUserById);

router.post("/user/new", upload.none(), validateCreateUser, registerUser);

router.delete("/user/:id", deleteUserById);

router.put("/user/:id", validateUpdateUser, updateUserById);

router.post("/user/login", upload.none(), login );

router.post("/user/logout", logout);

module.exports = router;