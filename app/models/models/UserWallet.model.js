const mongoose = require('mongoose'),
  Schema = mongoose.Schema
const UserWalletSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    currentBalance: {
      type: Number,
      default: 0,
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
module.exports = mongoose.model('UserWallet', UserWalletSchema)
