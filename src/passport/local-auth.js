const passport = require("passport");
const User = require("../model/User");
const generateToken = require("../utils/generateToken");
const localStrategy = require("passport-local").Strategy;

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        user ? done(null, user) : done(null, false);
    } catch (error) {
        done(error, null);
    }
});

// passport.use(
//     "local-signup",
//     new localStrategy(
//         {
//             usernameField: "username",
//             passwordField: "password",
//             passReqToCallback: true,
//         },
//         async (req, username, password, done) => {
//             const { role } = req.body;
//             if (!username || !password || !role) {
//                 return done(null, false);
//             }
//             if (+role !== 1 && +role !== 2 && +role !== 3) {
//                 return done(null, false);
//             }
//             // find username in database
//             const checkUser = await User.findOne({
//                 username: username,
//             });

//             if (!checkUser) {
//                 const userNew = await User.create({
//                     username: username,
//                     password: password,
//                     role: +role,
//                 });

//                 return done(null, userNew);
//             } else {
//                 done(null, false);
//             }
//         }
//     )
// );

passport.use(
    new localStrategy(
        {
            usernameField: "username",
            passwordField: "password",
            passReqToCallback: true,
        },
        async (req, username, password, done) => {
            const user = await User.findOne({ username: username });
            if (!user || !user.checkPassword(password)) {
                return done(null, false);
            } else if (user?.status === "block") {
                return done(null, false, { message: "Account was blocked" });
            } else {
                const token = user ? generateToken(user?._id) : null;
                user.token = token;

                return done(null, user);
            }
        }
    )
);
