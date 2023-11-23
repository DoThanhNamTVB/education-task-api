const User = require("../../model/User");
const asyncHandler = require("express-async-handler");
const generateToken = require("../../utils/generateToken");
const mongoose = require("mongoose");
const abc = require("../../model/abc");

const register = asyncHandler(async (req, res) => {
    try {
        const { username, password, role } = req.body;

        if (!username || !password || !role) {
            res.status(401);
            throw new Error("Please fill all username, password, role");
        }

        if (+role !== 1 && +role !== 2 && +role !== 3) {
            res.status(401);
            throw new Error("Role invalid");
        } else {
            // find username in database
            const checkUser = await User.findOne({
                username: username,
            });

            if (!checkUser) {
                const response = await User.create({
                    username: "thanhnam",
                    password: "123456789a",
                    role: 1,
                });

                res.status(200).json(response);

                if (userNew) {
                    const token = generateToken({
                        _id: userNew._id,
                        username: userNew.username,
                        password: userNew.password,
                        role:
                            userNew.role === 1
                                ? "admin"
                                : userNew.role === 2
                                ? "teacher"
                                : "student",
                    });
                    res.json(201).json({
                        token: token,
                        username: userNew.username,
                        role:
                            userNew.role === 1
                                ? "admin"
                                : userNew.role === 2
                                ? "teacher"
                                : "student",
                    });
                    res.status(200).json("oke");
                } else {
                    throw new Error("Create user fail");
                }
            } else {
                res.status(401);

                throw new Error("User has existed");
            }
        }
    } catch (error) {
        res.status(401);

        throw new Error(error);
    }
});

const login = asyncHandler(async (req, res) => {
    try {
        const { username, password } = req.body;

        // find username in database
        const checkUser = await User.findOne({
            username: username,
        });

        if (checkUser) {
            if (User.checkPassword(password)) {
                let token = generateToken({
                    _id: checkUser._id,
                    username: checkUser.username,
                    password: checkUser.password,
                });
                res.status(200).json({
                    token: token,
                    message: "user login successfull",
                });
            }
        } else {
            res.status(401);
            throw new Error("Invalid username or password");
        }
    } catch (error) {
        throw new Error(error);
    }
});

const logout = async (req, res) => {
    try {
        console.log("logout");
        res.status(200);
        res.json("oke");
    } catch (error) {
        throw new Error(error);
    }
};

module.exports = {
    register,
    login,
    logout,
};
