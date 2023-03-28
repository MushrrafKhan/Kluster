const mongoose = require("mongoose"),
  Schema = mongoose.Schema;
const EducationSchema = new Schema(
  {
    name:{
        type:String,
        trim:true,
        required:true
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
module.exports = mongoose.model("Education", EducationSchema);