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
    if (this.startTime !== null && this.endTime !== null) {
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

//middleware convert to ObjectId

testSchema.pre("save", function (next) {
    this.authTest = new mongoose.Types.ObjectId(this.authTest);

    this.question = this.question.map((item) => {
        return {
            questionId: new mongoose.Types.ObjectId(item.questionId),
        };
    });

    next();
});

module.exports = mongoose.model("Test", testSchema);
