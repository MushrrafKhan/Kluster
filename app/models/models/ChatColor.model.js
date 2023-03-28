const mongoose = require('mongoose')
Schema = mongoose.Schema
const ChatColor = new Schema(
    {
        colorCode: {
            type: String
        },
        isSuspended: {
            type: Boolean,
            default: false
        },
    },
    {
        timestamps: {
            createdAt: 'created',
            updatedAt: 'updated'
        },

        id:false,

        toJSON: {
            getters: true
        },

        toObject: {
            getters: true
        }
    }
)

module.exports = mongoose.model('ChatColor', ChatColor)
