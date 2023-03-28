const mongoose = require("mongoose"),
  Schema = mongoose.Schema;
const NotificationSchema = new Schema(
  {

    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    receivedId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
      trim: true,
      default: ''
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    type: {
      type: String,
      trim: true,
      default: ''
    },
    read: {
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
module.exports = mongoose.model("Notification", NotificationSchema);