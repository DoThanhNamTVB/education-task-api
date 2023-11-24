require("dotenv").config();
const jwt = require("jsonwebtoken");

const generateToken = (payload) => {
    let token;
    if (payload) {
        token = jwt.sign(payload, process.env.JWT_SECRET, {
            algorithm: "HS256",
            expiresIn: "30d",
        });
    }
    return `Bearer ${token}`;
};

module.exports = generateToken;
