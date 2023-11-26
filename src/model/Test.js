const mongoose = require("mongoose");
const { Schema } = mongoose;

const testSchema = new mongoose.Schema(
    {
        testName: {
            type: String,
            required: true,
        },
        subjectId: {
            type: Schema.ObjectId,
            required: true,
            ref: "Subject",
        },
        authTest: {
            type: Schema.ObjectId,
            ref: "User",
        },
        student: [
            {
                studentId: { type: Schema.ObjectId, ref: "User" },
                startTest: Date,
                during: Number,
                result: String,
                status: {
                    type: String,
                    enum: ["Completed", "Not-complete"],
                    default: "Not-complete",
                },
            },
        ],
        status: {
            type: String,
            required: true,
            enum: ["Scheduled", "Active", "Completed", "Draf", "Cancel"],
        },
        startTime: { type: Date },
        endTime: { type: Date },
        duringStart: {
            //hạn thời gian làm bài : 60 - 60 phút
            type: Number,
        },
        question: [
            {
                questionId: {
                    type: Schema.ObjectId,
                    required: true,
                    ref: "Question",
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

//middleware set status test
testSchema.pre("save", function (next) {
    const now = new Date();
    if (this.startTime || this.endTime) {
        if (now < this.startTime) {
            this.status = "Scheduled";
        } else if (now > this.endTime) {
            this.status = "Completed";
        } else {
            this.status = "Active";
        }
    } else {
        this.status = "Draft";
    }
    next();
});

module.exports = mongoose.model("Test", testSchema);
