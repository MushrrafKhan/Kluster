const mongoose = require("mongoose"),
    Schema = mongoose.Schema;
const GameHintSchema = new Schema(
    {
        
        rule: {
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
module.exports = mongoose.model("GameHint", GameHintSchema);