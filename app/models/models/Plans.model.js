const mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  bcrypt = require('bcrypt')
const PlansSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      default: 'FREE',
      enum: ['FREE', 'PAID'],
    },
    price: {
      type: String,
    },
    price6: {
      type: String,
    },
    price12: {
      type: String,
    },
    image: {
      type: String,
    },
    romantiks: {
      type: String,
      dafault: '0',
    },
    dm: {
      type: String,
      dafault: '0',
    },
    miles: {
      type: String,
      dafault: '0',
    },
    profilePicture: {
      type: String,
      dafault: '0',
    },
    video: {
      type: String,
      dafault: '0',
    },
    questions: {
      type: String,
      dafault: '0',
    },
    bioLimit: {
      type: String,
      dafault: '0',
    },
    perstraitsOf55: {
      type: String,
      dafault: '0',
    },
    like: {
      type: String,
      dafault: '0',
    },
    love: {
      type: String,
      dafault: '0',
    },
    hold: {
      type: String,
      dafault: '0',
    },
    lock: {
      type: String,
      dafault: '0',
    },
    superLike: {
      type: String,
      dafault: '0',
    },
    replenishTime: {
      type: String,
      default: '',
    },
    comptiblity: {
      type: String,
      dafault: '0',
    },
    scrollingCaps: {
      type: String,
      dafault: '0',
    },
    ads: {
      type: String,
      dafault: '0',
    },
    freeMembership: {
      type: String,
      dafault: '0',
    },
    age: {
      type: String,
      dafault: '0',
    },
    interests: {
      type: String,
      dafault: '0',
    },
    zodiacDescription: {
      type: String,
      dafault: '0',
    },
    phoneCalls: {
      type: String,
      dafault: '0',
    },
    videoCalls: {
      type: String,
      dafault: '0',
    },
    chatBackground: {
      type: String,
      dafault: '0',
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    nickName: {
      type: String,
      default: '',
    },
    colorCode: {
      type: String,
      default: '',
    },
    replenishTime: {
      type: String,
      default: '',
  },
  superLike: {
    type: String,
    dafault: '0',
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
module.exports = mongoose.model('Plans', PlansSchema)
