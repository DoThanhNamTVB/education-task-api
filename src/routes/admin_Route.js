const express = require("express");
const router = express.Router();
const { isAdmin } = require("../middleware/auth");
const { register } = require("../controllers/Admin/adminController");
const passport = require("passport");

// signup with
router.post("/signup", register);
router.post("/login", passport.authenticate("local-signin"), (req, res) => {
    res.status(200).json({
        message: "Login successful",
        user: req.user,
    });
});
router.post("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            next(err);
        }
    });
    res.status(200).json({
        message: "Logout successful",
    });
});

module.exports = router;
