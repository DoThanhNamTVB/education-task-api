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
    const token = req.headers.token.split(" ")[1];
    if (!token) {
        return res.status(401).json({
            message: "Not token, authorization denied",
        });
    }
    try {
        const decoded = jwt.verify(token, process.env.jWT_SECRET);
        console.log(decoded);
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
            message: "You are not admin",
        });
    }
};

const isStudent = (req, res, next) => {
    if (req.isAthenticated() && +req.user.role === 3) {
        next();
    } else {
        res.status(401).json({
            message: "You are not admin",
        });
    }
};

module.exports = {
    isAuth,
    isAdmin,
    isTeacher,
    isStudent,
};
