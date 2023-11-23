const express = require("express");
const userRoute = require("./user_Route");

const initRoutes = (app) => {
    app.use("/api/user", userRoute);
};

module.exports = initRoutes;
