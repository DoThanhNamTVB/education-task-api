const User = require("../../model/User");
const asyncHandler = require("express-async-handler");
const generateToken = require("../../utils/generateToken");
const Subject = require("../../model/Subject");

const register = asyncHandler(async (req, res) => {
    try {
        const { username, password, role } = req.body;
        // console.log(username, password, role);

        if (!username || !password || !role) {
            throw new Error("Please fill all username, password, role");
        }

        if (+role !== 1 && +role !== 2 && +role !== 3) {
            throw new Error("Role invalid");
        } else {
            // find username in database
            const checkUser = await User.findOne({
                username: username,
            });

            if (!checkUser) {
                const userNew = await User.create({
                    username: username,
                    password: password,
                    role: +role,
                });

                const token = userNew
                    ? generateToken({
                          username: userNew.username,
                          password: userNew.password,
                          role: userNew.role,
                      })
                    : null;
                res.status(201).json({
                    username: userNew.username,
                    role:
                        userNew.role === 1
                            ? "admin"
                            : userNew.role === 2
                            ? "teacher"
                            : "student",
                    token: token,
                });
            } else {
                throw new Error("User has existed");
            }
        }
    } catch (error) {
        throw new Error(error);
    }
});

const login = asyncHandler(async (req, res) => {
    try {
        const { username, password } = req.body;

        // find username in database
        const checkUser = await User.findOne({
            username: username,
        });

        if (checkUser) {
            if (User.checkPassword(password)) {
                let token = generateToken({
                    _id: checkUser._id,
                    username: checkUser.username,
                    password: checkUser.password,
                });
                res.status(200).json({
                    token: token,
                    message: "user login successfull",
                });
            }
        } else {
            res.status(401);
            throw new Error("Invalid username or password");
        }
    } catch (error) {
        throw new Error(error);
    }
});

const logout = async (req, res) => {
    req.logout();
    // req.clearCookie("connect.sid");
    res.cookie("connect.sid", "", { expires: 0 });
    res.status(200).json({
        message: "Logout success",
    });
};

const removeUser = asyncHandler(async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findById({ _id: userId });
        if (user) {
            user.deleteOne();
            res.status(200).json({
                message: "User deleted",
                user,
            });
        } else {
            res.status(404).json({
                message: "Not found user to delete",
            });
        }
    } catch (error) {
        res.status(500);
        throw new Error(error);
    }
});

const unblockUser = asyncHandler(async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findById({ _id: userId });
        if (user) {
            if (user.status === "active") {
                user.status = "block";
                await user.save();
            } else if (user.status === "block") {
                user.status = "active";
                await user.save();
            }
            res.status(200).json({
                message: `Account ${user.username} has ${user.status}`,
            });
        } else {
            res.status(400).json({
                message: `Not found user`,
            });
        }
    } catch (error) {
        res.status(500);
        throw new Error(error);
    }
});

const addSubject = asyncHandler(async (req, res) => {
    try {
        const { subjectCode, subjectName } = req.body;
        if (!subjectCode || !subjectName) {
            return res.status(400).json({
                message: "subjectCode, subjectName can null. Please fullfill",
            });
        }
        const checkSubjectCode = await Subject.findOne({
            subjectCode: subjectCode,
        });
        if (checkSubjectCode) {
            return res.status(400).json({
                message: "subject code has existed",
            });
        }
        if (!typeof subjectCode !== Number) {
            return res.status(400).json({
                message: "subjectCode need a Number",
            });
        }
        const subject = await Subject.create({
            subjectCode: subjectCode,
            subjectName: subjectName,
        });
        res.status(201).json({
            message: "Subject is created",
            subject,
        });
    } catch (error) {
        res.status(500);
        throw new Error(error);
    }
});

const removeSubject = asyncHandler(async (req, res) => {
    try {
        const { subjectId } = req.body;
        if (!subjectId) {
            return res.status(400).json({
                message: "subjectId is require field",
            });
        }
        const result = await Subject.deleteOne({ _id: subjectId });
        if (subject) {
            return res.status(400).json({
                message: "Subject not found in database",
            });
        }
    } catch (error) {
        res.status(500);
        throw new Error(error);
    }
});

const getAllSubject = asyncHandler(async (req, res) => {
    try {
        const subjectAll = await Subject.find();

        res.status(200).json(subjectAll?.length > 0 ? subjectAll : null);
    } catch (error) {
        res.status(500);
        throw new Error(error);
    }
});

const getAllTeacher = asyncHandler(async (req, res) => {
    try {
        const teacherAll = await User.find({ role: 2 });

        res.status(200).json(teacherAll?.length > 0 ? teacherAll : null);
    } catch (error) {
        res.status(500);
        throw new Error(error);
    }
});

const getAllStudent = asyncHandler(async (req, res) => {
    try {
        const studentAll = await User.find({ role: 3 });

        res.status(200).json(studentAll?.length > 0 ? studentAll : null);
    } catch (error) {
        res.status(500);
        throw new Error(error);
    }
});
module.exports = {
    register,
    login,
    logout,
    unblockUser,
    addSubject,
    removeSubject,
    getAllSubject,
    getAllTeacher,
    getAllStudent,
};
