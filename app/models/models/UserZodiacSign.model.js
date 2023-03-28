const mongoose = require('mongoose'),
    Schema = mongoose.Schema
const UserZodiacSignSchema = new Schema(
    {
        zodiacId: {
            type: Schema.Types.ObjectId,
            ref: 'ZodiacImage',
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
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
            createdAt: 'created',
            updatedAt: 'updated',
        },

        id: false,

        toJSON: {
            getters: true,
        },

        toObject: {
            getters: true,
        },
    },
)
module.exports = mongoose.model('UserZodiacSign', UserZodiacSignSchema)
