const mongoose = require("mongoose"),
    Schema = mongoose.Schema;
const LockProfileSchema = new Schema(
    {

        lockById: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        receivedId: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        lockStatus: {
            type: Boolean,
            default: false
        },
        acceptTime: {
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
module.exports = mongoose.model("LockProfile", LockProfileSchema);