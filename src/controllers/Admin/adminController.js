const User = require('../../model/User');
const asyncHandler = require('express-async-handler');
const generateToken = require('../../utils/generateToken');

const register = asyncHandler(async (req, res) => {
    try {
        const { username, password, role } = req.body;

        //check invalid data
        if (!username || !password || !+role) {
            return res.status(400).json({
                message: 'Please fill all username, password, role',
            });
        }

        //validate username
        const regex = /^[a-zA-Z0-9]+$/;
        const checkUsername = regex.test(username);
        if (!checkUsername) {
            return res.status(400).json({
                message: 'Username is invalid',
            });
        }

        if (+role !== 1 && +role !== 2 && +role !== 3) {
            return res.status(400).json({
                message: 'role is invalid',
            });
        }

        // find username in database
        const checkUser = await User.findOne({
            username: username,
        });

        if (!checkUser) {
            const userNew = await User.create({
                username: username,
                password: password,
                role: +role,
                status: 'block',
            });

            res.status(201).json({
                message: 'Create account oke, waiting admin approve',
                user: {
                    username: userNew.username,
                    role:
                        userNew.role === 1
                            ? 'admin'
                            : userNew.role === 2
                              ? 'teacher'
                              : 'student',
                },
            });
        } else {
            return res.status(500).json({
                message: 'username is exits. Please use another username',
            });
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

        if (checkUser && checkUser?.status === 'block') {
            return res.status(403).json({ message: 'Your account is blocked' });
        }

        if (checkUser && (await checkUser.checkPassword(password))) {
            let token = generateToken({
                _id: checkUser._id,
                username: checkUser.username,
                password: checkUser.password,
            });
            res.status(200).json({
                message: 'user login successfull',
                token: token,
            });
        } else {
            res.status(500).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        res.status(500);
        throw new Error(error);
    }
});

const removeUser = asyncHandler(async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findByIdAndUpdate(userId, {
            status: 'block',
        });
        if (user) {
            res.status(200).json({
                message: 'This account blocked sucessfully',
            });
        } else {
            res.status(404).json({
                message: 'Not found user to block',
            });
        }
    } catch (error) {
        res.status(500);
        throw new Error(error);
    }
});

const unblockUser = asyncHandler(async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById({ _id: userId });
        if (user && user.status === 'block') {
            user.status = 'active';
            await user.save();
            res.status(200).json({
                message: `Account has ${user.status}`,
            });
        } else if (user && (user.status = 'active')) {
            res.status(500).json({
                message: `The account is not block`,
            });
        } else {
            res.status(404).json({
                message: `Not found user`,
            });
        }
    } catch (error) {
        throw new Error(error);
    }
});

const getAllTeacher = asyncHandler(async (req, res) => {
    try {
        const teacherAll = await User.find({ role: 2 });

        res.status(200).json({
            message: 'Get list teachers successfull',
            teachers: teacherAll?.length > 0 ? teacherAll : null,
        });
    } catch (error) {
        throw new Error(error);
    }
});

const getAllStudent = asyncHandler(async (req, res) => {
    try {
        const studentAll = await User.find({ role: 3 });

        res.status(200).json({
            message: 'Get list students successfull',
            students: studentAll?.length > 0 ? studentAll : null,
        });
    } catch (error) {
        throw new Error(error);
    }
});
module.exports = {
    register,
    login,
    removeUser,
    unblockUser,
    getAllTeacher,
    getAllStudent,
};
