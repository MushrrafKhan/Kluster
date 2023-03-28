const mongoose = require('mongoose'),
  Schema = mongoose.Schema
const ChatSchema = new Schema(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    receiverId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    romantik: {
      type: String
    },
    image: {
      type: String
    },

    isSuspended: {
      type: Boolean,
      default: false,
    },

    msg: {
      type: String,
    },

    read: {
      type: Boolean,
      default: false,
    },
    ignore: {
      type: Boolean,
      default: false,
    },

    // HEADING: {
    //     type: String
    // }
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

module.exports = mongoose.model('Chat', ChatSchema)
