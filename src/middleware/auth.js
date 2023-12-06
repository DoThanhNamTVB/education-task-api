const jwt = require("jsonwebtoken");
const User = require("../model/User");
require("dotenv").config();
const isAuthHandler = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                message: "You are not authorized",
            });
        }
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(401).json({
                    message: "Token is expired",
                });
            }
            req.user = user;
        });
    } catch (error) {
        return res.status(500).json({
            message: error,
        });
    }
};

const isAdminHanndler = async (req, res, next) => {
    const user = req.user;
    const getUser = await User.findById(user?._id);
    if (getUser && getUser.role === 1) {
        next();
    } else {
        return res.status(401).json({
            message: "You are not admin",
        });
    }
};

const isAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        return res.status(401).json({
            message: "You are not authorized",
        });
    }
};

const isAdmin = (req, res, next) => {
    try {
        if (req.isAuthenticated() && +req.user.role === 1) {
            next();
        } else {
            return res.status(401).json({
                message: "You are not admin",
            });
        }
    } catch (error) {
        res.status(500);
        throw new Error(error);
    }
};

const isTeacher = (req, res, next) => {
    if (req.isAuthenticated() && +req.user.role === 2) {
        next();
    } else {
        return res.status(401).json({
            message: "You are not teacher",
        });
    }
};

const isStudent = (req, res, next) => {
    if (req.isAthenticated() && +req.user.role === 3) {
        next();
    } else {
        return res.status(401).json({
            message: "You are not student",
        });
    }
};

module.exports = {
    isAuth,
    isAuthHandler,
    isAdminHanndler,
    isAdmin,
    isTeacher,
    isStudent,
};
