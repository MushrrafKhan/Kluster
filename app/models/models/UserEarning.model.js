const mongoose = require('mongoose'),
  Schema = mongoose.Schema
const UserEarningSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    greeting: {
      type: String,
      default: '',
    },

    amount: {
      type: String,
      default: '0',
    },

    type: {
      type: Schema.Types.ObjectId,
      ref: 'Reward',
    },

    imageType: {
      type: Boolean,
      default: false, // (false) when reward gift and when purchase items (true)
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
module.exports = mongoose.model('UserEarning', UserEarningSchema)
