const mongoose = require('mongoose'),
  Schema = mongoose.Schema
const RewardSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },

    slug: {
      type: String,
      required: true,
    },

    reward: {
      type: Number,
      required: true,
    },

    isSuspended: {
      type: Boolean,
      default: false,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    rewardType: {
      type: String,
      default: 'ONCE',
      enum: ['ONCE', 'UNLMTD'],
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
module.exports = mongoose.model('Reward', RewardSchema)
