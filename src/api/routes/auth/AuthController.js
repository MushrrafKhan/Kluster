const {
  models: {
    User,
    Education,
    Characteristics,
    Question,
    Tutorial,
    Country,
    Plans,
    UserPlan,
    UserActivity,
    UserWallet,
    UserRewardActivity,
    Reward,
    UserCharacteristics,
    UserChatColor,
    ChatColor,
    Romantiks,
    UserPaymentDetail
  },
} = require('../../../../app/models')
const mailer = require('../../../../lib/mailer')

const sms = require('../../../../lib/sms')
const { signToken } = require('../../util/auth')
const {
  utcDateTime,
  generateOtp,
  randomString,
  generateResetToken,
  generateCode,
  sendSms,
} = require('../../../../lib/util')
var _ = require('lodash')
const jwtToken = require('jsonwebtoken')
const sgMail = require('@sendgrid/mail')
const async = require('async')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
let STATUS = process.env.STATUS

//console.log(STATUS)
//const { compress } = require('compress-images/promise');

//const mailer = require('../../../../lib/mailer');

let apiEnv = process.env.NODE_ENV
let FROM_MAIL = process.env.FROM_MAIL
//console.log("----------------------------------------------------------------------",FROM_MAIL)
// console.log('this is env:', apiEnv)
var moment = require('moment')
const cron = require("node-cron");

const multer = require('multer')
const { UserDatingPreferences } = require('../../../../app/models/models')
//var sgTransport = require('nodemailer-sendgrid-transport');
//var SGoptions = {
//  auth: {
//    api_key: SendGridKey
//  }
//};

class AuthController {
  async signup(req, res, next) {
    let {
      email,
      password,
      deviceToken,
      deviceType,
      countryCode,
      phoneNumber,
      lat,
      long,
    } = req.body

    try {
      //email find if exist or not
      let x = await User.findOne({
        email,
      })
      // // find free plan
      // let freePlan = await Plans.findOne({ name: 'Srius' })

      if (x) {
        if (x.emailVerify && x.isSuspended) {
          return res.warn({}, 'Something went wrong')
        } else if (x.emailVerify && !x.isSuspended) {
          return res.warn(
            {},
            'Account already exist with this email,please login !',
          )
        } else if (!x.emailVerify) {
          let otp

          if (apiEnv == 'development') {
            otp = generateCode()
          } else {
            otp = generateCode()
          }

          if (STATUS === '1') {
            otp = generateCode()
          } else {
            otp = 1234
          }

          const platform = req.headers['x-klust3r-platform']
          const version = req.headers['x-klust3r-version']
          x.email = email
          x.password = password
          x.countryCode = countryCode
          x.phoneNumber = phoneNumber
          let location = []
          if (lat && long) {
            location.push(lat)
            location.push(long)
            x.loc.coordinates = location
          }

          x.otp = otp
          x.authTokenIssuedAt = utcDateTime().valueOf()
          x.emailToken = generateResetToken(12)
          x.emailVerify = false

          if (deviceToken) {
            x.deviceToken = deviceToken
            x.deviceType = deviceType
          }

          let user = await x.save()

          // console.log(user)

          let emailToSend = user.email
          let token = user.emailToken

          //Construct mail body here
          const msg = {
            to: emailToSend,
            from: FROM_MAIL, // Change to your verified sender
            subject: 'klust3r: Verify  OTP to complete signup',
            text: 'Please enter the following OTP to verify : ' + user.otp,
            html:
              '<strong>Please enter the following OTP to verify:' +
              user.otp +
              ' </strong>',
          }
          if (STATUS === '1') {
            sgMail
              .send(msg)
              .then(() => {
                console.log('Email sent')

                const userJson = user.toJSON()
                  ;[
                    'password',
                    'authTokenIssuedAt',
                    'otp',
                    'emailToken',
                    '__v',
                  ].forEach((key) => delete userJson[key])
                return res.success(
                  {
                    language: req.headers['accept-language'],
                    token,
                    user: userJson,
                  },
                  'Please verify otp to complete registration',
                )
              })
              .catch((error) => {
                console.error(error)
                res.next(error)
              })
          } else {
            const userJson = user.toJSON()
              ;[
                'password',
                'authTokenIssuedAt',
                'otp',
                'emailToken',
                '__v',
              ].forEach((key) => delete userJson[key])
            return res.success(
              {
                language: req.headers['accept-language'],
                token,
                user: userJson,
              },
              'Please verify otp to complete registration',
            )
          }
        }
      } else {
        let user = new User()
        let otp

        if (apiEnv == 'development') {
          otp = generateCode()
        } else {
          otp = generateCode()
        }

        if (STATUS === '1') {
          otp = generateCode()
        } else {
          otp = 1234
        }

        const platform = req.headers['x-klust3r-platform']
        const version = req.headers['x-klust3r-version']

        user.email = email
        user.password = password
        user.countryCode = countryCode
        user.phoneNumber = phoneNumber
        let location = []
        if (lat && long) {
          location.push(lat)
          location.push(long)
          user.loc.coordinates = location
        }
        user.otp = otp
        user.authTokenIssuedAt = utcDateTime().valueOf()
        user.emailToken = generateResetToken(12)
        user.emailVerify = false

        if (deviceToken) {
          user.deviceToken = deviceToken
          user.deviceType = deviceType
        }

        user = await user.save()

        let emailToSend = user.email
        let token = user.emailToken
        // -------- add plan default free
        // if (freePlan) {
        //   let plan = await new UserPlan({
        //     userId: user._id,
        //     plansId: freePlan._id,
        //     isActive: true,
        //   })
        //   await plan.save()
        // }

        // -------- add activity default

        const msg = {
          to: emailToSend,
          from: FROM_MAIL, // Change to your verified sender
          subject: 'klust3r: Verify  OTP to complete signup',
          text:
            'Please enter the following OTP to verify your login : ' + user.otp,
          html:
            '<strong>Please enter the following OTP to verify your login :' +
            user.otp +
            ' </strong>',
        }

        if (STATUS === '1') {
          sgMail
            .send(msg)
            .then(() => {
              console.log('Email sent')

              const userJson = user.toJSON()
                ;[
                  'password',
                  'authTokenIssuedAt',
                  'otp',
                  'emailToken',
                  '__v',
                ].forEach((key) => delete userJson[key])
              return res.success(
                {
                  language: req.headers['accept-language'],
                  token,
                  user: userJson,
                },
                'Please verify otp to complete registration',
              )
            })
            .catch((error) => {
              console.error(error)
            })
        } else {
          const userJson = user.toJSON()
            ;[
              'password',
              'authTokenIssuedAt',
              'otp',
              'emailToken',
              '__v',
            ].forEach((key) => delete userJson[key])
          return res.success(
            {
              language: req.headers['accept-language'],
              token,
              user: userJson,
            },
            'Please verify otp to complete registration',
          )
        }
      }
    } catch (err) {
      console.log(err)
      return next(err)
    }
  }

  async verifyOtp(req, res, next) {
    let { otp, email, token } = req.body
    try {
      let user
      user = await User.findOne({
        email,
        isSuspended: false,
      })

      if (!user) {
        return res.unauthorized(null, req.__('UNAUTHORIZED'))
      } else {
        if (user.emailToken === token) {
          if (user.otp === otp) {
            user.emailVerify = true
            user.progress = 1
            let referalcode = randomString(10)
            user.referalCode = referalcode
            let newUser = await user.save()
            const userJson = newUser.toJSON()
            const jwttoken = signToken(user)
            userJson.jwt = jwttoken
              ;[
                'password',
                'authTokenIssuedAt',
                'otp',
                'emailToken',
                '__v',
              ].forEach((key) => delete userJson[key])
            let education = await Education.find({ isSuspended: false })

            return res.success(
              {
                user: userJson,
                token: token,
                progress: userJson.progress,
                // education:education
              },
              req.__('OTP_VERIFY_SUCCESS'),
            )
          } else {
            return res.warn('', req.__('INVALID_OTP'))
          }
        } else if (user.resetToken === token) {
          if (user.otp === otp) {
            user.emailVerify = true
            let newUser = await user.save()
            const userJson = newUser.toJSON()
            const jwttoken = signToken(user)
            userJson.jwt = jwttoken
              ;[
                'password',
                'authTokenIssuedAt',
                'otp',
                'emailToken',
                'jwt',
                '__v',
              ].forEach((key) => delete userJson[key])
            return res.success(
              {
                user: userJson,
                token: token,
              },
              req.__('OTP_VERIFY_SUCCESS'),
            )
          } else {
            return res.warn('', req.__('INVALID_OTP'))
          }
        } else {
          return res.warn('', req.__('Invalid token'))
        }
      }
    } catch (err) {
      return next(err)
    }
  }

  async allPlans(req, res, next) {
    try {

      let user = await User.findOne({ _id: req.user._id, isSuspended: false, isDeleted: false });
      if (user) {
        user.progress = 3;
        await user.save();
      }

      let data = []
      let memberships = [{ value: 'Memberships' }]
      let romantiks = [{ value: 'ROMANTIKS/DAY GIFT MESSAGE' }]
      let dm = [{ value: 'DM/DAY' }]
      let miles = [{ value: 'MILES' }]
      let profilePicture = [{ value: 'PROFILE PICTURE' }]
      let video = [{ value: 'VIDEO' }]
      let questions = [{ value: 'THE QUESTIONS 1-9' }]
      let selfDescription = [{ value: 'SELF DESCRIPTION WORD LIMIT' }]
      let perstraitsOf55 = [{ value: 'PERS TRAITS 1-9 OF 55' }]
      let like = [{ value: 'TEKEN (LIKE)' }]
      let love = [{ value: 'KOI (LOVE)' }]
      let hold = [{ value: 'KORI (HOLD)' }]
      let lock = [{ value: 'SASKI (LOCK)' }]
      let comptibility = [{ value: '%COMPTIBILITY' }]
      let scrollingCaps = [{ value: 'SCROLLING CAPS' }]
      let ads = [{ value: 'ADS/STICKER ADS' }]
      let freeMembership = [{ value: 'FREE MEMBERSHIPS' }]
      let age = [{ value: 'AGE' }]
      let interests = [{ value: 'INTERESTS' }]
      let zodiacDescription = [{ value: 'ZODIAC DESCRIPTION' }]
      let phoneCalls = [{ value: 'PHONE CALLS' }]
      let videoCalls = [{ value: 'VIDEO CALLS' }]
      let chatBackground = [{ value: 'CHAT BACKGROUND' }]
      let price = [{ value: 'PRICE USD' }]

      let _memberships = await Plans.aggregate([
        {
          $match: {
            isSuspended: false,
          },
        },

        {
          $project: {
            value: '$image',
            // select:
          },
        },
        {
          $sort: { cretaed: 1 },
        },
      ])
      memberships = memberships.concat(_memberships)

      let _romantiks = await Plans.aggregate([
        {
          $match: {
            isSuspended: false,
          },
        },

        {
          $project: {
            value: '$romantiks',
            colorCode: '$colorCode',
          },
        },
        {
          $sort: { cretaed: 1 },
        },
      ])
      romantiks = romantiks.concat(_romantiks)

      let _dm = await Plans.aggregate([
        {
          $match: {
            isSuspended: false,
          },
        },

        {
          $project: {
            value: '$dm',
            colorCode: '$colorCode',
          },
        },
        {
          $sort: { cretaed: 1 },
        },
      ])
      dm = dm.concat(_dm)

      let _miles = await Plans.aggregate([
        {
          $match: {
            isSuspended: false,
          },
        },

        {
          $project: {
            value: '$miles',
            colorCode: '$colorCode',
          },
        },
        {
          $sort: { cretaed: 1 },
        },
      ])
      miles = miles.concat(_miles)

      let _profilePicture = await Plans.aggregate([
        {
          $match: {
            isSuspended: false,
          },
        },

        {
          $project: {
            value: '$profilePicture',
            colorCode: '$colorCode',
          },
        },
        {
          $sort: { cretaed: 1 },
        },
      ])
      profilePicture = profilePicture.concat(_profilePicture)

      let _video = await Plans.aggregate([
        {
          $match: {
            isSuspended: false,
          },
        },

        {
          $project: {
            value: '$video',
            colorCode: '$colorCode',
          },
        },
        {
          $sort: { cretaed: 1 },
        },
      ])
      video = video.concat(_video)

      let _questions = await Plans.aggregate([
        {
          $match: {
            isSuspended: false,
          },
        },

        {
          $project: {
            value: '$questions',
            colorCode: '$colorCode',
          },
        },
        {
          $sort: { cretaed: 1 },
        },
      ])
      questions = questions.concat(_questions)

      let _selfDescription = await Plans.aggregate([
        {
          $match: {
            isSuspended: false,
          },
        },

        {
          $project: {
            value: '$bioLimit',
            colorCode: '$colorCode',
          },
        },
        {
          $sort: { cretaed: 1 },
        },
      ])
      selfDescription = selfDescription.concat(_selfDescription)

      let _perstraitsOf55 = await Plans.aggregate([
        {
          $match: {
            isSuspended: false,
          },
        },

        {
          $project: {
            value: '$perstraitsOf55',
            colorCode: '$colorCode',
          },
        },
        {
          $sort: { cretaed: 1 },
        },
      ])
      perstraitsOf55 = perstraitsOf55.concat(_perstraitsOf55)

      let _like = await Plans.aggregate([
        {
          $match: {
            isSuspended: false,
          },
        },

        {
          $project: {
            value: '$like',
            colorCode: '$colorCode',
          },
        },
        {
          $sort: { cretaed: 1 },
        },
      ])
      like = like.concat(_like)

      let _love = await Plans.aggregate([
        {
          $match: {
            isSuspended: false,
          },
        },

        {
          $project: {
            value: '$love',
            colorCode: '$colorCode',
          },
        },
        {
          $sort: { cretaed: 1 },
        },
      ])
      love = love.concat(_love)

      let _hold = await Plans.aggregate([
        {
          $match: {
            isSuspended: false,
          },
        },

        {
          $project: {
            value: '$hold',
            colorCode: '$colorCode',
          },
        },
        {
          $sort: { cretaed: 1 },
        },
      ])
      hold = hold.concat(_hold)

      let _lock = await Plans.aggregate([
        {
          $match: {
            isSuspended: false,
          },
        },

        {
          $project: {
            value: '$lock',
            colorCode: '$colorCode',
          },
        },
        {
          $sort: { cretaed: 1 },
        },
      ])
      lock = lock.concat(_lock)

      let _comptibility = await Plans.aggregate([
        {
          $match: {
            isSuspended: false,
          },
        },

        {
          $project: {
            value: '$comptiblity',
            colorCode: '$colorCode',
          },
        },
        {
          $sort: { cretaed: 1 },
        },
      ])
      comptibility = comptibility.concat(_comptibility)

      let _scrollingCaps = await Plans.aggregate([
        {
          $match: {
            isSuspended: false,
          },
        },

        {
          $project: {
            value: '$scrollingCaps',
            colorCode: '$colorCode',
          },
        },
        {
          $sort: { cretaed: 1 },
        },
      ])
      scrollingCaps = scrollingCaps.concat(_scrollingCaps)

      let _ads = await Plans.aggregate([
        {
          $match: {
            isSuspended: false,
          },
        },

        {
          $project: {
            value: '$ads',
            colorCode: '$colorCode',
          },
        },
        {
          $sort: { cretaed: 1 },
        },
      ])
      ads = ads.concat(_ads)

      let _freeMembership = await Plans.aggregate([
        {
          $match: {
            isSuspended: false,
          },
        },

        {
          $project: {
            value: '$freeMembership',
            colorCode: '$colorCode',
          },
        },
        {
          $sort: { cretaed: 1 },
        },
      ])
      freeMembership = freeMembership.concat(_freeMembership)

      let _age = await Plans.aggregate([
        {
          $match: {
            isSuspended: false,
          },
        },

        {
          $project: {
            value: '$age',
            colorCode: '$colorCode',
          },
        },
        {
          $sort: { cretaed: 1 },
        },
      ])
      age = age.concat(_age)

      let _interests = await Plans.aggregate([
        {
          $match: {
            isSuspended: false,
          },
        },

        {
          $project: {
            value: '$interests',
            colorCode: '$colorCode',
          },
        },
        {
          $sort: { cretaed: 1 },
        },
      ])
      interests = interests.concat(_interests)

      let _zodiacDescription = await Plans.aggregate([
        {
          $match: {
            isSuspended: false,
          },
        },

        {
          $project: {
            value: '$zodiacDescription',
            colorCode: '$colorCode',
          },
        },
        {
          $sort: { cretaed: 1 },
        },
      ])
      zodiacDescription = zodiacDescription.concat(_zodiacDescription)

      let _phoneCalls = await Plans.aggregate([
        {
          $match: {
            isSuspended: false,
          },
        },

        {
          $project: {
            value: '$comptiblity',
            colorCode: '$colorCode',
          },
        },
        {
          $sort: { cretaed: 1 },
        },
      ])
      phoneCalls = phoneCalls.concat(_phoneCalls)

      let _videoCalls = await Plans.aggregate([
        {
          $match: {
            isSuspended: false,
          },
        },

        {
          $project: {
            value: '$comptiblity',
            colorCode: '$colorCode',
          },
        },
        {
          $sort: { cretaed: 1 },
        },
      ])
      videoCalls = videoCalls.concat(_videoCalls)

      let _chatBackground = await Plans.aggregate([
        {
          $match: {
            isSuspended: false,
          },
        },

        {
          $project: {
            value: '$chatBackground',
            colorCode: '$colorCode',
          },
        },
        {
          $sort: { cretaed: 1 },
        },
      ])
      chatBackground = chatBackground.concat(_chatBackground)

      let _price = await Plans.aggregate([
        {
          $match: {
            isSuspended: false,
          },
        },

        {
          $project: {
            value: '$price',
            colorCode: '$colorCode',
          },
        },
        {
          $sort: { cretaed: 1 },
        },
      ])
      price = price.concat(_price)

      // romantiks.push({ value: '$ROMANTIKS/DAY GIFT MESSAGE' })
      // dm.push({ value: '$DM/DAY' })
      // miles.push({ value: '$MILES' })
      // profilePicture.push({ value: '$PROFILE PICTURE' })
      // video.push({ value: '$VIDEO' })
      // questions.push({ value: '$THE QUESTIONS 1-9' })
      // selfDescription.push({ value: '$SELF DESCRIPTION WORD LIMIT' })
      // perstraitsOf55.push({ value: '$PERS TRAITS 1-9 OF 55' })
      // like.push({ value: '$TEKEN (LIKE)' })
      // love.push({ value: '$KOI (LOVE)' })
      // hold.push({ value: '$KORI (HOLD)' })
      // lock.push({ value: '$SASKI (LOCK)' })
      // comptibility.push({ value: '$%COMPTIBILITY' })
      // scrollingCaps.push({ value: '$SCROLLING CAPS' })
      // ads.push({ value: '$ADS/STICKER ADS' })
      // freeMembership.push({ value: '$FREE MEMBERSHIPS' })
      // age.push({ value: '$AGE' })
      // interests.push({ value: '$INTERESTS' })
      // zodiacDescription.push({ value: '$ZODIAC DESCRIPTION' })
      // phoneCalls.push({ value: '$PHONE CALLS' })
      // videoCalls.push({ value: '$VIDEO CALLS' })
      // chatBackground.push({ value: '$CHAT BACKGROUND' })
      // price.push({ value: '$PRICE USD' })

      data.push(
        memberships,
        romantiks,
        dm,
        miles,
        profilePicture,
        video,
        questions,
        selfDescription,
        perstraitsOf55,
        like,
        love,
        hold,
        lock,
        comptibility,
        scrollingCaps,
        ads,
        freeMembership,
        age,
        interests,
        zodiacDescription,
        phoneCalls,
        videoCalls,
        chatBackground,
        price,
      )

      return res.success({ progress: user.progress, data }, 'Plans fetch successfully')
    } catch (err) {
      console.log(err)
      return next(err)
    }
  }

  async singlePlanDetail(req, res, next) {
    let { planId } = req.body
    try {
      let planDetail = await Plans.findOne({
        _id: planId,
        isSuspended: false,
      }).lean()
      if (planDetail) {
        let perMonthsIn1th = (planDetail.price / 1).toFixed(2)
        let perMonthsIn6th = (planDetail.price6 / 6).toFixed(2)
        let perMonthsIn12th = (planDetail.price12 / 12).toFixed(2)

        return res.success(
          {
            planDetail,
            perMonthsIn1th,
            perMonthsIn6th,
            perMonthsIn12th,
          },
          'Plan detail fetch successfully',
        )
      } else {
        return res.warn({}, 'Plan not found or suspended')
      }
    } catch (err) {
      console.log(err)
      return next(err)
    }
  }

  async planDetailAccorMonths(req, res, next) {
    let { planId, months } = req.body
    try {
      let planDetail = await Plans.findOne({
        _id: planId,
        isSuspended: false,
      }).lean()
      // console.log('----',planDetail)
      if (planDetail) {
        if (planDetail.price == 'FREE') {
          return res.success(
            {
              planName: planDetail.name,
              planId: planDetail._id,
              planDescription: planDetail.description,
              planImage: planDetail.image,
              planPrice: planDetail.price,
              planNickName: planDetail.nickName,
              planColorCode: planDetail.colorCode,
            },
            'Plan detail fetch successfully',
          )
        }
        // }
        if (months == 1) {
          return res.success(
            {
              planName: planDetail.name,
              planId: planDetail._id,
              planDescription: planDetail.description,
              planImage: planDetail.image,
              planPrice: planDetail.price,
              planNickName: planDetail.nickName,
              planColorCode: planDetail.colorCode,
            },
            'Plan detail fetch successfully',
          )
        }
        if (months == 6) {
          return res.success(
            {
              planName: planDetail.name,
              planId: planDetail._id,
              planDescription: planDetail.description,
              planImage: planDetail.image,
              planPrice: planDetail.price6,
              planNickName: planDetail.nickName,
              planColorCode: planDetail.colorCode,
            },
            'Plan detail fetch successfully',
          )
        }
        if (months == 12) {
          return res.success(
            {
              planName: planDetail.name,
              planId: planDetail._id,
              planDescription: planDetail.description,
              planImage: planDetail.image,
              planPrice: planDetail.price12,
              planNickName: planDetail.nickName,
              planColorCode: planDetail.colorCode,
            },
            'Plan detail fetch successfully',
          )
        }
      } else {
        return res.notFound({}, 'Plan not found or suspended')
      }
    } catch (err) {
      console.log(err)
      return next(err)
    }
  }

  async purchasePlan(req, res, next) {
    let { planId, month } = req.body // month 0 when plan is free
    try {
      let findPlan = await Plans.findOne({ _id: planId, isSuspended: false })
      let findUser = await User.findOne({ _id: req._id })
      let findReward = await Reward.find({ isSuspended: false })
      let chatColor = await ChatColor.find({ isSuspended: false })
      if (findPlan) {
        let findUserPlan = await UserPlan.findOne({
          userId: req._id,
          isActive: true,
        })

        // if (findUserPlan) {
        //   await findUserPlan.remove()
        //   let userPlan = new UserPlan()
        //   userPlan.userId = req._id
        //   userPlan.plansId = planId
        //   userPlan.isActive = true
        //   if (findPlan.type == 'PAID') {
        //     userPlan.duration = month
        //   }
        //   if (findPlan.type == 'FREE') {
        //     findUser.questionSkip = true
        //   }
        //   await userPlan.save()
        //   findUser.progress = 4
        //   // if (findPlan.type == 'FREE') {
        //   //   findUser.questionSkip = true
        //   // }
        //   let savedUser = await findUser.save()
        //   return res.success(
        //     {
        //       findPlan,
        //       questionSkip: savedUser.questionSkip,
        //       progress: savedUser.progress,
        //     },
        //     'Plan purchase successfully',
        //   )
        // } else {

        // }
        let userPlan = new UserPlan()
        userPlan.userId = req._id
        userPlan.plansId = planId
        userPlan.isActive = true
        if (findPlan.type == 'PAID') {

          let userPayment = new UserPaymentDetail()
          userPayment.userId = req._id;
          userPayment.plansId = planId;
          if(month == 1){
            userPayment.currency = findPlan.price
          }else if(month == 6){
            userPayment.currency = findPlan.price6
          }else{
            userPayment.currency = findPlan.price12
          }
          let userPaymentHistory = await userPayment.save()
          console.log('------------userPaymentHistory---------------',userPaymentHistory)

          userPlan.duration = month
          userPlan.time = moment().format()
          var travelTime = moment()
            .add(Number(month), "month")
            .format();
          let date_ = new Date(travelTime);
          let months = date_.getMonth() + 1;
          let d = date_.getDate();
          let hours = date_.getHours();
          let mints = date_.getMinutes();
          let sec = date_.getSeconds();
          cron.schedule(
            `${sec} ${mints} ${hours} ${d} ${months} *`,
            async () => {

              // console.log("----crone hit -----")
              let currentTime = moment().format()
              let _userPlan = await UserPlan.findOne({
                userId: req._id,
                isActive: true,
              });
              let _UserActivity = await UserActivity.findOne({ userId: req._id });
              let _userDating = await UserDatingPreferences.findOne({userId: req._id})

              var planEndTime = moment(_userPlan.time)
                .add(Number(_userPlan.duration), "month")
                .format();
              // console.log("-----=====planEndTime", planEndTime)


              if (_userPlan.time && _userPlan.duration) {
                // console.log("-----=====>>>>>>>")

                if (planEndTime == currentTime) {
                  // console.log("-----=====>>>>>>><<<<<<<<<<")

                  let freePlan = await Plans.findOne({ type: "FREE", isSuspended: false });
                  _userPlan.plansId = freePlan._id
                  _userPlan.time = ''
                  _userPlan.duration = ''
                  await _userPlan.save();
                  _UserActivity.likeCount = freePlan.like;
                  _UserActivity.likeEndTime = "0";
                  _UserActivity.loveCount = freePlan.love;
                  _UserActivity.loveEndTime = "0";
                  _UserActivity.holdCount = freePlan.hold;
                  _UserActivity.holdEndTime = "0";
                  _UserActivity.lockCount = freePlan.lock;
                  _UserActivity.lockEndTime = "0";
                  _UserActivity.superLikeCount = freePlan.superLike;
                  _UserActivity.superLikeEndTime = "0";
                  _UserActivity.romantikCount = freePlan.romantiks;
                  _UserActivity.romantikEndTime = "0";
                  _UserActivity.sentRomantik = "0";
                  _UserActivity.messageCount = freePlan.dm;
                  _UserActivity.messageEndTime = "0";
                  _UserActivity.sentMessage = "0";
                  _UserActivity.chatBackground = freePlan.chatBackground;
                  _UserActivity.phoneCalls = freePlan.phoneCalls;
                  _UserActivity.videoCalls = freePlan.videoCalls;
                  _UserActivity.zodiacDescription = freePlan.zodiacDescription;

                  await _UserActivity.save();
                  // console.log("-----=====>>>>>>>_UserActivity", _UserActivity)
                  // console.log("-----=====>>>>>>>_userPlan", _userPlan)
                  _userDating.scrollingCaps='SLOWER'
                  await _userDating.save();

                }

              }

            }
          );
        }

        await userPlan.save()
        findUser.progress = 4
        if (findPlan.type == 'FREE') {
          findUser.questionSkip = true
        }
        let savedUser = await findUser.save()

        let userActivity = new UserActivity({
          userId: findUser._id,
          likeCount: findPlan.like,
          loveCount: findPlan.love,
          holdCount: findPlan.hold,
          lockCount: findPlan.lock,
          superLikeCount: findPlan.superLike,
          romantikCount: findPlan.romantiks,
          chatBackground: findPlan.chatBackground,
          messageCount: findPlan.dm,
          phoneCalls: findPlan.phoneCalls,
          videoCalls: findPlan.videoCalls,
          zodiacDescription: findPlan.zodiacDescription,
        })
        await userActivity.save()

        let userWallet = new UserWallet()
        userWallet.userId = req._id
        await userWallet.save()
        if (findReward.length > 0) {
          findReward.map(async (reward) => {
            let userRewardActivity = new UserRewardActivity({
              userId: req._id,
              rewardId: reward._id,
              slug: reward.slug,
            })
            await userRewardActivity.save()
          })
        }

        let chatBg = new UserChatColor({
          userId: findUser._id,
          colorId: chatColor[0]._id,
          colorType: 'ChatBg'

        })
        await chatBg.save()

        let textBg = new UserChatColor({
          userId: findUser._id,
          colorId: chatColor[1]._id,
          colorType: 'TextBg'

        })
        await textBg.save()

        return res.success(
          {
            findPlan,
            questionSkip: savedUser.questionSkip,
            progress: savedUser.progress,
          },
          'Plan purchase successfully',
        )
      } else {
        return res.notFound({}, 'Plan not found or suspended')
      }
    } catch (err) {
      console.log(err)
      return next(err)
    }
  }

  async plansListInProfileUpgrade(req, res, next) {
    try {
      let allPlans = await Plans.find(
        { isSuspended: false },
        // { lock: 1, image: 1, name: 1, colorCode: 1 },
      ).lean()
      let plans = []
      if (allPlans.length > 0) {
        async.mapSeries(
          allPlans,
          async function (allPlans) {
            let obj = {}
            let userPlan = await UserPlan.findOne({
              userId: req._id,
              isActive: true,
            })
            console.log('==userplan', userPlan)
            obj._id = allPlans._id
            obj.image = allPlans.image
            obj.name = allPlans.name
            obj.price = allPlans.price
            obj.lock = allPlans.lock
            obj.colorCode = allPlans.colorCode
            if (
              userPlan &&
              userPlan.plansId.toString() == allPlans._id.toString()
            ) {
              obj.select = true
            } else {
              obj.select = false
            }
            console.log('==========allplans', allPlans)

            plans.push(obj)
          },
          async function () {
            return res.success({ plans }, 'Plans fetch successfully')
          },
        )
      } else {
        return res.notFound({}, 'No plans found')
      }
    } catch (err) {
      console.log(err)
      return next(err)
    }
  }

  async logIn(req, res, next) {
    try {
      const {
        email,
        password,
        deviceToken,
        deviceId,
        deviceType,
        lat,
        long,
      } = req.body

      let user = await User.findOne({ email: email, emailVerify: true })

      if (!user) {
        return res.warn(
          '',
          'your e-mail does not verified in this app please sign up properly',
        )
      } else {
        let findPlan = await UserPlan.findOne({
          userId: user._id,
          isActive: true,
        }).populate({ path: 'plansId', model: Plans })
        if (user.isSuspended) {
          return res.warn({}, 'Account suspended')
        }
        const passwordMatched = await user.comparePassword(password)

        if (!passwordMatched) {
          return res.warn('', 'Please Check Your Email & Password')
        }
        user.authTokenIssuedAt = utcDateTime().valueOf()
        user.deviceToken = deviceToken
        user.deviceType = deviceType
        user.deviceId = deviceId

        let location = []
        if (lat && long) {
          location.push(lat)
          location.push(long)
          user.loc.coordinates = location
        }

        if (user.progress == 1) {
          let user_ = await user.save()
          const jwttoken = signToken(user_)

          const userJson = user_.toJSON()
            ;[
              'password',
              'authTokenIssuedAt',
              'otp',
              'emailToken',
              '__v',
            ].forEach((key) => delete userJson[key])
          userJson.jwt = jwttoken

          return res.success(
            {
              user: userJson,
              progress: user.progress,
            },
            req.__('Please view tutorials'),  //Please choose a plan
          )
        }

        if (user.progress == 2) {
          let user_ = await user.save()
          const jwttoken = signToken(user_)

          const userJson = user_.toJSON()

            ;[
              'password',
              'authTokenIssuedAt',
              'otp',
              'emailToken',
              '__v',
            ].forEach((key) => delete userJson[key])
          userJson.jwt = jwttoken

          return res.success(
            {
              user: userJson,
              questionSkip: user.questionSkip,
              progress: user.progress,
              findPlan,
            },
            req.__('All plan screen'),   // Please complete profile setup 1
          )
        }

        if (user.progress == 3) {
          let user_ = await user.save()
          const jwttoken = signToken(user_)

          const userJson = user_.toJSON()

            ;[
              'password',
              'authTokenIssuedAt',
              'otp',
              'emailToken',
              '__v',
            ].forEach((key) => delete userJson[key])
          userJson.jwt = jwttoken

          return res.success(
            {
              user: userJson,
              progress: user.progress,
              questionSkip: user.questionSkip,
              findPlan,
            },
            req.__('All plan screen'),   // Please complete profile setup 2
          )
        }

        if (user.progress == 4) {
          let user_ = await user.save()
          const jwttoken = signToken(user_)

          const userJson = user_.toJSON()

            ;[
              'password',
              'authTokenIssuedAt',
              'otp',
              'emailToken',
              '__v',
            ].forEach((key) => delete userJson[key])
          userJson.jwt = jwttoken

          return res.success(
            {
              user: userJson,
              questionSkip: user.questionSkip,
              progress: user.progress,
              findPlan,
            },
            req.__('Please complete profile setup 1'), // Please complete dating preferences
          )
        }

        if (user.progress == 5) {
          let user_ = await user.save()
          const jwttoken = signToken(user_)

          const userJson = user_.toJSON()

            ;[
              'password',
              'authTokenIssuedAt',
              'otp',
              'emailToken',
              '__v',
            ].forEach((key) => delete userJson[key])
          userJson.jwt = jwttoken

          return res.success(
            {
              user: userJson,
              questionSkip: user.questionSkip,
              progress: user.progress,
              findPlan,
            },
            req.__('Please complete profile setup 2'), // Please complete dating preferences
          )
        }

        if (user.progress == 6) {
          let user_ = await user.save()
          const jwttoken = signToken(user_)

          const userJson = user_.toJSON()

            ;[
              'password',
              'authTokenIssuedAt',
              'otp',
              'emailToken',
              '__v',
            ].forEach((key) => delete userJson[key])
          userJson.jwt = jwttoken

          return res.success(
            {
              user: userJson,
              questionSkip: user.questionSkip,
              progress: user.progress,
              findPlan,
            },
            req.__('Please complete dating preferences'), // Please complete dating preferences
          )
        }

        if (user.progress == 7) {
          if (user.questionSkip) {
            user.isLogin = true
            let user_ = await user.save()
            const jwttoken = signToken(user_)

            const userJson = user_.toJSON()

              ;[
                'password',
                'authTokenIssuedAt',
                'otp',
                'emailToken',
                '__v',
              ].forEach((key) => delete userJson[key])
            userJson.jwt = jwttoken

            return res.success(
              {
                user: userJson,
                questionSkip: user.questionSkip,
                progress: user.progress,
                findPlan,
              },
              req.__("You have free plan so you can't perform this action"), //LOGIN_SUCCESS
            )
          }
          user.isLogin = true
          let user_ = await user.save()
          const jwttoken = signToken(user_)

          const userJson = user_.toJSON()

            ;[
              'password',
              'authTokenIssuedAt',
              'otp',
              'emailToken',
              '__v',
            ].forEach((key) => delete userJson[key])
          userJson.jwt = jwttoken

          return res.success(
            {
              user: userJson,
              progress: user.progress,
              findPlan,
            },
            req.__('Please complete questionary profile setup '), //LOGIN_SUCCESS
          )
        }

        if (user.progress == 8) {
          user.isLogin = true
          let user_ = await user.save()
          const jwttoken = signToken(user_)

          const userJson = user_.toJSON()

            ;[
              'password',
              'authTokenIssuedAt',
              'otp',
              'emailToken',
              '__v',
            ].forEach((key) => delete userJson[key])
          userJson.jwt = jwttoken

          return res.success(
            {
              user: userJson,
              progress: user.progress,
              findPlan,
            },
            req.__('LOGIN_SUCCESS'), //LOGIN_SUCCESS
          )
        }
      }
    } catch (err) {
      return next(err)
    }
  }



  async generateToken(req, res) {
    let _id = req.params._id
    const user = await User.findOne({ _id })
    const platform = req.headers['x-hrms-platform']
    const token = signToken(user, platform)
    return res.success({
      token,
    })
  }

  async logOut(req, res) {
    const { user } = req
    user.authTokenIssuedAt = null
    user.deviceToken = null
    user.voip = null
    await user.save()
    return res.success({}, req.__('LOGOUT_SUCCESS'))
  }



  async resendOtp(req, res, next) {
    let { email, token } = req.body
    try {
      let user
      user = await User.findOne({
        email,
        isSuspended: false,
      })

      if (!user) {
        return res.unauthorized(null, req.__('UNAUTHORIZED'))
      }
      if (user) {
        if (user.resetToken === token) {
          let otp = generateOtp()
          if (STATUS === '0') {
            otp = 1234
          }
          user.otp = otp
          let newUser = await user.save()

          let emailToSend = newUser.email
          //Construct mail body here
          const msg = {
            to: emailToSend,
            from: FROM_MAIL, // Change to your verified sender
            subject: 'klust3r: Forgot Password OTP',
            text:
              'Please enter the following OTP to reset your password : ' +
              user.otp,
            html:
              '<strong>Please enter the following OTP to reset your password :' +
              user.otp +
              ' </strong>',
          }

          //Send Email Here
          if (STATUS === '1') {
            sgMail
              .send(msg)
              .then(() => {
                console.log('Email sent')

                return res.success(
                  {
                    token: token,
                  },
                  req.__('OTP_SEND_SUCCESS'),
                )
              })
              .catch((error) => {
                res.next(error)
              })
          } else {
            return res.success(
              {
                token: token,
              },
              req.__('OTP_SEND_SUCCESS'),
            )
          }
        } else if (user.emailToken === token) {
          let otp = generateCode()

          if (STATUS === '0') {
            otp = 1234
          }
          user.otp = otp
          let newUser = await user.save()

          let emailToSend = newUser.email
          //Construct mail body here
          const msg = {
            to: emailToSend,
            from: FROM_MAIL, // Change to your verified sender
            subject: 'klust3r: Verify  OTP to complete signup',
            text:
              'Please enter the following OTP to complete your registration : ' +
              user.otp,
            html:
              '<strong>Please enter the following OTP to complete your registration :' +
              user.otp +
              ' </strong>',
          }

          if (STATUS === '1') {
            sgMail
              .send(msg)
              .then(() => {
                console.log('Email sent')

                return res.success(
                  {
                    token: token,
                  },
                  req.__('OTP_SEND_SUCCESS'),
                )
              })
              .catch((error) => {
                console.error(error)
              })
          } else {
            return res.success(
              {
                token: token,
              },
              req.__('OTP_SEND_SUCCESS'),
            )
          }
          //Send Email Here
        } else {
          return res.warn('', req.__('Invalid reset tokens'))
        }
      }
    } catch (err) {
      return next(err)
    }
  }

  async forgotPassword(req, res, next) {
    let { email } = req.body
    try {
      let user

      user = await User.findOne({
        email,
        isSuspended: false,
      })

      if (!user) {
        return res.warn('', req.__('EMAIL_NOT_REGISTER'))
      }

      if (user) {
        //generated unique token and save in user table and send reset link
        let resetToken = randomString(10)
        // let resetToken = generateResetToken(12)
        let otp = generateOtp()
        if (STATUS === '0') {
          otp = 1234
        }
        user.resetToken = resetToken
        //user.emailVerify = false;
        // user.mobileVerify = false;
        user.otp = otp
        user.authTokenIssuedAt = utcDateTime().valueOf()
        await user.save()

        // console.log(user);

        let emailToSend = user.email

        //console.log('--------------test------------');
        //Construct mail body here
        const msg = {
          to: emailToSend,
          from: FROM_MAIL, // Change to your verified sender
          subject: 'klust3r: Forgot Password OTP',
          text:
            'Please enter the following OTP to reset your password : ' +
            user.otp,
          html:
            '<strong>Please enter the following OTP to reset your password :' +
            user.otp +
            ' </strong>',
        }

        //Send Email Here

        if (STATUS === '1') {
          sgMail
            .send(msg)
            .then(() => {
              console.log('Email sent')

              return res.success(
                {
                  token: resetToken,
                },
                req.__('OTP_SEND_SUCCESS'),
              )
            })
            .catch((error) => {
              console.error(error)
            })
        } else {
          return res.success(
            {
              token: resetToken,
            },
            req.__('OTP_SEND_SUCCESS'),
          )
        }
      }
    } catch (err) {
      return next(err)
    }
  }

  async resetPassword(req, res, next) {
    let { password, cnfpassword, token, email } = req.body
    try {
      const user = await User.findOne({
        email,
        isSuspended: false,
      })

      if (!user) {
        return res.unauthorized(
          {},
          req.__('This account is deactivated, please contact admin'),
        )
      }
      if (user) {
        if (user.resetToken === token) {
          if (password === cnfpassword) {
            user.password = password
            let email = user.email
            let newUser = await user.save()

            const userJson = newUser.toJSON()
              ;[
                'password',
                'authTokenIssuedAt',
                'otp',
                'emailToken',
                '__v',
              ].forEach((key) => delete userJson[key])
            return res.success({}, req.__('Password reset successfully'))
          } else {
            return res.warn(
              {},
              req.__('Password and confirm password must be same !'),
            )
          }
        } else {
          return res.warn({}, req.__('Invalid reset token'))
        }
      }
    } catch (err) {
      return next(err)
    }
  }



  async testA(req, res, next) {
    sms
      .sendSms('tter', 'sdfdfd', 'otp')
      .then((data) => {
        console.log('data', data)
      })
      .catch((error) => {
        return res.warn(' ', req.__('SMS_NOT_SENT'))
      })
  }



  async education(req, res, next) {
    try {
      let education = await Education.find({
        isSuspended: false,
        isDeleted: false,
      }).sort({
        created: 1,
      })
      if (education) {
        return res.success(
          { education: education },
          'Education list get sucessfully',
        )
      }

      return res.warn('', req.__('EDUCATION_ERROR'))
    } catch (err) {
      console.log(err)
      return res.next(err)
    }
  }

  async characteristics(req, res, next) {
    try {
      let allCharacteristics = await Characteristics.find({
        isSuspended: false,
        isDeleted: false,
      })
      let characteristics = []
      if (allCharacteristics.length > 0) {
        async.mapSeries(allCharacteristics, async function (characteristic) {
          let obj = {}
          let selectedChar = await UserCharacteristics.findOne({ userId: req._id, characteristicsId: characteristic._id })
          obj._id = characteristic._id;
          obj.name = characteristic.name;
          obj.selected = selectedChar ? true : false;
          characteristics.push(obj);
        }, async function () {
          return res.success({ characteristics }, 'Characteristics list get sucessfully');
        })

      } else {
        return res.warn('', req.__('Characteristics_Error'))
      }

    } catch (err) {
      console.log(err)
      return res.next(err)
    }
  }

  async questions(req, res, next) {
    try {
      let findPlan = await UserPlan.findOne({
        userId: req._id,
        isActive: true,
      }).populate({ path: 'plansId', model: Plans })

      if (findPlan.plansId.questions == '0') {
        let questions = await Question.find({
          isSuspended: false,
          isDeleted: false,
        }).limit(1)
        return res.warn(
          { questions },
          'You have free plan so question not allow',
        )
      }

      if (findPlan.plansId.questions == '3') {
        let questions = await Question.find({
          isSuspended: false,
          isDeleted: false,
        }).limit(3)
        if (questions.length > 0) {
          return res.success({ questions }, 'Questions list get sucessfully')
        }
      }

      if (findPlan.plansId.questions == '6') {

        let questions = await Question.find({
          isSuspended: false,
          isDeleted: false,
        }).limit(6)
        if (questions.length > 0) {
          return res.success({ questions }, 'Questions list get sucessfully')
        }
      }

      if (findPlan.plansId.questions == '9') {
        let questions = await Question.find({
          isSuspended: false,
          isDeleted: false,
        }).limit(9)
        if (questions.length > 0) {
          return res.success({ questions }, 'Questions list get sucessfully')
        }
      }

      return res.warn('', req.__('QUESTIONS_ERROR'))
    } catch (err) {
      console.log(err)
      return res.next(err)
    }
  }

  async tutorials(req, res, next) {
    try {

      let tutorials = await Tutorial.find({
        isSuspended: false,
        isDeleted: false,
      })
      if (tutorials) {
        let user = await User.findOne({ _id: req.user._id, isSuspended: false, isDeleted: false });
        if (user) {
          user.progress = 2;
          await user.save();

        }
        return res.success(
          { tutorials: tutorials, progress: user.progress },
          'Tutorials list get sucessfully',
        )
      }

      return res.warn('', req.__('TUTORIALS_ERROR'))
    } catch (err) {
      console.log(err)
      return res.next(err)
    }
  }

  async country(req, res, next) {
    try {
      let country = await Country.find({
        is_active: true,
      })
      if (country) {
        return res.success({ country: country }, 'Country list get sucessfully')
      }

      return res.warn('', req.__('COUNTRY_ERROR'))
    } catch (err) {
      console.log(err)
      return res.next(err)
    }
  }


}

module.exports = new AuthController()
