const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/jwt-passport');

const {
    register,
    removeUser,
    unblockUser,
    getAllTeacher,
    getAllStudent,
    login,
} = require('../controllers/Admin/adminController');
const passport = require('passport');
const {
    addSubject,
    getAllSubject,
    removeSubject,
} = require('../controllers/Admin/subjectController');
const authenJWT = passport.authenticate('jwt', { session: false });

router.post('/register', register);
router.post('/login', login);

router.route('/remove-user/:userId').put(authenJWT, isAdmin, removeUser);
router.route('/unblock-user/:userId').put(authenJWT, isAdmin, unblockUser);
router.get('/all-teacher', authenJWT, isAdmin, getAllTeacher);
router.get('/all-student', authenJWT, isAdmin, getAllStudent);

//work with subject
router
    .route('/subject')
    .post(authenJWT, isAdmin, addSubject)
    .get(authenJWT, isAdmin, getAllSubject);
router.delete('/subject/:subjectCode', authenJWT, isAdmin, removeSubject);

module.exports = router;
