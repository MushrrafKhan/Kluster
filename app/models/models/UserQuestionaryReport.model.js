const mongoose = require("mongoose"),
    Schema = mongoose.Schema;
const UserQusetionaryReportSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        questionId: {
            type: Schema.Types.ObjectId,
            ref: "Question",
        },
        yes: {
            type: String,
            default: '',
        },
        no: {
            type: String,
            default: '',
        },
        default: {
            type: String,
            default: '',
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
module.exports = mongoose.model("UserQusetionaryReport", UserQusetionaryReportSchema);