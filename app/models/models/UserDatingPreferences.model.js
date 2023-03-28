const mongoose = require('mongoose'),
  Schema = mongoose.Schema
const UserDatingPreferencesSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    interestedIn: {
      type: String,
      default: '',
    },
    scrollingCaps: {
      type: String,
      default: '',
    },
    minAge: {
      type: String,
      default: '',
    },
    maxAge: {
      type: String,
      default: '',
    },
    distance: {
      type: String,
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
module.exports = mongoose.model(
  'UserDatingPreferences',
  UserDatingPreferencesSchema,
)
