const Question = require('../../../model/Question');
const Subject = require('../../../model/Subject');
const Test = require('../../../model/Test');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');

const registerTest = asyncHandler(async (req, res) => {
    try {
        const student = req.user;
        const { testId } = req.params;
        const findTest = await Test.findById(testId);
        if (!findTest) {
            return res.status(404).json({
                message: `Not found test`,
            });
        }

        //register student with test
        dataStatus = ['Completed', 'Draf', 'Cancel'];
        if (dataStatus.includes(findTest.status)) {
            return res.status(400).json({
                message: `Not allow to register test with status test now: ${findTest.status}`,
            });
        }
        findTest.student.push({ studentId: student?._id });
        await findTest.save();

        res.status(201).json({
            message: `Register test success`,
        });
    } catch (error) {
        res.status(500);
        throw new Error(error);
    }
});

//get all test student
const getAllTestStudent = asyncHandler(async (req, res) => {
    try {
        const student = req.user;
        const findtest = await Test.find({
            'student.studentId': student._id,
        }).select('_id testName authTest startTime endTime status duringStart');
        res.status(200).json({
            message: 'Get all test student successfull',
            test: findtest || [],
        });
    } catch (error) {
        throw new Error(error);
    }
});

//get up coming test
const getUpComingTest = asyncHandler(async (req, res) => {
    try {
        const student = req.user;
        const findAllTestComing = await Test.find({
            'student.studentId': student._id,
            status: 'Scheduled',
        })
            .populate({
                path: 'authTest',
                model: 'User',
                select: 'username',
            })
            .populate({
                path: 'subjectId',
                model: 'Subject',
                select: 'subjectCode subjectName',
            })
            .populate({
                path: 'question.questionId',
                model: 'question',
                select: 'questionName answer.content',
            });
        res.status(200).json({
            message: 'Get upcoming test successful',
            test: findAllTestComing || [],
        });
    } catch (error) {
        throw new Error(error);
    }
});

//start a test
const startTest = asyncHandler(async (req, res) => {
    try {
        const { testId } = req.params;
        const student = req.user;
        //check test exist
        const test = await Test.findById(testId);
        if (!test) {
            return res.status(404).json({ message: 'Test is not exist' });
        }

        //check test is already
        if (test.status !== 'Active') {
            return res.status(500).json({
                message: `Test is not already with status test now`,
            });
        }
        //check student in test
        const studentIndex = test.student.findIndex(
            (s) => s.studentId.toString() === student._id.toString()
        );
        if (studentIndex === -1) {
            return res.status(404).json({
                message: 'Not found you in test list, please register in test',
            });
        }

        //check test is start?
        if (test.student[studentIndex].startTest) {
            return res.status(500).json({ message: 'test was started' });
        }

        //update startTest time
        test.student[studentIndex].startTest = new Date();
        await test.save();

        //get question
        const getQuestion = await Test.findById(testId)
            .select('question')
            .populate({
                path: 'question.questionId',
                model: 'question',
                select: '_id questionName answer.content',
            });
        return res
            .status(200)
            .json({ message: 'Create a test success', question: getQuestion });
    } catch (error) {
        res.status(500);
        throw new Error(error);
    }
});

function calculateMinutesBetweenDates(date1, date2) {
    const time1 = date1.getTime();
    const time2 = date2.getTime();

    //get minutes
    const minutes = Math.abs(time2 - time1) / 60000;

    return minutes;
}
//to result test
//list answer = [{questionId, answerId}]
const toResultTest = asyncHandler(async (req, res) => {
    try {
        const user = req.user;
        const { testId, listAnswer } = req.body;
        const studentId = user._id;
        let total = 0;
        for (const submitanswer of listAnswer) {
            const { questionId, selectedAnswer } = submitanswer;

            //get question from database
            const question = await Question.findById(questionId);

            const correctAnser = question?.answer.find(
                (answer) => answer.isTrue
            );
            if (
                correctAnser &&
                selectedAnswer === correctAnser._id.toString()
            ) {
                total += 1;
            }
        }

        const getTest = await Test.findById(testId).populate({
            path: 'question.questionId',
            model: 'question',
        });

        if (getTest) {
            const index = getTest.student.findIndex((item) => {
                return item.studentId.equals(studentId) === true;
            });
            const date1 = getTest.student[index].startTest;
            const date2 = new Date();
            const during = calculateMinutesBetweenDates(date1, date2);

            getTest.student[index].during = during;
            getTest.student[index].result = total;
            getTest.student[index].status = 'Completed';
            await getTest.save();
            return res.status(200).json({
                message: 'Calcular result oke',
                testId: getTest._id,
                testName: getTest.testName,
                duringTime: during,
                result: total,
            });
        }
    } catch (error) {
        throw new Error(error);
    }
});

//get all completed test

const getAllCompleteTest = asyncHandler(async (req, res) => {
    try {
        const student = req.user;

        const getTestComplete = await Test.aggregate([
            {
                $unwind: '$student',
            },
            {
                $match: {
                    'student.studentId': student._id,
                    'student.status': 'Completed',
                },
            },
        ]);
        return res.status(200).json({
            message: 'Get completed test success',
            test: getTestComplete || null,
        });
    } catch (error) {
        throw new Error(error);
    }
});

//get result test
const getResultTest = asyncHandler(async (req, res) => {
    try {
        const { testId } = req.params;
        const studenttest = req.user;
        const getTest = await Test.findById(testId);
        if (getTest) {
            const totalQuestion = getTest.question.length;
            const index = getTest.student.findIndex((item) => {
                return item.studentId.equals(studenttest._id) === true;
            });

            if (!index || !getTest.student[index]?.result) {
                return res.status(500).json({
                    message: 'You have not taken this test yet',
                });
            }
            const result = getTest.student[index]?.result || null;
            return res.status(200).json({
                result: result + '/' + totalQuestion,
            });
        } else {
            return res.status(500).json({
                message: 'Not found test',
            });
        }
    } catch (error) {
        throw new Error(error);
    }
});

module.exports = {
    registerTest,
    getAllTestStudent,
    getUpComingTest,
    startTest,
    toResultTest,
    getAllCompleteTest,
    getResultTest,
};
