const mongoose = require("mongoose"),
    Schema = mongoose.Schema;
const GameSchema = new Schema(
    {
        name: {
            type: String,
            default: ''
        },
        image: {
            type: String,
            default: ''
        },
        colorCode: {
            type: String,
            default: ''
        },
        isSuspended: {
            type: Boolean,
            default: false,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: {
            createdAt: "created",
            updatedAt: "updated",
        },
        id: false,
        toJSON: {
            getters: true,
        },
        toObject: {
            getters: true,
        },
    }
);
module.exports = mongoose.model("Game", GameSchema);