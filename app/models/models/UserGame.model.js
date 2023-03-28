const mongoose = require("mongoose"),
    Schema = mongoose.Schema;
const UserGameSchema = new Schema(
    {
        stageId: {
            type: Schema.Types.ObjectId,
            ref: 'Stage',
        },
        levelId: {
            type: Schema.Types.ObjectId,
            ref: 'Level',
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        isCompleted: {
            type: Boolean,
            default: false,
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
module.exports = mongoose.model("UserGame", UserGameSchema);