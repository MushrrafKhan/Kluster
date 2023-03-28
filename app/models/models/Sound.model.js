const mongoose = require("mongoose"),
  Schema = mongoose.Schema;
const SoundSchema = new Schema(
  {
    title:{
        type:String,
        trim:true,
        required:true
    },
    audio: {
        type: String,
        default:''
    },
    puzzleType: {
        type: String,
        enum: ['correct', 'incorrect', 'other'],
        default: 'other',
    },
    soundType:{
      type: String,
        enum: ['notification', 'background', 'puzzle'],
        default: 'notification',
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
module.exports = mongoose.model("Sound", SoundSchema);