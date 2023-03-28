const mongoose = require('mongoose'),
  Schema = mongoose.Schema
const PostSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    image2: {
      type: String,
      default: '',
    },

    image3: {
      type: String,
      default: '',
    },

    // image4: {
    //   type: String,
    //   default: '',
    // },

    // image5: {
    //   type: String,
    //   default: '',
    // },

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
module.exports = mongoose.model('Post', PostSchema)
