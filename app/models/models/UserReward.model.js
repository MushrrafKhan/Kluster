const mongoose = require('mongoose'),
  Schema = mongoose.Schema
const UserRewardSchema = new Schema(
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
    },
    progress: {
      type: Number,
      default: 0,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    isCompleted: {
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
module.exports = mongoose.model('UserReward', UserRewardSchema)
