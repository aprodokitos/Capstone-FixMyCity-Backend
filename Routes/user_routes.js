const express = require("express");
const { addNewUser } = require("../controllers");
const validateCreateUser = require("../Middlewares/create-user-validation");

const router = express.Router();

// router.get('/user/all', getAllUser);
// router.get('/user/:id', getUserById);
router.post("/user/new", validateCreateUser, addNewUser);
// router.delete('/user/:id', deleteUserById);
// router.put('/user/id', updateUserById);

module.exports = router;
