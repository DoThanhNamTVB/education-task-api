const mongoose = require("mongoose");
const { Schema } = mongoose;

const questionSchema = new mongoose.Schema(
    {
        // _id: {
        //     type: Number,
        // },
        subjectId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "Subject",
        },
        questionName: {
            type: String,
            required: true,
            index: true,
        },
        answer: [
            {
                content: String,
                isTrue: Boolean,
            },
        ],
        status: {
            type: String,
            required: true,
            enum: ["active", "inactive", "draft"],
            default: "active",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("question", questionSchema);
