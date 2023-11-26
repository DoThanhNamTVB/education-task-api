const express = require("express");
const router = express.Router();
const { isTeacher, isStudent, isAuth } = require("../middleware/auth");
const {
    addQuestion,
    searchQuestion,
    updateQuestion,
    deleteQuestion,
    changeStatusQuestion,
    createTest,
} = require("../controllers/User/Teacher/teacherController");
const {
    registerTest,
    getAllTestStudent,
    getUpComingTest,
    startTest,
    getAllCompleteTest,
    getResultTest,
    toResultTest,
} = require("../controllers/User/Student/studentController");
const {
    getAllTest,
    getTestDetailById,
    getUserDetail,
} = require("../controllers/User/User/userController");

//router user
router.get("/get-user-detail", isAuth, getUserDetail);
router.get("/get-all-test", isAuth, getAllTest);
router.get("/get-test-detail-by-id", isAuth, getTestDetailById);

//router teacher
router.post("/add-question-subject", isTeacher, addQuestion);
router.get("/searh-question", isTeacher, searchQuestion);
router
    .route("/question-action")
    .put(isTeacher, updateQuestion)
    .delete(isTeacher, deleteQuestion);
router.put("/change-status-question", isTeacher, changeStatusQuestion);
router.post("/create-test", isTeacher, createTest);

//router student

router.post("/register-into-test", isStudent, registerTest);
router.get("/get-all-test-student", isStudent, getAllTestStudent);
router.get("/get-up-coming-test", isStudent, getUpComingTest);
router.put("/start-test", isStudent, startTest);
router.put("/to-result-test", isStudent, toResultTest);
router.get("/get-all-complete-test", isStudent, getAllCompleteTest);
router.get("/searh-question", isStudent, getResultTest);
