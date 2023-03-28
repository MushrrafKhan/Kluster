const mongoose = require('mongoose'),
  Schema = mongoose.Schema
const UserZodiacRecordSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    days: {
      type: Number,
      default: 1,
    },
    time:{
        type:String,
    },
    isSuspended: {
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
module.exports = mongoose.model('UserZodiacRecord', UserZodiacRecordSchema)