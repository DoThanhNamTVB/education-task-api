const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
    {
        subjectCode: {
            type: Number,
            unique: true,
            required: true,
        },
        subjectName: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Subject', subjectSchema);
