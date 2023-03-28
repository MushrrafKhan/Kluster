const mongoose = require("mongoose"),
  Schema = mongoose.Schema,
  bcrypt = require("bcrypt");

const QuestionSchema = new Schema(
  {
    question: {
      type: String,
      trim: true,
      required: true,
    },

    yes: [
      {
        type: String,
        required: true,
        deafault:''
      }
    ],
    no: [
      {
        type: String,
        required: true,
        deafault:''
      }
    ],
    default: {
      type: String,
      required: true,
      deafault:''
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

module.exports = mongoose.model("Question", QuestionSchema);
