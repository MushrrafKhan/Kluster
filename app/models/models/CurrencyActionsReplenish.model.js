const mongoose = require('mongoose'),
    Schema = mongoose.Schema
const CurrencyActionsReplenishSchema = new Schema(
    {
        planId: {
            type: Schema.Types.ObjectId,
            ref: 'Reward',
        },
        name: {
            type: String,
            default: '',
        },
        value: {
            type: String,
            default: '',
        },
        price: {
            type: Number,
        },
        image: {
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
module.exports = mongoose.model('CurrencyActionsReplenish', CurrencyActionsReplenishSchema)
