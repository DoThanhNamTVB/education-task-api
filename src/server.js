require("dotenv").config();
const express = require("express");
const app = express();
const DB = require("./config/db");
const morgan = require("morgan");
const cors = require("cors");
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

//run server
app.listen(port, () => {
    console.log("Server running with port ", port);
});
