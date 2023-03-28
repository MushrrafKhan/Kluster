const mongoose = require('mongoose'),
  Schema = mongoose.Schema
const UserRewardActivitySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    rewardId: {
      type: Schema.Types.ObjectId,
      ref: 'Reward',
    },
    slug: {
      type: String,
      default: '',
    },
    status: {
      type: Boolean,
      default: false,
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
module.exports = mongoose.model('UserRewardActivity', UserRewardActivitySchema)
