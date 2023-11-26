const jwt = require("jsonwebtoken");

const isAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(401).json({
            message: "You are not authorized",
        });
    }
};

const isAdmin = (req, res, next) => {
    try {
        if (req.isAuthenticated() && +req.user.role === 1) {
            next();
        } else {
            res.status(401).json({
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
        res.status(401).json({
            message: "You are not teacher",
        });
    }
};

const isStudent = (req, res, next) => {
    if (req.isAthenticated() && +req.user.role === 3) {
        next();
    } else {
        res.status(401).json({
            message: "You are not student",
        });
    }
};

module.exports = {
    isAuth,
    isAdmin,
    isTeacher,
    isStudent,
};
