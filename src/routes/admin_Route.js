const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/jwt-passport');

const {
    register,
    removeUser,
    unblockUser,
    addSubject,
    removeSubject,
    getAllSubject,
    getAllTeacher,
    getAllStudent,
    login,
} = require('../controllers/Admin/adminController');
const passport = require('passport');
const authenJWT = passport.authenticate('jwt', { session: false });

// router.post("/register", passport.authenticate("local-signup"), (req, res) => {
//     const token = generateToken(req.user);
//     res.status(200).json({
//         message: "Login successful",
//         user: req.user,
//         token: token,
//     });
// });
router.post('/register', authenJWT, isAdmin, register);
router.post('/login', login);

router
    .route('/:userId')
    .delete(authenJWT, isAdmin, removeUser)
    .put(authenJWT, isAdmin, unblockUser);
router
    .route('/subject')
    .post(authenJWT, isAdmin, addSubject)
    .delete(authenJWT, isAdmin, removeSubject)
    .get(authenJWT, isAdmin, getAllSubject);
router.get('/all-teacher', authenJWT, isAdmin, getAllTeacher);
router.get('/all-student', authenJWT, isAdmin, getAllStudent);

module.exports = router;
