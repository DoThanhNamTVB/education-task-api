const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            unique: true,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: Number,
            required: true,
            // 1 : admin, 2 : giáo viên , 3 : học sinh
            enum: [1, 2, 3],
        },
        // image: {
        //     path: String,
        //     name: String,
        // },
        // dateOfBirth: Date,
        status: {
            type: String,
            enum: ["active", "block"],
            default: "active",
        },
    },
    {
        timestamps: true,
    }
);

//hash password before save database
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});
//check password methods

userSchema.methods.checkPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
