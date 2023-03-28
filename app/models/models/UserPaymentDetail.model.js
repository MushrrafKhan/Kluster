const mongoose = require("mongoose"),
    Schema = mongoose.Schema;
const UserPaymentSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        planId: {
            type: Schema.Types.ObjectId,
            ref: 'Plane',
        },
        amount: {
            type: String
        },
        month: {
            type: String
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
module.exports = mongoose.model("UserPaymentDetail", UserPaymentSchema);