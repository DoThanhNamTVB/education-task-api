const isAdmin = (req, res, next) => {
    if (req.user?.role !== 1) {
        return res.status(401).json({
            message: "You are not admin",
        });
    }
    next();
};

const isTeacher = (req, res, next) => {
    if (req.user.role !== 2) {
        return res.status(401).json({
            message: "You are not teacher",
        });
    }
    next();
};

const isStudent = (req, res, next) => {
    if (req.user.role !== 3) {
        return res.status(401).json({
            message: "You are not Student",
        });
    }
    next();
};

module.exports = {
    isAdmin,
    isTeacher,
    isStudent,
};
