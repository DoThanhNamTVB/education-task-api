const Question = require('../../../model/Question');
const Subject = require('../../../model/Subject');
const Test = require('../../../model/Test');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');

const addQuestion = asyncHandler(async (req, res) => {
    try {
        const { subjectId } = req.body;
        const findSubject = await Subject.findById(subjectId);
        if (!findSubject) {
            return res.status(404).json({
                message: 'Not found subject with this subjectid',
            });
        }
        const { questionName, answer, status } = req.body;

        console.log(typeof answer);
        //fuction check answer
        let checkAnnswer = false;
        if (answer?.length > 0) {
            const check = answer.every((item) => {
                return (
                    typeof item.isTrue === 'boolean' &&
                    item.content.trim() !== null &&
                    item.content.trim() !== '' &&
                    item.isTrue !== null
                );
            });
            checkAnnswer = check;
        }

        //check questionName , answer
        if (!questionName || checkAnnswer === false) {
            return res.status(400).json({
                message: 'require correct format',
            });
        }
        //check status
        const dataStatus = ['active', 'inactive', 'draft'];
        if (status && !dataStatus.includes(status)) {
            return res.status(400).json({
                message: 'status is invalid',
            });
        }

        const question = await Question.create({
            subjectId: subjectId,
            questionName: questionName,
            answer: [...answer],
            status: status,
        });

        return res.status(201).json({
            message: 'add question is oke',
            question: question,
        });
    } catch (error) {
        res.status(500);
        throw new Error(error);
    }
});

const searchQuestion = asyncHandler(async (req, res) => {
    try {
        const { questionName } = req.query;

        //search by question name
        const search = await Question.find({
            questionName: { $regex: questionName.trim(), $options: 'i' },
        }).populate({
            path: 'subjectId',
            model: 'Subject',
        });

        if (search) {
            return res.status(200).json({
                question: search,
            });
        } else {
            return res.status(404).json({
                message: 'Not found question',
            });
        }
    } catch (error) {
        res.status(500);
        throw new Error(error);
    }
});

const updateQuestion = asyncHandler(async (req, res) => {
    try {
        const { questionId } = req.params;
        const { subjectId, questionName, answer, status } = req.body;
        //checkquestiion id
        if (!questionId) {
            return res.status(404).json({
                message: 'question id is null',
            });
        }
        //check question
        const checkQuestion = await Question.findById(questionId);
        if (!checkQuestion) {
            return res.status(404).json({
                message: 'Not found question in database',
            });
        }

        //check if has subjectid
        if (subjectId) {
            const findSubject = await Subject.findById(subjectId);

            if (!findSubject) {
                return res.status(404).json({
                    message: 'Not found subject',
                });
            } else {
                checkQuestion.subjectId = mongoose.Types.ObjectId(subjectId);
            }
        }

        //fuction check if has answer
        if (answer) {
            let checkAnnswer = false;
            //check typeof answer
            if (answer?.length > 0) {
                const check = answer.every((item) => {
                    return (
                        typeof item.isTrue === 'boolean' &&
                        item.content.trim() !== null &&
                        item.content.trim() !== '' &&
                        item.isTrue !== null
                    );
                });
                checkAnnswer = check;
            }

            //return if false
            if (checkAnnswer === false) {
                return res.status(400).json({
                    message: 'data answer is not correct format',
                });
            }

            if (checkAnnswer === true) {
                checkQuestion.answer = answer;
            }
        }

        //check questionName
        if (questionName.trim()) {
            checkQuestion.questionName = questionName;
        }

        //check status
        if (status) {
            const dataStatus = ['active', 'inactive', 'draft'];
            if (!dataStatus.includes(status)) {
                return res.status(400).json({
                    message: 'status is invalid',
                });
            } else {
                checkQuestion.status = status;
            }
        }

        //updatequestion
        await checkQuestion.save();
        res.status(200).json({
            message: 'update question oke',
            question: checkQuestion,
        });
    } catch (error) {
        res.status(500);
        throw new Error(error);
    }
});

const deleteQuestion = asyncHandler(async (req, res) => {
    try {
        const { questionId } = req.params;

        if (questionId) {
            const response = await Question.findByIdAndDelete(questionId);
            if (response) {
                return res.status(200).json({
                    message: 'delete question oke',
                    questionDeleted: response,
                });
            } else {
                return res.status(404).json({
                    message: 'No this question in database',
                });
            }
        } else {
            return res.status(400).json({
                message: 'question id is null',
            });
        }
    } catch (error) {
        res.status(500);
        throw new Error(error);
    }
});

//change status question
const changeStatusQuestion = asyncHandler(async (req, res) => {
    try {
        const { questionId, status } = req.body;
        //check required
        if (!questionId || !status) {
            return res.status(400).json({
                message: 'questionId,status is require',
            });
        }
        //check status
        const dataStatus = ['active', 'inactive', 'draft'];
        if (status && !dataStatus.includes(status)) {
            return res.status(400).json({
                message:
                    "status is invalid, it maybe 'active', 'inactive', 'draft'",
            });
        }

        //get data
        const response = await Question.findById(questionId);
        if (response) {
            response.status = status;
            await response.save();
            return res.status(200).json({
                message: 'update status is oke',
                status: response.status,
            });
        } else {
            return res.status(400).json({
                message: 'Not found question with this id',
            });
        }
    } catch (error) {
        res.status(500);
        throw new Error(error);
    }
});

const createTest = asyncHandler(async (req, res) => {
    try {
        const user = req.user;
        const {
            testName,
            subjectId,
            startTime,
            endTime,
            duringStart,
            question,
        } = req.body;
        //check data
        if (!testName || !subjectId || !user?.id || !duringStart || !question) {
            return res.status(400).json({
                message:
                    'Data is require : testName, subjectId, auth, duringStart, question ',
            });
        } else {
            //check subjectid in database
            const findSubject = await Subject.findById(subjectId);
            if (!findSubject) {
                return res.status(404).json({
                    message: 'Not found subject with this subjectId',
                });
            }

            //check question
            //get list id question indatabase
            const getQuestionId = await Question.find().select('_id');
            const dataQuestion = [];
            getQuestionId?.forEach((item) => {
                dataQuestion.push(item._id.toString());
            });
            //check questionId in dataquestion
            let resultCheckQuestionId = true;
            const indexQuestionFalse = [];

            question?.forEach((item, index) => {
                if (!dataQuestion.includes(item.questionId)) {
                    resultCheckQuestionId = false;
                    indexQuestionFalse.push(index + 1);
                }
            });

            if (resultCheckQuestionId === false) {
                return res.status(404).json({
                    message: `Not found question ${indexQuestionFalse} in database`,
                });
            }

            //create test
            const response = await Test.create({
                testName: testName.trim(),
                subjectId: subjectId,
                authTest: user._id,
                startTime: startTime || null,
                endTime: endTime || null,
                duringStart: duringStart,
                question: question,
            });

            return res.status(201).json({
                message: 'create test oke',
                test: response,
            });
        }
    } catch (error) {
        throw new Error(error);
    }
});

module.exports = {
    addQuestion,
    searchQuestion,
    updateQuestion,
    deleteQuestion,
    changeStatusQuestion,
    createTest,
};
