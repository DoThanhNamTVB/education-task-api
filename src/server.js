require("dotenv").config();
const express = require("express");
const app = express();
const DB = require("./config/db");
const morgan = require("morgan");
const cors = require("cors");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const initRoutes = require("./routes");
const passport = require("passport");
const session = require("express-session");
// const flash = require("connect-flash");
const port = process.env.PORT;

//connect db
DB.connect();

//use init passport
require("./passport/local-auth");

//middleware express
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false,
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000,
        },
    })
);

//setup passport
// app.use(flash()); //enable message passport
app.use(passport.initialize());
app.use(passport.session());

//middleware http logger
app.use(morgan("dev"));

//Middleare cors(cross origin resoure sharing)
app.use(cors());

//Routing
initRoutes(app);

//middleware error handle
app.use(notFound);
app.use(errorHandler);
//run server
app.listen(port, () => {
    console.log("Server running with port ", port);
});
