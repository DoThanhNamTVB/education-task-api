require('dotenv').config();
const mongoose = require('mongoose');

const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_CONNECTION_STRING);
        console.log('Db connected');
    } catch (error) {
        console.log('Fail connect DB : ', error);
    }
};

module.exports = { connect };
