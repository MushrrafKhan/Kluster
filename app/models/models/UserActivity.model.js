const mongoose = require('mongoose'),
  Schema = mongoose.Schema
const UserActivitySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    likeCount: {
      type: String,
      default: '0',
    },

    likeEndTime: {
      type: String,
      default: '0',
    },

    loveCount: {
      type: String,
      default: '0',
    },

    loveEndTime: {
      type: String,
      default: '0',
    },

    holdCount: {
      type: String,
      default: '0',
    },

    holdEndTime: {
      type: String,
      default: '0',
    },

    lockCount: {
      type: String,
      default: '0',
    },

    lockEndTime: {
      type: String,
      default: '0',
    },

    superLikeCount: {
      type: String,
      default: '0',
    },

    superLikeEndTime: {
      type: String,
      default: '0',
    },

    romantikCount: {
      type: String,
      default: '0',
    },
    sentRomantik: {
      type: String,
      default: '0',
    },

    romantikEndTime: {
      type: String,
      default: '0',
    },

    messageCount: {
      type: String,
      default: '0',
    },
    sentMessage: {
      type: String,
      default: '0',
    },

    messageEndTime: {
      type: String,
      default: '0',
    },
    chatBackground: {
      type: String,
      default: ' ',
    },
    phoneCalls: {
      type: String,
      default: ' ',
    },
    videoCalls: {
      type: String,
      default: ' ',
    },
    zodiacDescription: {
      type: String,
      default: ' ',
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
module.exports = mongoose.model('UserActivity', UserActivitySchema)
