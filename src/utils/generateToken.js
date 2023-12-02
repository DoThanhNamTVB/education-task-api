require("dotenv").config();
const jwt = require("jsonwebtoken");

const generateToken = (user) => {
    const payload = {
        id: user._id,
        username: user.username,
        role: user.role,
        timeStamp: Date.now(),
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
    return `Bearer ${token}`;
};

module.exports = generateToken;
