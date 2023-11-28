const express = require("express");
const router = express.Router();
const {
    isAdmin,
    isAuthHandler,
    isAdminHanndler,
} = require("../middleware/auth");
const {
    register,
    removeUser,
    unblockUser,
    addSubject,
    removeSubject,
    getAllSubject,
    getAllTeacher,
    getAllStudent,
} = require("../controllers/Admin/adminController");
const passport = require("passport");
const generateToken = require("../utils/generateToken");

router.post("/register", passport.authenticate("local-signup"), (req, res) => {
    const token = generateToken(req.user);
    res.status(200).json({
        message: "Login successful",
        user: req.user,
        token: token,
    });
});
router.post("create-account", isAuthHandler, isAdminHanndler, register);
router.post("/login", passport.authenticate("local"), (req, res) => {
    const token = generateToken(req.user);
    res.status(200).json({
        message: "Login successful",
        user: req.user,
        token: token,
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

router.route("/").delete(isAdmin, removeUser).put(isAdmin, unblockUser);
router
    .route("/subject")
    .post(isAdmin, addSubject)
    .delete(isAdmin, removeSubject)
    .get(isAdmin, getAllSubject);
router.get("/all-teacher", isAdmin, getAllTeacher);
router.get("/all-student", isAdmin, getAllStudent);

module.exports = router;
