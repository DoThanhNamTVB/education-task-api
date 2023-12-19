const asyncHandler = require('express-async-handler');
const Subject = require('../../model/Subject');
const { v4: uuidv4 } = require('uuid');

const addSubject = asyncHandler(async (req, res) => {
    try {
        const { subjectName } = req.params;

        //auto generate subject code
        async function isCodeUnique() {
            let subjectCode;

            do {
                subjectCode = uuidv4();
            } while (await Subject.exists({ subjectCode: subjectCode }));
            return subjectCode;
        }

        const subjectCode = await isCodeUnique();

        const subject = await Subject.create({
            subjectCode: subjectCode,
            subjectName: subjectName,
        });
        res.status(201).json({
            message: 'Subject is created',
            subject,
        });
    } catch (error) {
        throw new Error(error);
    }
});

const removeSubject = asyncHandler(async (req, res) => {
    try {
        const { subjectCode } = req.params;

        const result = await Subject.findOneAndDelete({
            subjectCode: subjectCode,
        });
        if (!result) {
            return res.status(404).json({
                message: 'Subject not found in database',
            });
        } else {
            return res.status(200).json({
                message: 'Subject deleted',
            });
        }
    } catch (error) {
        throw new Error(error);
    }
});

const getAllSubject = asyncHandler(async (req, res) => {
    try {
        const subjectAll = await Subject.find();

        res.status(200).json({
            message: 'Get all list subject successful',
            subjects: subjectAll?.length > 0 ? subjectAll : null,
        });
    } catch (error) {
        throw new Error(error);
    }
});

module.exports = {
    addSubject,
    removeSubject,
    getAllSubject,
};
