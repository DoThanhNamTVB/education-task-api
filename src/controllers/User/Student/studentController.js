const Question = require("../../../model/Question");
const Subject = require("../../../model/Subject");
const Test = require("../../../model/Test");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");

const registerTest = asyncHandler(async (req, res) => {
    try {
        const student = req.user;
        const { testId } = req.body;
        const findTest = await Test.findById(testId);
        if (!findTest) {
            return res.status(400).json({
                message: `Not found test with id : ${testId}`,
            });
        }

        //register student with test
        dataStatus = ["Completed", "Draf", "Cancel"];
        if (dataStatus.includes(findTest.status)) {
            return res.status(400).json({
                message: `Not allow to register test , status test is ${findTest.status}`,
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
            "student.studentId": mongoose.Types.ObjectId(student._id),
        })
            .select({
                testName: 1,
            })
            .populate({
                path: "subjectId",
                model: "Subject",
                select: "subjectCode subjectName",
            });
        // .lean();

        res.status(200).json({
            message: "Get all test student successfull",
            test: findtest || [],
        });
    } catch (error) {
        res.status(500);
        throw new Error(error);
    }
});

//get up coming test
const getUpComingTest = asyncHandler(async (req, res) => {
    try {
        const student = req.user;
        const findAllTestComing = await Test.find({
            "student.studentId": mongoose.Types.ObjectId(student._id),
            status: "Scheduled",
        })
            .select({
                testName: 1,
            })
            .populate({
                path: "subjectId",
                model: "Subject",
                select: "subjectCode subjectName",
            });

        res.status(200).json({
            message: "Get upcoming test successfull",
            test: findAllTestComing || [],
        });
    } catch (error) {
        res.status(500);
        throw new Error(error);
    }
});

//start a test
const startTest = asyncHandler(async (req, res) => {
    try {
        const { testId } = req.body;
        const student = req.user;
        //check test exist
        const test = await Test.findById(testId);
        if (!test) {
            return res.status(404).json({ message: "Test is not exist" });
        }

        //check student in test
        const studentIndex = test.student.findIndex(
            (s) => s.studentId.toString() === student._id.toString()
        );
        if (studentIndex === -1) {
            return res
                .status(404)
                .json({ message: "Not found you in test list" });
        }

        //check test is start?
        if (test.student[studentIndex].startTest) {
            return res.status(400).json({ message: "test was started" });
        }

        //update startTest time
        test.student[studentIndex].startTest = new Date.now();
        await test.save();

        //get question
        const getQuestion = await Test.findById(testId)
            .select("question")
            .populate({
                path: "question.questionId",
                model: "Question",
                select: "_id questionName answer.content",
            });
        return res
            .status(200)
            .json({ message: "Create a test success", question: getQuestion });
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
        const { testId, idTestStudent } = req.body;

        let total = 0;
        const { listAnswer } = req.body;
        for (const submitanswer of listAnswer) {
            const { questionId, selectedAnswer } = submitanswer;

            //get question from database
            const question = await Question.findById(questionId);

            const correctAnser = question.answer.find(
                (answer) => answer.isTrue
            );
            if (
                correctAnser &&
                selectedAnswer.trim() === correctAnser.content
            ) {
                total += 1;
            }
        }

        const getTest = await Test.findById(testId).populate({
            path: "question.questionId",
            model: "Question",
        });

        if (getTest) {
            const index = getTest.student.findIndex(
                (item) => item._id === mongoose.Types.ObjectId(idTestStudent)
            );

            const date1 = getTest.student[index].startTest;
            const date2 = new Date.now();
            const during = calculateMinutesBetweenDates(date1, date2);

            getTest.student[index].during = during;
            getTest.student[index].result = total;
            getTest.student[index].status = "Completed";
            await getTest.save();
            return res.status(200).json({
                testId: getTest._id,
                testName: getTest.testName,
                duringTime: during,
                result: total,
            });
        }
    } catch (error) {
        res.status(500);
        throw new Error(error);
    }
});

//get all completed test

const getAllCompleteTest = asyncHandler(async (req, res) => {
    try {
        const student = req.user;
        const getTestComplete = await Test.find({
            "student.studentId": student._id,
            "student.status": "Completed",
        })
            .select(
                "_id testName subjectId student startTime endTime duringStart"
            )
            .populate({
                path: "subjectId",
                model: "Subject",
                select: "subjectName",
            });

        return res.status(200).json({
            message: "Get completed test success",
            test: getTestComplete || null,
        });
    } catch (error) {
        res.status(500);
        throw new Error(error);
    }
});

//get result test
const getResultTest = asyncHandler(async (req, res) => {
    try {
        const { testId } = req.body;
        const studenttest = req.user;
        const getTest = await Test.findById(testId);
        if (getTest) {
            const index = getTest.student.findIndex(
                (item) => item.studentId === studenttest._id
            );
            const result = getTest.student[index]?.result || null;
            return res.status(200).json({
                result: result,
            });
        } else {
            return res.status(404).json("Not found test in database");
        }
    } catch (error) {
        res.status(500);
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
