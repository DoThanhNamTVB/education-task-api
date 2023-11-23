const express = require("express");
const router = express.Router();

const {
    login,
    logout,
    register,
} = require("../controllers/User/userController");

router.post("/abc", register);
router.post("/login", login);
router.post("/logout", logout);

module.exports = router;
