const mongoose = require("mongoose"),
  Schema = mongoose.Schema;
const RomantiksSchema = new Schema(
  {
    title:{
        type:String,
        trim:true,
        required:true
    },
    video: {
        type: String,
        default:''
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
module.exports = mongoose.model("Romantiks", RomantiksSchema);