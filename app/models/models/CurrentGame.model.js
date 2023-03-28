const mongoose = require("mongoose"),
    Schema = mongoose.Schema;
const CurrentGameSchema = new Schema(
    {
        gameId: {
            type: Schema.Types.ObjectId,
            ref: 'Game',
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        stageId: {
            type: Schema.Types.ObjectId,
            ref: 'Stage',
        },
        progress: {
            type: Number,
            default: '0'
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
module.exports = mongoose.model("CurrentGame", CurrentGameSchema);