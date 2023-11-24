const User = require("../../model/User");
const asyncHandler = require("express-async-handler");
const generateToken = require("../../utils/generateToken");
const Subject = require("../../model/Subject");

// api user
const getUserDetail = asyncHandler(async (req, res) => {
    try {
    } catch (error) {
        res.status(500);
        throw new Error(error);
    }
});
