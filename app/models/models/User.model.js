const mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  bcrypt = require('bcrypt')

const UserSchema = new Schema(
  {
    name: {
      type: String,
      //required: true,
      trim: true,
      default: '',
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      //required: true,
    },

    phoneNumber: {
      type: String,
      default: '',
    },

    dob: {
      type: String,
      default: '',
    },
    gender: {
      type: String,
      default: '',
    },
    levelOfEducationId: {
      type: Schema.Types.ObjectId,
      ref: 'Education',
    },

    interests: [
      {
        type: String,
        default: '',
      },
    ],

    // profileTimerLength: {
    //   type: String,
    //   default: '1 hours',
    // },

    password: {
      type: String,
      //required: true,
    },

    deviceToken: {
      type: String,
      trim: true,
    },

    deviceType: {
      type: String,
      trim: true,
    },

    deviceId: {
      type: String,
    },

    emailVerify: {
      type: Boolean,
      default: false,
    },

    isLogin: {
      type: Boolean,
      default: false,
    },

    otp: {
      type: String,
      default: '',
    },

    progress: {
      // for signup multiple stage (screen)
      type: Number,
      default: 0,
    },

    image: {
      type: String,
      trim: true,
      default: '',
    },

    notification: {
      type: Boolean,
      default: true,
    },

    location: {
      type: Boolean,
      default: true,
    },

    sound: {
      type: Boolean,
      default: true,
    },

    backgroundMusic: {
      type: Boolean,
      default: true,
    },

    loc: {
      type: { type: String, default: 'Point' },
      coordinates: [
        {
          type: Number,
        },
      ],
    },

    isSubscribed: {
      type: Boolean,
      default: false,
    },

    subscriptionDate: {
      type: Date,
    },

    subscriptionId: {
      type: Number,
    },

    authTokenIssuedAt: Number,

    emailToken: {
      // for signup
      type: String,
      default: '',
    },

    resetToken: {
      // for forgot password
      type: String,
      default: '',
    },

    address: {
      type: String,
      default: '',
    },

    bio: {
      type: String,
      default: '',
      trim: true,
    },

    updateProfileTime: {
      type: String,
      default: '',
    },

    isSuspended: {
      type: Boolean,
      default: false,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    questionSkip: {
      type: Boolean,
      default: false,
    },

    referalCode: {
      // for signup
      type: String,
      default: '',
    },

    countryCode: {
      // for signup
      type: String,
      default: '',
    },

    dayLogin: {
      type: Boolean,
      default: false,
    }

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

UserSchema.pre('save', async function (next) {
  const user = this

  if (!user.isModified('password')) return next()
  try {
    const saltRounds = parseInt(process.env.BCRYPT_ITERATIONS, 10) || 10
    user.password = await bcrypt.hash(user.password, saltRounds)
    console.log('----9save in db9===', user.password);
    next()
  } catch (e) {
    next(e)
  }
})

UserSchema.methods.comparePassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password)
  } catch (e) {
    return false
  }
}

module.exports = mongoose.model('User', UserSchema)
