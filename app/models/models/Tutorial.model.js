const mongoose = require("mongoose"),
  Schema = mongoose.Schema;
const TutorialSchema = new Schema(
  {
    tutorialName:{
        type:String,
        trim:true,
        required:true
    },
    tutorialDescription: {
      type: String,
      trim: true,
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
module.exports = mongoose.model("Tutorial", TutorialSchema);