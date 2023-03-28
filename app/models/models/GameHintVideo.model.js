const mongoose = require("mongoose"),
    Schema = mongoose.Schema;
const GameHintVideoSchema = new Schema(
    {
        
        video: {
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
module.exports = mongoose.model("GameHintVideo", GameHintVideoSchema);