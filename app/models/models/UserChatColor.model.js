const mongoose = require('mongoose')
Schema = mongoose.Schema;

const UserChatColor = new Schema(
    {
        userId:{
            type:Schema.Types.ObjectId,
            ref: 'User'
        },
        colorId: {
            type:Schema.Types.ObjectId,
            ref: 'chatColor'
        },
        colorType: {
            type: String,
            enum: ['ChatBg', 'TextBg']
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

module.exports = mongoose.model('UserChatColor', UserChatColor) 
