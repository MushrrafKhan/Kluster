const mongoose = require('mongoose'),
  Schema = mongoose.Schema
const SuperLikeProfileSchema = new Schema(
  {
    likedById: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    receivedId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    title: {
      type: String,
      trim: true,
      default: '',
    },

    myDescription: {
      type: String,
      trim: true,
      default: '',
    },

    receiveDescription: {
      type: String,
      trim: true,
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
module.exports = mongoose.model('SuperLikeProfile', SuperLikeProfileSchema)
