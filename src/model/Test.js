const mongoose = require("mongoose");
const { Schema } = mongoose;

const testSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        subjectId: {
            type: Schema.ObjectId,
            required: true,
            ref: "Subject",
        },
        userId: [
            {
                type: Schema.ObjectId,
                ref: "User",
            },
        ],
        status: {
            type: String,
            required: true,
            enum: ["Scheduled", "Active", "Completed", "Draf", "Cancel"],
            startTime: { type: Date },
            endTime: { type: Date },
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
    if (this.startTime && this.endTime) {
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

module.exports = mongoose.model("test", testSchema);
