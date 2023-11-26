const express = require("express");
const adminRoute = require("./admin_Route");

const initRoutes = (app) => {
    app.use("/api/admin", adminRoute);
};

module.exports = initRoutes;
