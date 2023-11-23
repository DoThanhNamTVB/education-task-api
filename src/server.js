require("dotenv").config();
const express = require("express");
const app = express();
const DB = require("./config/db");
const morgan = require("morgan");
const cors = require("cors");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const initRoutes = require("./routes");
const port = process.env.PORT;

//middleware express
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//middleware http logger
app.use(morgan("dev"));

//Middleare cors(cross origin resoure sharing)
app.use(cors());

//connect db
DB.connect();

// app.use((req, res, next) => {
//     res.header("jwt", "Bearer anh anhnah");
//     next();
// });

// app.get("/example", (req, res) => {
//     const jwtHeaderValue = req.headers.jwt;
//     console.log(res.header("jwt"));
//     res.send(`JWT Header Value from request: ${jwtHeaderValue}`);
// });
//Routing
initRoutes(app);

// error handle middleware
app.use(notFound);
app.use(errorHandler);
//run server
app.listen(port, () => {
    console.log("Server running with port ", port);
});
