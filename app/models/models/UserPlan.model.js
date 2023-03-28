const mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  bcrypt = require('bcrypt')
const UserPlanSchema = new Schema(
  {
    plansId: {
      type: Schema.Types.ObjectId,
      ref: 'Plans',
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    isActive: {
      type: Boolean,
      default: false,
    },

    duration: {
      type: String,
      default: '',
    },
    time: {
      type: String,
      default: '',
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
module.exports = mongoose.model('UserPlan', UserPlanSchema)