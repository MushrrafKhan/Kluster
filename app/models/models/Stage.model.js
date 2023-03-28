const mongoose = require("mongoose"),
    Schema = mongoose.Schema;
const StageSchema = new Schema(
    {
        name: {
            type: String,
            default: ''
        },
        gameId: {
            type: Schema.Types.ObjectId,
            ref: 'Game'
        },
        stageNo: {
            type: Number
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
module.exports = mongoose.model("Stage", StageSchema);