const mongoose = require("mongoose"),
  Schema = mongoose.Schema;
const LikePostSchema = new Schema(
  {
    
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    postId: {
        type: Schema.Types.ObjectId,
        ref: "Post",
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
      createdAt: "created",
      updatedAt: "updated",
    },
    id: false,
    toJSON: {
      getters: true,
    },
    toObject: {
      getters: true,
    },
  }
);
module.exports = mongoose.model("LikePost", LikePostSchema);