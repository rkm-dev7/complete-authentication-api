const mongoose = require("mongoose");

// Defining Schema
const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true,
        },
        email: {
            type: String,
            trim: true,
            required: true,
        },
        password: {
            type: String,
            trim: true,
            required: true,
        },
        tc: {
            type: Boolean,
            required: true,
        }, // tc means turms and conditions
    },
    { timestamps: true, versionKey: false }
);
const UserModel = mongoose.model("user", UserSchema);
module.exports = UserModel;
