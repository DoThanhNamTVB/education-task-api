const express = require("express");
const router = express.Router();
const passport = require("passport");

const { isTeacher, isStudent } = require("../middleware/jwt-passport");
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

const authenJWT = passport.authenticate("jwt", { session: false });

//router user
router.get("/get-user-detail", authenJWT, getUserDetail);
router.get("/get-all-test", authenJWT, getAllTest);
router.get("/get-test-detail/:testId", authenJWT, getTestDetailById);

//router teacher
router.post("/add-question-subject", authenJWT, isTeacher, addQuestion);
router.get("/searh-question", authenJWT, isTeacher, searchQuestion);
router
    .route("/question-action/:questionId")
    .put(authenJWT, isTeacher, updateQuestion)
    .delete(authenJWT, isTeacher, deleteQuestion);
router.put(
    "/change-status-question",
    authenJWT,
    isTeacher,
    changeStatusQuestion
);
router.post("/create-test", authenJWT, isTeacher, createTest);

//router student

router.post("/register-into-test", authenJWT, isStudent, registerTest);
router.get("/get-all-test-student", authenJWT, isStudent, getAllTestStudent);
router.get("/get-up-coming-test", authenJWT, isStudent, getUpComingTest);
router.put("/start-test", authenJWT, isStudent, startTest);
router.put("/to-result-test", authenJWT, isStudent, toResultTest);
router.get("/get-all-complete-test", authenJWT, isStudent, getAllCompleteTest);
router.get("/get-result-test/:testId", authenJWT, isStudent, getResultTest);

module.exports = router;
