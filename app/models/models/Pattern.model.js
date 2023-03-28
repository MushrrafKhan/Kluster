const mongoose = require("mongoose"),
    Schema = mongoose.Schema;
const PatternSchema = new Schema(
    {
        stageId: {
            type: Schema.Types.ObjectId,
            ref: 'Stage',
        },
        coordinates: [
            {
                x: { type: String },
                y: { type: String }
            }
        ],
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
module.exports = mongoose.model("Pattern", PatternSchema);