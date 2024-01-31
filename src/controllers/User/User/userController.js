const Test = require('../../../model/Test');
const User = require('../../../model/User');
const asyncHandler = require('express-async-handler');

const getUserDetail = asyncHandler(async (req, res) => {
    try {
        const user = req.user;

        const getUser = await User.findById(user?._id);
        if (getUser) {
            return res.status(200).json({
                message: 'Get user detail success',
                user: getUser,
            });
        }
    } catch (error) {
        throw new Error(error);
    }
});

const getAllTest = asyncHandler(async (req, res) => {
    try {
        const response = await Test.find()
            .populate({
                path: 'subjectId',
                model: 'Subject',
            })
            .populate({
                path: 'student.studentId',
                model: 'User',
                select: 'username',
            });
        return res.status(200).json({
            message: 'Get data oke',
            test: response,
        });
    } catch (error) {
        throw new Error(error);
    }
});

const getTestDetailById = asyncHandler(async (req, res) => {
    try {
        const { testId } = req.params;

        const response = await Test.findById(testId)
            .populate({
                path: 'subjectId',
                model: 'Subject',
            })
            .populate({
                path: 'student.studentId',
                model: 'User',
                select: 'username',
            });

        if (response) {
            return res.status(200).json({
                message: 'Get data oke',
                test: response,
            });
        } else {
            return res.status(404).json({
                message: 'Not found test with this testId in database',
            });
        }
    } catch (error) {
        res.status(500);
        throw new Error(error);
    }
});

module.exports = {
    getUserDetail,
    getAllTest,
    getTestDetailById,
};
