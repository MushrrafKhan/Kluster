const {
  models: {
    User,
    Education,
    Characteristics,
    UserCharacteristics,
    UserDatingPreferences,
    Question,
    UserQusetionaryReport,
    Post,
    Page,
    LikeProfile,
    LockProfile,
    HoldProfile,
    LoveProfile,
    Notification,
    Plans,
    UserPlan,
    Reward,
    UserActivity,
    UserWallet,
    UserEarning,
    SuperLikeProfile,
    Chat,
    ChatColor,
    UserChatColor,
    UserReward,
    UserRecord,
    UserRewardActivity,
    CurrencyActionsReplenish,
    Romantiks,
    ZodiacImage,
    Game,
    GameHint,
    GameHintVideo,
    Stage,
    CurrentGame,
    CurrentStage,
    Pattern,
    Level,
    UserGame,
    Sound,
    UserZodiacRecord,
    UserZodiacSign,
    UserPaymentDetail
  },
} = require("../../../../app/models");
const {
  utcDateTime,
  generateOtp,
  logError,
  randomString,
  uploadS3,
  getS3SingnedUrl,
  uploadImage,
  createS3SingnedUrl,
  generateResetToken,
  sendSms,
  utcDate,
  uploadImageBase64,
  uploadImageAPI,
} = require("../../../../lib/util");
// -------------------------------------------------ONE LINE MODULES---------------------------------------------------
const multiparty = require("multiparty");
const uuid = require("uuid");
const mongoose = require("mongoose");
const moment = require("moment");
const async = require("async");
const request = require("request");
const btoa = require('btoa');
const cron = require("node-cron");
const FCM = require('fcm-node');
const _ = require("lodash");
const serverKey = process.env.SERVER_KEY
const API_URL = process.env.API_URL;
const fcm = new FCM(serverKey);
// -------------------------------------------------ASROLOGY ENV DETAIL-----------------------------------------------
const astrUserId = process.env.ASTROLOGY_USER_ID
const astrApiKey = process.env.ASTROLOGY_API_KEY
// -------------------------------------------------AGORA ENV DETAIL---------------------------------------------------
const { AccessToken2, ServiceRtc } = require('../../../../lib/util/AccessToken2')
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
const APP_ID = process.env.APP_ID;
const APP_CERTIFICATE = process.env.APP_CERTIFICATE;
const CHANNEL_NAME = process.env.CHANNEL_NAME;
const UID = process.env.UID;
const ACCOUNT = process.env.ACCOUNT;
// ------------------------------------------------TWILIO ENV DETAIL---------------------------------------------------
const AccessToken = require('twilio').jwt.AccessToken;
const VoiceGrant = AccessToken.VoiceGrant;
const VideoGrant = AccessToken.VideoGrant;
const VoiceResponse = require('twilio').twiml.VoiceResponse;
// ------------------------------------------------STRIP FOR PURCHASE PLAN---------------------------------------------
var Secret_Key = process.env.STRIPE_API_KEY;
const stripe = require('stripe')(Secret_Key)
class UserController {

  async profileSetup1(req, res, next) {
    try {
      // conosle.log('-------------------------profileSetup1---------------------------')
      let user = await User.findOne({ _id: req.user._id });
      if (user) {
        let postsFind = await Post.findOne({ userId: user._id });
        let form = new multiparty.Form();
        form.parse(req, async function (err, fields, files) {
          _.forOwn(fields, (field, key) => {
            if (key === 'dob') user[key] = field[0];
            user[key] = field[0];
          });

          if (files.image && files.image[0]?.originalFilename) {
            let fileupload = files.image[0];
            let image = await uploadImage(fileupload, "user");
            user["image"] = image.key;
            // user['progress'] = 3
            // user['updateProfileTime'] = moment().format()
            // var user_ = await user.save()
          }
          user["progress"] = 5;
          var user_ = await user.save();
          const userJson = user_.toJSON();
          // -------- Posts & Media edited by current user --- +++++++ ---
          if (postsFind) {
            if (files.image2 && files.image2[0]?.originalFilename) {
              let fileupload2 = files.image2[0];
              let image2 = await uploadImage(fileupload2, "userPost");
              postsFind["image2"] = image2.key;
            }
            if (files.image3 && files.image3[0]?.originalFilename) {
              let fileupload3 = files.image3[0];
              let image3 = await uploadImage(fileupload3, "userPost");
              postsFind["image3"] = image3.key;
            }

            // post.userId = req._id
            var _post = await postsFind.save();
          } else {
            let post = new Post();
            if (files.image2 && files.image2[0]?.originalFilename) {
              let fileupload2 = files.image2[0];
              let image2 = await uploadImage(fileupload2, "userPost");
              post["image2"] = image2.key;
            }
            if (files.image3 && files.image3[0]?.originalFilename) {
              let fileupload3 = files.image3[0];
              let image3 = await uploadImage(fileupload3, "userPost");
              post["image3"] = image3.key;
            }
            post.userId = req._id;
            var _post = await post.save();
          }

          let zodiacName = getzodiacsign(userJson.dob)
          console.log("-----------zodiacName--------", zodiacName)

          let zodiac = await ZodiacImage.findOne({ name: zodiacName })
          console.log("-----------zodiac--------", zodiac)

          let zodiacSign = new UserZodiacSign({
            zodiacId: zodiac._id,
            userId: req.user._id
          })
          await zodiacSign.save()
          console.log("-----------zodiacSign--------", zodiacSign)

          return res.success(
            {
              user: userJson,
              progress: userJson.progress,
              _post,
            },
            "User Profile setup 1 completed"
          );
        });
      } else {
        return res.warn("", req.__("USER_NOT_FOUND"));
      }
    } catch (err) {
      console.log(err);
      return next(err);
    }
  }

  async profileSetup2(req, res, next) {
    try {
      // conosle.log('-------------------------profileSetup2---------------------------')
      let { characteristics, interests, bio } = req.body;
      let user = await User.findOne({ _id: req.user._id });
      if (user) {
        user.bio = bio;
        user.interests = interests;
        user.progress = 6;

        let user_ = await user.save();

        characteristics.map(async (data) => {
          let entry = await UserCharacteristics.findOne({
            userId: req.user._id,
            characteristicsId: data,
          });
          if (entry) {
            entry.userId = req.user._id;
            entry.characteristicsId = data;
            await entry.save();
          } else {
            let userCharacteristics = new UserCharacteristics();
            userCharacteristics.userId = req.user._id;
            userCharacteristics.characteristicsId = data;
            await userCharacteristics.save();
          }
        });

        const userJson = user_.toJSON();

        // ['password', 'authTokenIssuedAt', 'otp', 'emailToken', '__v'].forEach(key => delete userJson[key]);

        return res.success(
          { user: userJson, progress: userJson.progress },
          "User Profile setup 2 completed"
        );
      } else {
        return res.warn("", req.__("USER_NOT_FOUND"));
      }
    } catch (err) {
      console.log(err);
      return next(err);
    }
  }

  async datingPreferences(req, res, next) {
    try {
      // conosle.log('-------------------------datingPreferences---------------------------')
      let { interestedIn, minAge, maxAge, distance, scrollingCaps } = req.body;
      let user = await User.findOne({ _id: req.user._id });
      let findWallet = await UserWallet.findOne({ userId: req._id });
      if (user) {
        let findReward = await Reward.findOne({
          slug: "COMPLETE_PROFILE_SETUP",
          isSuspended: false,
        });
        let userDatingPreferences = new UserDatingPreferences();

        userDatingPreferences.userId = req.user._id;
        userDatingPreferences.interestedIn = interestedIn;
        userDatingPreferences.scrollingCaps = scrollingCaps;
        userDatingPreferences.minAge = minAge;
        userDatingPreferences.maxAge = maxAge;
        userDatingPreferences.distance = distance;
        // userDatingPreferences.maxDistance = maxDistance

        let userDatingPreferences1 = await userDatingPreferences.save();

        if (userDatingPreferences1) {
          user.progress = 7;

          let user_ = await user.save();
          const userJson = user_.toJSON();
          if (userJson.questionSkip) {
            // assign reward for complete profile setup (when question skip true) and send notification frm popup
            if (findReward) {
              let userEarn = new UserEarning();
              userEarn.userId = req._id;
              userEarn.greeting = `Congratulations!! You have received $${findReward.reward} for completing profile setup`;
              userEarn.amount = `+$${findReward.reward}`;
              userEarn.type = findReward._id;
              await userEarn.save();

              // add amount after assign reward
              if (findWallet) {
                findWallet.currentBalance += findReward.reward;
                await findWallet.save();
              }
            } else {
              console.log("-------- Find reward suspended --------");
            }
          }
          return res.success(
            { user: userJson, progress: userJson.progress },
            "User Dating Preferences completed"
          );
        } else {
          return res.warn("", req.__("Dating Preferences Error"));
        }
      } else {
        return res.warn("", req.__("USER_NOT_FOUND"));
      }
    } catch (err) {
      console.log(err);
      return next(err);
    }
  }

  async questionary(req, res, next) {
    try {
      // conosle.log('-------------------------questionary---------------------------')
      let user = await User.findOne({ _id: req.user._id });
      let findWallet = await UserWallet.findOne({ userId: req._id });
      let findReward = await Reward.findOne({
        slug: "COMPLETE_PROFILE_SETUP",
        isSuspended: false,
      });

      if (user) {
        let questionary = req.body.questionary;
        let questionaryData = questionary.map((x) => {
          return { ...x, userId: req.user._id };
        });

        await UserQusetionaryReport.insertMany(questionaryData);

        user.progress = 8;
        user.isLogin = true;

        await user.save();
        if (findReward) {
          let alreadyAssignedReward = await UserEarning.findOne({
            userId: req._id,
            type: findReward._id,
          });
          if (alreadyAssignedReward) {
            console.log(
              " -------------- already earn reward for complete profile setup -----"
            );
          } else {
            let userEarn = new UserEarning();
            userEarn.userId = req._id;
            userEarn.greeting = `Congratulations!! You have received $${findReward.reward} for completing profile setup`;
            userEarn.amount = `+$${findReward.reward}`;
            userEarn.type = findReward._id;
            await userEarn.save();

            // add amount after assign reward
            if (findWallet) {
              findWallet.currentBalance += findReward.reward;
              await findWallet.save();
            }
          }
        }
        return res.success({ user: user, progress: user.progress }, "Question process completed");
      } else {
        return res.warn({}, "USER_NOT_FOUND");
      }
    } catch (err) {
      console.log(err);
      return res.next(err);
    }
  }

  async updatePassword(req, res) {
    // conosle.log('-------------------------updatePassword---------------------------')
    const { user } = req;
    const { oldPassword, newPassword, cnfNewPassword } = req.body;

    const matched = await user.comparePassword(oldPassword);
    if (!matched) {
      return res.warn({}, req.__("PASSWORD_MATCH_FAILURE"));
    }
    const matcheAddedPassword = await user.comparePassword(newPassword);
    if (matcheAddedPassword) {
      return res.warn({}, "Old password and new passowrd can not be same");
    }
    if (newPassword != cnfNewPassword) {
      return res.warn({}, " New passowrd and confirm password must be same");
    } else {
      user.password = newPassword;
      await user.save();
      return res.success({}, "Password updated successfully.");
    }
  }

  async editDatingPreferences(req, res, next) {
    try {
      // conosle.log('-------------------------editDatingPreferences---------------------------')
      let { interestedIn, minAge, maxAge, distance, scrollingCaps } = req.body;
      let user = await User.findOne({ _id: req.user._id });
      if (user) {
        let userDatingPreferences = await UserDatingPreferences.findOne({
          userId: user._id,
          isSuspended: false,
        });

        if (userDatingPreferences) {
          userDatingPreferences.interestedIn = interestedIn;
          userDatingPreferences.scrollingCaps = scrollingCaps;
          userDatingPreferences.minAge = minAge;
          userDatingPreferences.maxAge = maxAge;
          userDatingPreferences.distance = distance;
          // userDatingPreferences.maxDistance = maxDistance

          let save_ = await userDatingPreferences.save();

          const userJson = user.toJSON();

          return res.success({}, "User Dating Preferences edited successfully");
        } else {
          return res.warn("", req.__("USER_DATING_PREFERENCES_ERROR"));
        }
      } else {
        return res.warn("", req.__("USER_NOT_FOUND"));
      }
    } catch (err) {
      console.log(err);
      return next(err);
    }
  }

  async editProfile(req, res, next) {
    try {
      let user = await User.findOne({ _id: req.user._id });
      var user_ = user;
      if (user) {
        let postsFind = await Post.findOne({ userId: user._id });
        // let updateInMoment = moment(user.updateProfileTime)
        // let cDateTime = moment()
        // let diffInHours = cDateTime.diff(updateInMoment, 'hours')
        // let diffInMinutes = cDateTime.diff(updateInMoment, 'minutes')
        // let diffInSeeconds = cDateTime.diff(updateInMoment, 'seconds')

        // let profileTimerLength1 = user.profileTimerLength.split(' ')

        // if (
        //   profileTimerLength1[0] > diffInHours &&
        //   profileTimerLength1[1] == 'hours'
        // ) {
        //   return res.warn(
        //     '',
        //     req.__(
        //       `you can not update profile because ${profileTimerLength1[0]} ${profileTimerLength1[1]} not completed`,
        //     ),
        //   )
        // } else if (
        //   profileTimerLength1[0] > diffInMinutes &&
        //   profileTimerLength1[1] == 'minutes'
        // ) {
        //   return res.warn(
        //     '',
        //     req.__(
        //       `you can not update profile because ${profileTimerLength1[0]} ${profileTimerLength1[1]} not completed`,
        //     ),
        //   )
        // } else if (
        //   profileTimerLength1[0] > diffInSeeconds &&
        //   profileTimerLength1[1] == 'seconds'
        // ) {
        //   return res.warn(
        //     '',
        //     req.__(
        //       `you can not update profile because ${profileTimerLength1[0]} ${profileTimerLength1[1]} not completed`,
        //     ),
        //   )
        // }
        //  else {
        let form = new multiparty.Form();
        form.parse(req, async function (err, fields, files) {
          _.forOwn(fields, (field, key) => {
            user[key] = field[0];
          });

          // if (!(files.image && files.image[0]?.originalFilename)) {
          // user['updateProfileTime'] = moment().format()
          // let interests1 = fields.interests
          // let array = interests1[0].split(',')
          // user.interests = array
          // user_ = await user.save()
          // return res.warn('', req.__('Please select an image'))
          // } else {
          if (files.image && files.image[0]?.originalFilename) {
            let fileupload = files.image[0];
            let image = await uploadImage(fileupload, "user");
            user["image"] = image.key;
            // user['progress'] = 2
          }
          // user['updateProfileTime'] = moment().format()
          if (fields.interests) {
            let interests1 = fields.interests;
            let array = interests1[0].split(",");
            user.interests = array;
          }
          // let interests1 = fields.interests
          // let array = interests1[0].split(',')
          // user.interests = array
          // user_ = await user.save()
          // let fileupload = files.image[0]
          // let image = await uploadImage(fileupload, 'user')
          // user['image'] = image.key
          // user['updateProfileTime'] = moment().format()

          // let interests1 = fields.interests
          // // console.log(ids);
          // let array = interests1[0].split(',')
          // // console.log("arraty====", array);
          // user.interests = array

          user_ = await user.save();

          await UserCharacteristics.deleteMany({ userId: req.user._id });

          // console.log(">>>>>>>>>>>>>>>>+", fields.characteristics)

          let chart = fields.characteristics[0].split(",");
          console.log("=chart", chart);
          chart.map(async (data) => {
            // console.log("=========>>>>>>>>>>>>>+++++++++", data)
            let userCharacteristics = new UserCharacteristics();
            userCharacteristics.userId = req.user._id;
            userCharacteristics.characteristicsId = mongoose.Types.ObjectId(
              data
            );
            await userCharacteristics.save();
          });

          const userJson = user_.toJSON();
          let char = await UserCharacteristics.find({
            userId: req.user._id,
          });

          // -------- Posts & Media edited by current user ----------

          if (postsFind) {
            if (files.image2 && files.image2[0]?.originalFilename) {
              let fileupload2 = files.image2[0];
              let image2 = await uploadImage(fileupload2, "userPost");
              postsFind["image2"] = image2.key;
            }
            if (files.image3 && files.image3[0]?.originalFilename) {
              let fileupload3 = files.image3[0];
              let image3 = await uploadImage(fileupload3, "userPost");
              postsFind["image3"] = image3.key;
            }

            // if (files.image4 && files.image4[0]?.originalFilename) {
            //   let fileupload4 = files.image4[0]
            //   let image4 = await uploadImage(fileupload4, 'userPost')
            //   postsFind['image4'] = image4.key
            // }
            // if (files.image5 && files.image5[0]?.originalFilename) {
            //   let fileupload5 = files.image5[0]
            //   let image5 = await uploadImage(fileupload5, 'userPost')
            //   postsFind['image5'] = image5.key
            // }
            // post.userId = req._id
            var _post = await postsFind.save();
          } else {
            console.log("------ posts not found -------");
            let post = new Post();
            if (files.image2 && files.image2[0]?.originalFilename) {
              let fileupload2 = files.image2[0];
              let image2 = await uploadImage(fileupload2, "userPost");
              post["image2"] = image2.key;
            }
            if (files.image3 && files.image3[0]?.originalFilename) {
              let fileupload3 = files.image3[0];
              let image3 = await uploadImage(fileupload3, "userPost");
              post["image3"] = image3.key;
            }

            // if (files.image4 && files.image4[0]?.originalFilename) {
            //   let fileupload4 = files.image4[0]
            //   let image4 = await uploadImage(fileupload4, 'userPost')
            //   post['image4'] = image4.key
            // }
            // if (files.image5 && files.image5[0]?.originalFilename) {
            //   let fileupload5 = files.image5[0]
            //   let image5 = await uploadImage(fileupload5, 'userPost')
            //   post['image5'] = image5.key
            // }
            post.userId = req._id;
            var _post = await post.save();
          }

          let zodiacName = getzodiacsign(userJson.dob)
          // console.log("-----------zodiacName--------", zodiacName)

          let zodiac = await ZodiacImage.findOne({ name: zodiacName })
          // console.log("-----------zodiac--------", zodiac)

          let zodiacSign = await UserZodiacSign.findOne({ userId: req.user._id })
          zodiacSign.zodiacId = zodiac._id
          await zodiacSign.save()
          // console.log("-----------zodiacSign--------", zodiacSign)

          return res.success({}, "User Profile edited successfully");
          // }
        });
        // }
      } else {
        return res.warn("", req.__("USER_NOT_FOUND"));
      }
    } catch (err) {
      console.log(err);
      return next(err);
    }
  }

  async NotificationSetting(req, res, next) {
    try {
      let notification = req.body.notification;
      let user = await User.findOne({ _id: req.user._id });
      if (user) {
        if (notification == true) {
          user.notification = notification;
          let userData = await user.save();
          const userJson = userData.toJSON();
          return res.success(
            { notification: userJson.notification },
            "Notification on"
          );
        } else if (notification == false) {
          user.notification = notification;
          let userData = await user.save();
          const userJson = userData.toJSON();
          return res.success(
            { notification: userJson.notification },
            "Notification off"
          );
        } else {
          return res.warn({}, "Notification error");
        }
      }
    } catch (err) {
      console.log(err);
      return res.next(err);
    }
  }

  async SoundSetting(req, res, next) {
    try {
      let sound = req.body.sound;
      let user = await User.findOne({ _id: req.user._id });
      if (user) {
        if (sound == true) {
          user.sound = sound;
          let userData = await user.save();
          const userJson = userData.toJSON();
          return res.success({ sound: userJson.sound }, "Sound on");
        } else if (sound == false) {
          user.sound = sound;
          let userData = await user.save();
          const userJson = userData.toJSON();
          return res.success({ sound: userJson.sound }, "Sound off");
        } else {
          return res.warn({}, "Sound error");
        }
      }
    } catch (err) {
      console.log(err);
      return res.next(err);
    }
  }

  async BackgroundMusicSetting(req, res, next) {
    try {
      let backgroundMusic = req.body.backgroundMusic;
      let user = await User.findOne({ _id: req.user._id });
      if (user) {
        if (backgroundMusic == true) {
          user.backgroundMusic = backgroundMusic;
          let userData = await user.save();
          const userJson = userData.toJSON();
          return res.success(
            { backgroundMusic: userJson.backgroundMusic },
            "Background Music on"
          );
        } else if (backgroundMusic == false) {
          user.backgroundMusic = backgroundMusic;
          let userData = await user.save();
          const userJson = userData.toJSON();
          return res.success(
            { backgroundMusic: userJson.backgroundMusic },
            "Background Music off"
          );
        } else {
          return res.warn({}, "Background Music error");
        }
      }
    } catch (err) {
      console.log(err);
      return res.next(err);
    }
  }

  async profileInfo(req, res, next) {
    try {
      let user = await User.findOne({ _id: req.user._id }).populate({
        path: "levelOfEducationId",
        select: "name",
        model: Education,
      });
      let userWallet = await UserWallet.findOne({ userId: req._id });
      if (!user) {
        return res.notFound("", req.__("INVALID_REQUEST"));
      } else {
        let datingPreferences = await UserDatingPreferences.findOne({
          userId: req.user._id,
        });

        let profilesetup = {};

        profilesetup.image = user.image;
        profilesetup.name = user.name;
        profilesetup.dob = user.dob;
        profilesetup.gender = user.gender;
        profilesetup.levelOfEducationId = user.levelOfEducationId;

        let characteristics = await UserCharacteristics.find({
          userId: user._id,
        }).populate({
          path: "characteristicsId",
          select: "name",
          model: Characteristics,
        });
        let postFind = await Post.find({ userId: req.user._id });
        let arr = [];

        characteristics.map(async (val) => {
          arr.push(val.characteristicsId);
        });

        // profilesetup.profileTimerLength = user.profileTimerLength
        profilesetup.interests = user.interests;
        profilesetup.bio = user.bio;
        profilesetup.characteristics = arr;
        // profilesetup.post = postFind

        user = user.toJSON();

        let plan = await UserPlan.findOne({
          userId: req.user._id,
          isActive: true,
        }).populate({
          path: "plansId",

          model: Plans,
        });

        return res.success(
          {
            user: user,
            datingPreferences: datingPreferences,
            profilesetup: profilesetup,
            post: postFind ? postFind : [],
            plan: plan,
            currentBalance: userWallet ? userWallet.currentBalance : "0",
          },
          req.__("Profile_Information")
        );
        // }else{
        //     return res.success({user,posts:[]}, req.__('Profile_Information'));
        // }
      }
    } catch (err) {
      console.log(err);
      return next(err);
    }
  }

  async swipeMatch(req, res, next) {
    try {
      console.log('-------------------------swipeMatch---------------------------')
      let skip = req.query.skip;
      let pageSize = 2; // how many data show on page
      let notificationCount = await Notification.find({ receivedId: req.user._id, read: false, isDeleted: false }).countDocuments()
      console.log("---------------notificationCount----------", notificationCount)

      let record = await UserRecord.findOne({ userId: req._id });
      let dayLoginReward = await Reward.findOne({ slug: "DAILY_LOG_IN" });
      let updatedTime;
      let DAYS;
      if (!record) {
        let _record = new UserRecord({ userId: req._id });
        let __record = await _record.save();
        updatedTime = __record.updated;
        DAYS = __record.days;
      } else {
        updatedTime = record.updated;
        DAYS = record.days;
      }

      let dayDiff = new Date().getDate() - new Date(updatedTime).getDate();

      // console.log("----------",dayDiff,record,DAYS);
      if (dayDiff > 1 || !record) {
        let ___record = await UserRecord.findOne({ userId: req._id });
        ___record.days += 1;
        await ___record.save();

        let userReward5 = await UserReward.findOne({
          userId: req._id,
          slug: "5_DAY_LOG_IN",
        });
        let reward5 = await Reward.findOne({ slug: "5_DAY_LOG_IN" });
        if (userReward5?.progress + 20 <= 100) {
          userReward5.progress += 20;
        } else if (!userReward5) {
          userReward5 = new UserReward({
            userId: req._id,
            progress: 20,
            rewardId: reward5._id,
          });
        }
        await userReward5.save();

        let userReward14 = await UserReward.findOne({
          userId: req._id,
          slug: "14_DAY_LOG_IN",
        });
        let reward14 = await Reward.findOne({ slug: "14_DAY_LOG_IN" });
        if (userReward14?.progress + 7.15 < 100) {
          userReward14.progress += 7.15;
        } else if (!userReward14) {
          userReward14 = new UserReward({
            userId: req._id,
            progress: 7.15,
            rewardId: reward14._id,
          });
        }
        await userReward14.save();

        let userReward22 = await UserReward.findOne({
          userId: req._id,
          slug: "22_DAY_LOG_IN",
        });
        let reward22 = await Reward.findOne({ slug: "22_DAY_LOG_IN" });
        if (userReward22?.progress + 4.55 < 100) {
          userReward22.progress += 4.55;
        } else if (!userReward22) {
          userReward22 = new UserReward({
            userId: req._id,
            progress: 4.55,
            rewardId: reward22._id,
          });
        }
        await userReward22.save();

        let userReward30 = await UserReward.findOne({
          userId: req._id,
          slug: "30_DAY_LOG_IN",
        });
        let reward30 = await Reward.findOne({ slug: "30_DAY_LOG_IN" });
        if (userReward30?.progress + 3.34 < 100) {
          userReward30.progress += 3.34;
        } else if (!userReward30) {
          userReward30 = new UserReward({
            userId: req._id,
            progress: 3.34,
            rewardId: reward30._id,
          });
        }
        await userReward30.save();
      } else {
      }

      let userReward5Day = await UserRewardActivity.findOne({
        userId: req._id,
        slug: "5_DAY_LOG_IN",
      });
      if (DAYS === 5 && !userReward5Day.status) {
        userReward5Day.status = true;
        await userReward5Day.save();
        let _reward = await Reward.findOne({ slug: "5_DAY_LOG_IN" });
        let reward = _reward ? _reward.reward : 0;
        await UserWallet.findOneAndUpdate(
          { userId: req._id },
          { $inc: { currentBalance: reward } }
        );
        await UserReward.findOneAndDelete({
          userId: req._id,
          slug: "5_DAY_LOG_IN",
        });
        let earnings = new UserEarning({
          userId: req._id,
          greeting: `Congratulation!! You have recieved $${_reward.reward} for ${_reward.title}`,
          amount: `+$${_reward.reward}`,
          type: _reward._id,
          // imageType: true
        });
        await earnings.save();
      }

      let userReward14Day = await UserRewardActivity.findOne({
        userId: req._id,
        slug: "14_DAY_LOG_IN",
      });
      if (DAYS === 14 && !userReward14Day.status) {
        userReward14Day.status = true;
        await userReward14Day.save();
        let _reward = await Reward.findOne({ slug: "14_DAY_LOG_IN" });
        let reward = _reward ? _reward.reward : 0;
        await UserWallet.findOneAndUpdate(
          { userId: req._id },
          { $inc: { currentBalance: reward } }
        );
        await UserReward.findOneAndDelete({
          userId: req._id,
          slug: "14_DAY_LOG_IN",
        });
        let earnings = new UserEarning({
          userId: req._id,
          greeting: `Congratulation!! You have recieved $${_reward.reward} for ${_reward.title}`,
          amount: `+$${_reward.reward}`,
          type: _reward._id,
          // imageType: true
        });
        await earnings.save();
      }

      let userReward22Day = await UserRewardActivity.findOne({
        userId: req._id,
        slug: "22_DAY_LOG_IN",
      });
      if (DAYS === 22 && !userReward22Day.status) {
        userReward22Day.status = true;
        await userReward22Day.save();
        let _reward = await Reward.findOne({ slug: "22_DAY_LOG_IN" });
        let reward = _reward ? _reward.reward : 0;
        await UserWallet.findOneAndUpdate(
          { userId: req._id },
          { $inc: { currentBalance: reward } }
        );
        await UserReward.findOneAndDelete({
          userId: req._id,
          slug: "22_DAY_LOG_IN",
        });
        let earnings = new UserEarning({
          userId: req._id,
          greeting: `Congratulation!! You have recieved $${_reward.reward} for ${_reward.title}`,
          amount: `+$${_reward.reward}`,
          type: _reward._id,
          // imageType: true
        });
        await earnings.save();
      }

      let userReward30Day = await UserRewardActivity.findOne({
        userId: req._id,
        slug: "30_DAY_LOG_IN",
      });
      if (DAYS === 30 && !userReward30Day.status) {
        userReward30Day.status = true;
        await userReward30Day.save();
        let _reward = await Reward.findOne({ slug: "30_DAY_LOG_IN" });
        let reward = _reward ? _reward.reward : 0;
        await UserWallet.findOneAndUpdate(
          { userId: req._id },
          { $inc: { currentBalance: reward } }
        );
        await UserReward.findOneAndDelete({
          userId: req._id,
          slug: "30_DAY_LOG_IN",
        });
        let earnings = new UserEarning({
          userId: req._id,
          greeting: `Congratulation!! You have recieved $${_reward.reward} for ${_reward.title}`,
          amount: `+$${_reward.reward}`,
          type: _reward._id,
          // imageType: true
        });
        await earnings.save();
      }

      let user = await User.findOne({ _id: req.user._id });
      // const ANSWERS = await UserQusetionaryReport.find({ userId: req._id })

      let chat = await Chat.aggregate([
        {
          $match: {
            $or: [
              { senderId: ObjectId(req._id) },
              { receiverId: ObjectId(req._id) },
            ],
          },
        },
        {
          $project: {
            userId: {
              $cond: [
                { $eq: [req._id, "$senderId"] },
                "$receiverId",
                "$senderId",
              ],
            },
          },
        },
        {
          $group: {
            _id: "$userId",
          },
        },
      ]);

      chat = chat.length > 0 ? chat.map((x) => x._id) : [];

      if (user) {
        if (!user.dayLogin) {
          console.log(
            "---------------day login assigned --------------------------"
          );
          user.dayLogin = true;
          await user.save();
          await UserWallet.findOneAndUpdate(
            { userId: req._id },
            { $inc: { currentBalance: dayLoginReward.reward } }
          );
          await UserRewardActivity.findOneAndUpdate(
            { userId: req._id, rewardId: dayLoginReward._id },
            { status: true }
          );
          let earnings = new UserEarning({
            userId: req._id,
            greeting: `Congratulations!! You have received $${dayLoginReward.reward} for completing ${dayLoginReward.title}`,
            amount: `+$${dayLoginReward.reward}`,
            type: dayLoginReward._id,
          });
          await earnings.save();
        }
        let currentAmount = await UserWallet.findOne(
          { userId: req._id },
          { currentBalance: 1, _id: 0 }
        );
        let userCoordinates = req.user.loc.coordinates;
        let _datePref = await UserDatingPreferences.findOne({ userId: req._id });
        let distance__ = _datePref.distance.split(" ")
        // console.log("----------_datePref-----------", _datePref)
        var query = {};
        let _flag = false;
        if (_datePref?.distance != '') {
          _flag = true;
          var milesToRadian = function (miles) {
            var earthRadiusInMiles = 3959;
            console.log("---------radius", miles / earthRadiusInMiles)
            return miles / earthRadiusInMiles;
          };
          query = {
            "loc.coordinates": {
              $geoWithin: {
                $centerSphere: [userCoordinates, milesToRadian(Number(distance__[0]))],
              }
            }
          }

        }
        let __Q = query;
        query.$and = [];
        if (_datePref?.interestedIn != '') {
          _flag = true;
          if (_datePref?.interestedIn == 'Both') {
            query.$and.push({ $or: [{ gender: 'Men' }, { gender: 'Women' }] });

          } else {
            query.$and.push({ gender: _datePref?.interestedIn });
          }
        }
        if (query.$and.length === 0) query = __Q;
        let __users = await User.find(query).lean();

        // console.log("=========================================================", moment('10/09/2022').format('YYYY-MM-DD HH:mm:ss'))
        if (_datePref?.minAge != '') {
          let _users = [];
          _flag = true;
          let _date = new Date()
          // let date = new Date();
          let curTime = moment(
            _date,
            'YYYY-MM-DD HH:mm:ss'
          ).format();


          __users.map(x => {
            let date = new Date(x.dob)
            let startDate = moment(
              date,
              'YYYY-MM-DD HH:mm:ss'
            ).format();

            let diff = moment(startDate).diff(moment(curTime), 'years');
            if (diff < _date) _users.push(x);
          });
          __users = _users;
        }
        if (_datePref?.maxAge != '') {

          _flag = true;
          let _users = [];
          let _date = moment().add(-_datePref?.maxAge, 'years').format('YYYY-MM-DD HH:mm:ss');
          __users.map(x => {
            // console.log("---------------------999999999999999999999999")
            // console.log(moment(x.dob).format('YYYY-MM-DD HH:mm:ss'), _date, '++++++++++++++++++++++++++++++++++++++++++++++')
            if (moment(x.dob).format('YYYY-MM-DD HH:mm:ss') > _date) _users.push(x);
          });
          __users = _users;
        }





        var userIds = __users.length > 0 ? __users.map(x => x._id) : [];
        let _query = {};
        _query.$and = [
          { "$expr": { "$eq": ["$_id", '$$userId'] } },
        ]

        if (_flag) {
          _query.$and.push({ "$expr": { "$in": ["$_id", userIds] } })
        }

        let usersBasedCharacteristics = await UserCharacteristics.aggregate([
          {
            $match: { userId: user._id },
          },
          {
            $lookup: {
              from: "usercharacteristics",
              foreignField: "characteristicsId",
              localField: "characteristicsId",
              as: "Characters",
            },
          },
          {
            $unwind: "$Characters",
          },
          {
            $project: {
              userId: "$Characters.userId",
            },
          },
          {
            $group: {
              _id: "$userId",
            },
          },
          {
            $match: {
              $and: [
                { _id: { $not: { $in: chat } } },
                { _id: { $ne: req._id } },
              ],
            },
          },
          // {
          //   $lookup: {
          //     from: "users",
          //     localField: "_id",
          //     foreignField: "_id",
          //     as: "User",
          //   },
          // },
          {
            $lookup: {
              from: "users",
              "let": {
                "userId": "$_id"
              },
              "pipeline": [
                {
                  "$match": _query
                }
              ],
              as: "User",
            },
          },
          {
            $unwind: "$User",
          },
          {
            $lookup: {
              from: "loveprofiles",
              localField: "_id",
              foreignField: "receivedId",
              as: "loves",
            },
          },
          {
            $lookup: {
              from: "likeprofiles",
              localField: "_id",
              foreignField: "receivedId",
              as: "likes",
            },
          },
          {
            $lookup: {
              from: "holdprofiles",
              localField: "_id",
              foreignField: "receivedId",
              as: "holds",
            },
          },
          {
            $lookup: {
              from: "superlikeprofiles",
              localField: "_id",
              foreignField: "receivedId",
              as: "superlike",
            },
          },
          {
            $lookup: {
              from: "lockprofiles",
              localField: "_id",
              foreignField: "receivedId",
              as: "locks",
            },
          },
          {
            $lookup: {
              from: "userplans",
              let: { user_id: "$_id" },
              pipeline: [
                {
                  $match: {
                    $and: [
                      { $expr: { $eq: ["$userId", "$$user_id"] } },
                      { $expr: { $eq: ["$isActive", true] } },
                    ],
                  },
                },
              ],
              as: "userplans",
            },
          },
          {
            $lookup: {
              from: "plans",
              localField: "userplans.plansId",
              foreignField: "_id",
              as: "userplansdeatil",
            },
          },
          {
            $unwind: "$userplansdeatil",
          },
          {
            $lookup: {
              from: "userqusetionaryreports",
              foreignField: "userId",
              localField: "User._id",
              as: "Answers",
            },
          },
          {
            $match: { _id: { $ne: req._id } },
          },
          {
            $project: {
              "User._id": "$User._id",
              "User.name": "$User.name",
              "User.bio": "$User.bio",
              "User.dob": "$User.dob",
              "User.image": "$User.image",
              Created: "$User.created",
              "User.age": {
                $function: {
                  body: function (dob) {
                    // dob = dob
                    var userDob = new Date(dob);
                    // calculate month difference from current date in time
                    var month_diff = Date.now() - userDob.getTime();
                    // convert the calculated difference in date format
                    var age_dt = new Date(month_diff);
                    //extract year from date
                    var year = age_dt.getUTCFullYear();
                    // now calculate the age of the user
                    let age = Math.abs(year - 1970);
                    return age;
                  },
                  args: ["$User.dob"],
                  lang: "js",
                },
              },

              liked: {
                $cond: [
                  { $in: [req.user._id, "$likes.likedById"] },
                  true,
                  false,
                ],
              },
              loved: {
                $cond: [
                  { $in: [req.user._id, "$loves.lovedById"] },
                  true,
                  false,
                ],
              },
              hold: {
                $cond: [
                  { $in: [req.user._id, "$holds.holdById"] },
                  true,
                  false,
                ],
              },
              locked: {
                $cond: [
                  { $in: [req.user._id, "$locks.lockById"] },
                  true,
                  false,
                ],
              },
              superLike: {
                $cond: [
                  { $in: [req.user._id, "$superlike.likedById"] },
                  true,
                  false,
                ],
              },

              "User.planImage": "$userplansdeatil.image",
              "User.planId": "$userplansdeatil._id",
              "User.planName": "$userplansdeatil.name",
            },
          },
          {
            $sort: {
              Created: -1,
            },
          },
          {
            $skip: (skip - 1) * pageSize,
          },
          {
            $limit: pageSize,
          },
        ]);
        return res.success(
          {
            __users,
            userIds,
            usersBasedCharacteristics,
            currentBalance: currentAmount ? currentAmount.currentBalance : 0,
            notificationCount: notificationCount,
            scrollingCaps: _datePref.scrollingCaps,
          },
          req.__("Swipe & Match Information")
        );
      } else {
        return res.notFound("", req.__("INVALID_REQUEST"));
      }
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  async userDetailSwipeMatch(req, res, next) {
    let { userId } = req.body;
    try {
      // let userDetail = await User.findOne({ _id: userId })
      let userDetail = await User.aggregate([
        {
          $match: { _id: ObjectId(userId) },
        },
        {
          $lookup: {
            from: "usercharacteristics",
            foreignField: "userId",
            localField: "_id",
            as: "Characters",
          },
        },
        {
          $lookup: {
            from: "characteristics",
            foreignField: "_id",
            localField: "Characters.characteristicsId",
            as: "userCharacteriStics",
          },
        },
        {
          $lookup: {
            from: "posts",
            foreignField: "userId",
            localField: "_id",
            as: "post",
          },
        },
        // user plan start
        {
          $lookup: {
            from: "userplans",
            let: { user_id: "$_id" },
            pipeline: [
              {
                $match: {
                  $and: [
                    { $expr: { $eq: ["$userId", "$$user_id"] } },
                    { $expr: { $eq: ["$isActive", true] } },
                  ],
                },
              },
            ],
            as: "userplans",
          },
        },
        {
          $lookup: {
            from: "plans",
            localField: "userplans.plansId",
            foreignField: "_id",
            as: "userplansdeatil",
          },
        },
        {
          $unwind: "$userplansdeatil",
        },
        // user plan end
        {
          $project: {
            userId: "$_id",
            userName: "$name",
            userBio: "$bio",
            userDob: "$dob",
            userImage: "$image",
            userCharacteriStics: 1,
            post: 1,
            // dob: '$dob',
            age: {
              $function: {
                body: function (dob) {
                  // dob = dob
                  var userDob = new Date(dob);
                  var month_diff = Date.now() - userDob.getTime();
                  var age_dt = new Date(month_diff);
                  var year = age_dt.getUTCFullYear();
                  age = Math.abs(year - 1970);
                  return age;
                },
                args: ["$dob"],
                lang: "js",
              },
            },
            planImage: "$userplansdeatil.image",
            planId: "$userplansdeatil._id",
            planName: "$userplansdeatil.name",
          },
        },
      ]);
      return res.success({ userDetail }, "user detail fetch successfully");
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  async likeProfile(req, res, next) {
    let { receivedId } = req.body;
    try {
      let sender = await User.findOne({ _id: req.user._id }).lean();
      let received = await User.findOne({ _id: receivedId }).lean();
      let alreadyLocked = await LockProfile.findOne({
        lockById: req.user._id,
        lockStatus: true,
      });
      if (alreadyLocked)
        return res.warn({}, "You are already locked with someone else");

      let findChat = await Chat.findOne({ $or: [{ 'senderId': req._id, 'receiverId': receivedId }, { 'senderId': receivedId, 'receiverId': req._id }] }); // chat find with receiver

      let findPlan = await UserPlan.findOne({
        userId: req._id,
        isActive: true,
      }).populate({ path: "plansId", model: Plans });
      let time = findPlan.plansId.replenishTime;
      var minutes = time.split(" ");

      let likeProfile = await LikeProfile.findOne({
        likedById: req.user._id,
        receivedId: receivedId,
      });
      // check like by receiver
      let alreadyLikedByreceiver = await LikeProfile.findOne({
        likedById: receivedId,
        receivedId: req.user._id,
      });
      // check super like by receiver
      let alreadySuperLikedByReceiver = await SuperLikeProfile.findOne({
        likedById: receivedId,
        receivedId: req.user._id,
      });


      if (likeProfile) {
        await likeProfile.remove();
        await Notification.findOneAndRemove({ senderId: req.user._id, receivedId: receivedId, type: "like" })
        return res.success({}, "Profile disliked");
      } else {
        let currentLikeCount = await UserActivity.findOne({
          userId: req.user._id,
        });
        if (
          findPlan.plansId.like == "0" &&
          currentLikeCount.likeCount == "0" &&
          currentLikeCount.likeEndTime == "0"
        ) {
          return res.warn(
            { upgradePlan: false },
            "Please upgrade your plan....This feature is not available in this plan"
          );
        }

        if (currentLikeCount.likeCount == "UNLMTD") {
          let profileLike = new LikeProfile();
          profileLike.likedById = req.user._id;
          profileLike.receivedId = receivedId;
          profileLike.title = "KLUST3R";
          profileLike.myDescription = `I liked ${received.name}'s photo`;
          profileLike.receiveDescription = `${req.user.name} liked your photo`;
          let _profileLike = await profileLike.save();

          let notification = new Notification({
            senderId: req.user._id,
            receivedId: receivedId,
            title: "Klust3r",
            description: "Liked your profile photo",
            type: "like"
          })
          await notification.save();
          if (received.notification) {
            let notificationCount = await Notification.find({ receivedId: receivedId, read: false, isDeleted: false }).countDocuments()

            let token = received.deviceToken;
            console.log("---------received----token---------", token)
            let msg = {
              "to": token,

              "notification": {
                "sound": "default",
                "title": 'Klust3r',
                "type": "like",
                "notificationCount": `${notificationCount}`,
                "body": `${sender.name} liked your profile photo`

              }
            }
            console.log("---------received----msg---------", msg)

            fcm.send(msg, function (err, response) {
              if (err) {
                console.log('Something has gone wrong!' + err);
              } else {
                console.log('Successfully sent with response: ', response);
              }
            });

          }

          if (alreadyLikedByreceiver || alreadySuperLikedByReceiver) {
            if (!findChat) {
              let chat = new Chat({
                senderId: req._id,
                receiverId: receivedId,
                msg: "Welcome",
                ignore: true
              });
              await chat.save();
            }
            let notification = new Notification({
              senderId: req.user._id,
              receivedId: receivedId,
              title: "Klust3r",
              description: "Congratulations! You have a match with",
              type: "match"
            })
            await notification.save();
            if (received.notification) {
              let notificationCount = await Notification.find({ receivedId: receivedId, read: false, isDeleted: false }).countDocuments()

              let token = received.deviceToken;
              console.log("---------received----token---------", token)
              let msg = {
                "to": token,

                "notification": {
                  "sound": "default",
                  "title": 'Klust3r',
                  "type": "match",
                  "notificationCount": `${notificationCount}`,
                  "body": `Congratulations! You have a match with ${sender.name}`

                }
              }
              console.log("---------received----msg---------", msg)

              fcm.send(msg, function (err, response) {
                if (err) {
                  console.log('Something has gone wrong!' + err);
                } else {
                  console.log('Successfully sent with response: ', response);
                }
              });

            }
            return res.success(
              { matched: true, name: received.name },
              "You liked this profile"
            );
          }
          return res.success({ matched: false }, "Profile liked");
        } else if (currentLikeCount.likeCount > 0) {
          let profileLike = new LikeProfile();
          profileLike.likedById = req.user._id;
          profileLike.receivedId = receivedId;
          profileLike.title = "KLUST3R";
          profileLike.myDescription = `I liked ${received.name}'s photo`;
          profileLike.receiveDescription = `${req.user.name} liked your photo`;
          let _profileLike = await profileLike.save();

          currentLikeCount.likeCount = Number(currentLikeCount.likeCount) - 1;
          currentLikeCount.likeEndTime = moment().format();
          let savedCount = await currentLikeCount.save();

          let notification = new Notification({
            senderId: req.user._id,
            receivedId: receivedId,
            title: "Klust3r",
            description: "Liked your profile photo",
            type: "like"
          })
          await notification.save();
          if (received.notification) {
            let notificationCount = await Notification.find({ receivedId: receivedId, read: false, isDeleted: false }).countDocuments()

            let token = received.deviceToken;
            console.log("---------received----token---------", token)
            let msg = {
              "to": token,

              "notification": {
                "sound": "default",
                "title": 'Klust3r',
                "type": "like",
                "notificationCount": `${notificationCount}`,
                "body": `${sender.name} liked your profile photo`

              }
            }
            console.log("---------received----msg---------", msg)

            fcm.send(msg, function (err, response) {
              if (err) {
                console.log('Something has gone wrong!' + err);
              } else {
                console.log('Successfully sent with response: ', response);
              }
            });

          }

          console.log("-=-=-=-notification", notification)


          if (_profileLike && savedCount.likeCount == "0") {
            var travelTime = moment(savedCount.likeEndTime)
              .add(Number(minutes[0]), "minutes")
              .format();
            console.log(
              "----------minutes[0] when like count == 0 after liked ",
              minutes[0]
            );
            let date_ = new Date(travelTime);
            let months = date_.getMonth() + 1;
            let d = date_.getDate();
            let hours = date_.getHours();
            let mints = date_.getMinutes();
            let sec = date_.getSeconds();

            cron.schedule(
              `${sec} ${mints} ${hours} ${d} ${months} *`,
              async () => {
                let likesAfterSaved = await UserActivity.findOne({
                  _id: savedCount._id,
                });
                console.log("---------------- cron hit -----------------");
                if (likesAfterSaved.likeCount == "0") {
                  likesAfterSaved.likeCount = findPlan.plansId.like;
                  likesAfterSaved.likeEndTime = "0";
                  await likesAfterSaved.save();
                }
              }
            );
          }

          if (alreadyLikedByreceiver || alreadySuperLikedByReceiver) {
            if (!findChat) {
              let chat = new Chat({
                senderId: req._id,
                receiverId: receivedId,
                msg: "Welcome",
                ignore: true
              });
              await chat.save();
            }
            let notification = new Notification({
              senderId: req.user._id,
              receivedId: receivedId,
              title: "Klust3r",
              description: "Congratulations! You have a match with",
              type: "match"
            })
            await notification.save();
            if (received.notification) {
              let notificationCount = await Notification.find({ receivedId: receivedId, read: false, isDeleted: false }).countDocuments()

              let token = received.deviceToken;
              console.log("---------received----token---------", token)
              let msg = {
                "to": token,

                "notification": {
                  "sound": "default",
                  "title": 'Klust3r',
                  "notificationCount": `${notificationCount}`,
                  "type": "match",
                  "body": `Congratulations! You have a match with ${sender.name}`

                }
              }
              console.log("---------received----msg---------", msg)

              fcm.send(msg, function (err, response) {
                if (err) {
                  console.log('Something has gone wrong!' + err);
                } else {
                  console.log('Successfully sent with response: ', response);
                }
              });

            }
            return res.success(
              { matched: true, name: received.name },
              "You liked this profile"
            );
          }

          return res.success({ matched: false }, "Profile liked");
        } else {
          let like = await UserActivity.findOne({ userId: req._id });
          let endTime = like.likeEndTime;
          let now = moment();
          var travelTime = moment(endTime)
            .add(Number(minutes[0]), "minutes")
            .format();
          console.log(
            "----------minutes[0] when already like count == 0 end",
            minutes[0]
          );
          let end = moment(travelTime); // next date time when likeCount increase
          let duration = moment.duration(end.diff(now));

          //Get hours and subtract from duration
          var hours = duration.hours();
          duration.subtract(hours, "hours");

          //Get Minutes and subtract from duration
          var minutes = duration.minutes();
          duration.subtract(minutes, "minutes");

          //Get seconds
          var seconds = duration.seconds();
          return res.warn(
            { upgradePlan: true, hours, minutes, seconds },
            "You are run out of likes, the likes will be restored back to full after the replenishment time has passed Or you can purchase the items"
          );
        }
      }
    } catch (err) {
      console.log(err);
      return next(err);
    }
  }

  async likeProfile1(req, res, next) {
    let { receivedId } = req.body;
    try {
      let findPlan = await UserPlan.findOne({
        userId: req._id,
        isActive: true,
      }).populate({
        path: "plansId",
        model: Plans,
      });
      let time = findPlan.plansId.replenishTime;
      var minutes = time.split(" ");

      let currentLikeCount = await UserActivity.findOne({
        userId: req.user._id,
      });

      let alreadyLocked = await LockProfile.findOne({
        lockById: req.user._id,
        lockStatus: true,
      });

      let likeProfile = await LikeProfile.findOne({
        likedById: req.user._id,
        receivedId: receivedId,
      });
      let alreadyLikedByreceiver = await LikeProfile.findOne({
        likedById: receivedId,
        receivedId: req.user._id,
      });
      let received = await User.findOne({ _id: receivedId });
      if (alreadyLocked) {
        return res.warn({}, "You are already locked with someone else");
      }
      if (likeProfile) {
        await likeProfile.remove();
        return res.success({}, "Profile disliked");
      } else {
        if (findPlan.plansId.like == "0") {
          return res.warn({}, "Please upgrade plan");
        }

        if (currentLikeCount.likeCount != 0) {
          let profileLike = new LikeProfile();
          profileLike.likedById = req.user._id;
          profileLike.receivedId = receivedId;
          profileLike.title = "KLUST3R";
          profileLike.myDescription = `I liked ${received.name}'s photo`;
          profileLike.receiveDescription = `${req.user.name} liked your photo`;
          await profileLike.save();

          currentLikeCount.likeCount = Number(currentLikeCount.likeCount) - 1;
          let savedCount = await currentLikeCount.save();

          let likesAfterSaved = await UserActivity.findOne({
            _id: savedCount._id,
          });

          if (likesAfterSaved.likeCount == "0") {
            likesAfterSaved.likeEndTime = moment().format();
            var savedEndTime = await likesAfterSaved.save();

            // let time = findPlan.plansId.replenishTime
            // var minutes = time.split(' ')

            var travelTime = moment(savedEndTime.likeEndTime)
              .add(Number(minutes[0]), "minutes")
              .format();
            //console.log( '-----------------travelTime', travelTime)

            // let travelTime_ = moment(travelTime)
            let date_ = new Date(travelTime);
            let months = date_.getMonth() + 1;
            let d = date_.getDate();
            let hours = date_.getHours();
            let mints = date_.getMinutes();
            let sec = date_.getSeconds();

            cron.schedule(
              `${sec} ${mints} ${hours} ${d} ${months} *`,
              async () => {
                console.log("---------------- cron hit -----------------");
                if (likesAfterSaved.likeCount == "0") {
                  likesAfterSaved.likeCount = findPlan.plansId.like;
                  likesAfterSaved.likeEndTime = "0";
                  await likesAfterSaved.save();
                }
              }
            );
          }

          return res.success({}, "Profile liked");
        } else {
          let like = await UserActivity.findOne({ userId: req._id });
          let endTime = like.likeEndTime;
          let now = moment();
          var travelTime = moment(endTime)
            .add(Number(minutes[0]), "minutes")
            .format();
          let end = moment(travelTime); // next date time when likeCount increase
          let duration = moment.duration(end.diff(now));

          //Get hours and subtract from duration
          var hours = duration.hours();
          duration.subtract(hours, "hours");

          //Get Minutes and subtract from duration
          var minutes = duration.minutes();
          duration.subtract(minutes, "minutes");

          //Get seconds
          var seconds = duration.seconds();
          return res.warn(
            { hours, minutes, seconds },
            "You are run out of likes, the likes will be restored back to full after the replenishment time has passed Or you can purchase the items"
          );
        }
      }
    } catch (err) {
      console.log(err);
      return next(err);
    }
  }

  async superLikeProfile(req, res, next) {
    let { receivedId } = req.body;
    try {
      let sender = await User.findOne({ _id: req.user._id }).lean();
      let receiver = await User.findOne({ _id: receivedId }).lean();
      let alreadyLocked = await LockProfile.findOne({
        lockById: req.user._id,
        lockStatus: true,
      });
      if (alreadyLocked) {
        return res.warn({}, "You are already locked with someone else");
      }

      let findChat = await Chat.findOne({ $or: [{ 'senderId': req._id, 'receiverId': receivedId }, { 'senderId': receivedId, 'receiverId': req._id }] }); // chat find with receiver

      let findPlan = await UserPlan.findOne({
        userId: req._id,
        isActive: true,
      }).populate({
        path: "plansId",
        model: Plans,
      });
      // let time = findPlan.plansId.replenishTime
      // var minutes = time.split(' ')

      let superLikeProfile = await SuperLikeProfile.findOne({
        likedById: req.user._id,
        receivedId: receivedId,
      });

      // check like by receiver
      let alreadyLikedByreceiver = await LikeProfile.findOne({
        likedById: receivedId,
        receivedId: req.user._id,
      });

      // check super like by receiver
      let alreadySuperLikedByReceiver = await SuperLikeProfile.findOne({
        likedById: receivedId,
        receivedId: req.user._id,
      });


      if (superLikeProfile) {
        await superLikeProfile.remove();
        await Notification.findOneAndRemove({ senderId: req.user._id, receivedId: receivedId, type: "superlike" })
        return res.success(
          { receiverName: receiver.name },
          "Profile super like removed"
        );
      } else {
        let alreadyLikesCount = await UserActivity.findOne({
          userId: req.user._id,
        });
        // if (findPlan.plansId.superLike == '0' && alreadyLikesCount.superLikeCount == '0') {
        //   return res.warn({}, 'Please upgrade plan')
        // }

        if (alreadyLikesCount.superLikeCount > 0) {
          let profileLike = new SuperLikeProfile();
          profileLike.likedById = req.user._id;
          profileLike.receivedId = receivedId;
          profileLike.title = "KLUST3R";
          profileLike.myDescription = `I super liked ${receiver.name}'s photo`;
          profileLike.receiveDescription = `${req.user.name} super like`;
          await profileLike.save();

          let notification = new Notification({
            senderId: req.user._id,
            receivedId: receivedId,
            title: "Klust3r",
            description: "You have received a super like from",
            type: "superlike"
          })
          await notification.save();
          if (receiver.notification) {
            let notificationCount = await Notification.find({ receivedId: receivedId, read: false, isDeleted: false }).countDocuments()

            let token = receiver.deviceToken;
            console.log("---------receiver----token---------", token)
            let msg = {
              "to": token,

              "notification": {
                "sound": "default",
                "title": 'Klust3r',
                "notificationCount": `${notificationCount}`,
                "type": "superlike",
                "body": `${sender.name} super like your profile photo`

              }
            }
            console.log("---------received----msg---------", msg)

            fcm.send(msg, function (err, response) {
              if (err) {
                console.log('Something has gone wrong!' + err);
              } else {
                console.log('Successfully sent with response: ', response);
              }
            });

          }

          alreadyLikesCount.superLikeCount =
            Number(alreadyLikesCount.superLikeCount) - 1;
          await alreadyLikesCount.save();

          if (alreadySuperLikedByReceiver || alreadyLikedByreceiver) {
            if (!findChat) {
              let chat = new Chat({
                senderId: req._id,
                receiverId: receivedId,
                msg: "Welcome",
                ignore: true
              });
              await chat.save();
            }
            let notification = new Notification({
              senderId: req.user._id,
              receivedId: receivedId,
              title: "Klust3r",
              description: "Congratulations! You have a match with",
              type: "match"
            })
            await notification.save();
            if (receiver.notification) {
              let notificationCount = await Notification.find({ receivedId: receivedId, read: false, isDeleted: false }).countDocuments()

              let token = receiver.deviceToken;
              console.log("---------receiver----token---------", token)
              let msg = {
                "to": token,

                "notification": {
                  "sound": "default",
                  "title": 'Klust3r',
                  "notificationCount": `${notificationCount}`,
                  "type": "match",
                  "body": `Congratulations! You have a match with ${sender.name}`

                }
              }
              console.log("---------received----msg---------", msg)

              fcm.send(msg, function (err, response) {
                if (err) {
                  console.log('Something has gone wrong!' + err);
                } else {
                  console.log('Successfully sent with response: ', response);
                }
              });

            }

            return res.success(
              {
                receiverName: receiver.name,
                superLikes: true,
                matched: true,
                name: receiver.nmae,
              },
              "You super liked this profile"
            );
          }

          return res.success(
            { receiverName: receiver.name, superLikes: true, matched: false },
            "Profile super liked successfully"
          );
        } else {
          return res.warn(
            { superLikes: false },
            "You are run out of super likes, the super likes will be restored back to full after the replenishment time has passed Or you can purchase the items"
          );
        }
      }
    } catch (err) {
      console.log(err);
      return next(err);
    }
  }

  async loveProfile(req, res, next) {
    let { receivedId } = req.body;
    try {
      let sender = await User.findOne({ _id: req.user._id }).lean();
      let received = await User.findOne({ _id: receivedId }).lean();

      let alreadyLocked = await LockProfile.findOne({
        lockById: req.user._id,
        lockStatus: true,
      });
      if (alreadyLocked)
        return res.warn({}, "You are already locked with someone else");

      let findChat = await Chat.findOne({ $or: [{ 'senderId': req._id, 'receiverId': receivedId }, { 'senderId': receivedId, 'receiverId': req._id }] }); // chat find with receiver

      let findPlan = await UserPlan.findOne({
        userId: req._id,
        isActive: true,
      }).populate({
        path: "plansId",
        model: Plans,
      });
      let time = findPlan.plansId.replenishTime;
      var minutes = time.split(" ");

      let loveProfile = await LoveProfile.findOne({
        lovedById: req.user._id,
        receivedId: receivedId,
      });

      let alreadyLovedByReceiver = await LoveProfile.findOne({
        lovedById: receivedId,
        receivedId: req.user._id,
      });


      if (loveProfile) {
        await loveProfile.remove();
        await Notification.findOneAndRemove({ senderId: req.user._id, receivedId: receivedId, type: "love" })

        return res.success({}, "Profile dislove");
      } else {
        let alreadyLoveCount = await UserActivity.findOne({
          userId: req.user._id,
        });
        if (
          findPlan.plansId.love == "0" &&
          alreadyLoveCount.loveCount == "0" &&
          alreadyLoveCount.loveEndTime == "0"
        ) {
          return res.warn(
            { upgradePlan: false },
            "Please upgrade your plan....This feature is not available in this plan"
          );
        }

        if (alreadyLoveCount.loveCount == "UNLMTD") {
          let profileLove = new LoveProfile();
          profileLove.lovedById = req.user._id;
          profileLove.receivedId = receivedId;
          profileLove.title = "KLUST3R";
          profileLove.myDescription = `I loved ${received.name}'s photo`;
          profileLove.receiveDescription = `${req.user.name} loved your photo`;
          let _profileLove = await profileLove.save();

          let notification = new Notification({
            senderId: req.user._id,
            receivedId: receivedId,
            title: "Klust3r",
            description: "loved your photo",
            type: "love"
          })
          await notification.save();
          if (received.notification) {
            let notificationCount = await Notification.find({ receivedId: receivedId, read: false, isDeleted: false }).countDocuments()

            let token = received.deviceToken;
            console.log("---------received----token---------", token)
            let msg = {
              "to": token,

              "notification": {
                "sound": "default",
                "title": 'Klust3r',
                "type": "love",
                "notificationCount": `${notificationCount}`,
                "body": `${sender.name} loved your profile photo`

              }
            }
            console.log("---------received----msg---------", msg)

            fcm.send(msg, function (err, response) {
              if (err) {
                console.log('Something has gone wrong!' + err);
              } else {
                console.log('Successfully sent with response: ', response);
              }
            });

          }


          if (alreadyLovedByReceiver) {
            if (!findChat) {
              let chat = new Chat({
                senderId: req._id,
                receiverId: receivedId,
                msg: "Welcome",
                ignore: true
              });
              await chat.save();
            }
            let notification = new Notification({
              senderId: req.user._id,
              receivedId: receivedId,
              title: "Klust3r",
              description: "Congratulations! You have a match with",
              type: "match"
            })
            await notification.save();
            if (received.notification) {
              let notificationCount = await Notification.find({ receivedId: receivedId, read: false, isDeleted: false }).countDocuments()

              let token = received.deviceToken;
              console.log("---------received----token---------", token)
              let msg = {
                "to": token,

                "notification": {
                  "sound": "default",
                  "title": 'Klust3r',
                  "type": "match",
                  "notificationCount": `${notificationCount}`,
                  "body": `Congratulations! You have a match with ${sender.name}`

                }
              }
              console.log("---------received----msg---------", msg)

              fcm.send(msg, function (err, response) {
                if (err) {
                  console.log('Something has gone wrong!' + err);
                } else {
                  console.log('Successfully sent with response: ', response);
                }
              });

            }


            return res.success({ matched: true, name: received.name }, "You loved this profile");

          }
          return res.success({ matched: false }, "You loved this profile");
        } else if (alreadyLoveCount.loveCount > 0) {
          let profileLove = new LoveProfile();
          profileLove.lovedById = req.user._id;
          profileLove.receivedId = receivedId;
          profileLove.title = "KLUST3R";
          profileLove.myDescription = `I loved ${received.name}'s photo`;
          profileLove.receiveDescription = `${req.user.name} loved your photo`;
          let _profileLove = await profileLove.save();

          let notification = new Notification({
            senderId: req.user._id,
            receivedId: receivedId,
            title: "Klust3r",
            description: "loved your photo",
            type: "love"
          })
          await notification.save();
          if (received.notification) {
            let notificationCount = await Notification.find({ receivedId: receivedId, read: false, isDeleted: false }).countDocuments()

            let token = received.deviceToken;
            console.log("---------received----token---------", token)
            let msg = {
              "to": token,

              "notification": {
                "sound": "default",
                "title": 'Klust3r',
                "type": "love",
                "notificationCount": `${notificationCount}`,
                "body": `${sender.name} loved your profile photo`

              }
            }
            console.log("---------received----msg---------", msg)

            fcm.send(msg, function (err, response) {
              if (err) {
                console.log('Something has gone wrong!' + err);
              } else {
                console.log('Successfully sent with response: ', response);
              }
            });

          }

          alreadyLoveCount.loveCount = Number(alreadyLoveCount.loveCount) - 1;
          alreadyLoveCount.loveEndTime = moment().format();
          let savedCount = await alreadyLoveCount.save();

          if (_profileLove && savedCount.loveCount == "0") {
            var travelTime = moment(savedCount.loveEndTime)
              .add(Number(minutes[0]), "minutes")
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
                let lovesAfterSaved = await UserActivity.findOne({
                  _id: savedCount._id,
                });
                console.log("---------------- cron hit -----------------");
                if (lovesAfterSaved.loveCount == "0") {
                  lovesAfterSaved.loveCount = findPlan.plansId.love;
                  lovesAfterSaved.loveEndTime = "0";
                  await lovesAfterSaved.save();
                }
              }
            );
          }

          if (alreadyLovedByReceiver) {
            if (!findChat) {
              let chat = new Chat({
                senderId: req._id,
                receiverId: receivedId,
                msg: "Welcome",
                ignore: true
              });
              await chat.save();
            }
            let notification = new Notification({
              senderId: req.user._id,
              receivedId: receivedId,
              title: "Klust3r",
              description: "Congratulations! You have a match with",
              type: "match"
            })
            await notification.save();
            if (received.notification) {
              let notificationCount = await Notification.find({ receivedId: receivedId, read: false, isDeleted: false }).countDocuments()

              let token = received.deviceToken;
              console.log("---------received----token---------", token)
              let msg = {
                "to": token,

                "notification": {
                  "sound": "default",
                  "title": 'Klust3r',
                  "type": "match",
                  "notificationCount": `${notificationCount}`,
                  "body": `Congratulations! You have a match with ${sender.name}`

                }
              }
              console.log("---------received----msg---------", msg)

              fcm.send(msg, function (err, response) {
                if (err) {
                  console.log('Something has gone wrong!' + err);
                } else {
                  console.log('Successfully sent with response: ', response);
                }
              });

            }
            return res.success(
              { matched: true, name: received.name },
              "You loved this profile"
            );
          }

          return res.success({ matched: false }, "Profile loved");
        } else {
          let love = await UserActivity.findOne({ userId: req._id });
          let endTime = love.loveEndTime;
          let now = moment();
          var travelTime = moment(endTime)
            .add(Number(minutes[0]), "minutes")
            .format();
          let end = moment(travelTime); // next date time when likeCount increase
          let duration = moment.duration(end.diff(now));

          //Get hours and subtract from duration
          var hours = duration.hours();
          duration.subtract(hours, "hours");

          //Get Minutes and subtract from duration
          var minutes = duration.minutes();
          duration.subtract(minutes, "minutes");

          //Get seconds
          var seconds = duration.seconds();

          return res.warn(
            { upgradePlan: true, hours, minutes, seconds },
            "You are run out of loves, the loves will be restored back to full after the replenishment time has passed Or you can purchase the items"
          );
        }
      }
    } catch (err) {
      console.log(err);
      return next(err);
    }
  }

  async profileHold(req, res, next) {
    let { receivedId } = req.body;
    try {
      let alreadyLocked = await LockProfile.findOne({
        lockById: req.user._id,
        lockStatus: true,
      });
      if (alreadyLocked) {
        return res.warn({}, "You are already locked with someone else");
      }

      let findChat = await Chat.findOne({ $or: [{ 'senderId': req._id, 'receiverId': receivedId }, { 'senderId': receivedId, 'receiverId': req._id }] }); // chat find with receiver

      let findPlan = await UserPlan.findOne({
        userId: req._id,
        isActive: true,
      }).populate({
        path: "plansId",
        model: Plans,
      });
      let time = findPlan.plansId.replenishTime;
      var minutes = time.split(" ");

      let holdProfile = await HoldProfile.findOne({
        holdById: req.user._id,
        receivedId: receivedId,
      });

      let alreadyHoldByReceiver = await HoldProfile.findOne({
        holdById: receivedId,
        receivedId: req.user._id,
      });
      let sender = await User.findOne({ _id: req.user._id });
      let received = await User.findOne({ _id: receivedId });

      let percentage = 0;

      let dob = new Date(received.dob);
      //calculate month difference from current date in time
      let month_diff = Date.now() - dob.getTime();

      //convert the calculated difference in date format
      let age_dt = new Date(month_diff);

      //extract year from date
      let year = age_dt.getUTCFullYear();

      //now calculate the age of the user
      let age = Math.abs(year - 1970);

      if (holdProfile) {
        await holdProfile.remove();
        return res.success(
          { percentage: "" }, // percentage for front end
          "You removed this profile from hold"
        );
      } else {
        let alreadyHoldCount = await UserActivity.findOne({
          userId: req.user._id,
        });
        if (
          findPlan.plansId.hold == "0" &&
          alreadyHoldCount.holdCount == "0" &&
          alreadyHoldCount.holdEndTime == "0"
        ) {
          return res.warn(
            { upgradePlan: false },
            "Please upgrade your plan....This feature is not available in this plan"
          );
        }

        if (alreadyHoldCount.holdCount > 0) {
          let profileHold = new HoldProfile();
          profileHold.holdById = req.user._id;
          profileHold.receivedId = receivedId;
          profileHold.title = "KLUST3R";
          profileHold.myDescription = `${received.name}`;
          profileHold.receiveDescription = `${req.user.name}`;

          let _profileHold = await profileHold.save();

          let cUserQuestions = await UserQusetionaryReport.find({
            userId: req.user._id,
          }).lean();

          let receiverUserQuestions = await UserQusetionaryReport.find({
            userId: receivedId,
          }).lean();

          let userPlan = await UserPlan.findOne(
            {
              userId: receivedId,
              isActive: true,
            },
            { _id: 1 }
          ).populate({ path: "plansId", select: "image", model: Plans });
          // console.log(' ----------userPlan ----------', userPlan)
          cUserQuestions.map(async (x) => {
            receiverUserQuestions.map(async (r) => {
              if (
                x.questionId.equals(r.questionId) &&
                ((r.yes && x.yes && r.yes === x.yes) ||
                  (r.no && x.no && r.no === x.no) ||
                  (r.default && x.default && r.default === x.default))
              ) {
                percentage += 100;
              }
            });
          });
          percentage = Math.floor(percentage / 9);
          alreadyHoldCount.holdCount = Number(alreadyHoldCount.holdCount) - 1;
          alreadyHoldCount.holdEndTime = moment().format();
          let savedCount = await alreadyHoldCount.save();

          // let holdAfterSaved = await UserActivity.findOne({
          //   _id: savedCount._id,
          // })

          if (_profileHold && savedCount.holdCount == "0") {
            // holdAfterSaved.holdEndTime = moment().format()
            // var savedEndTime = await holdAfterSaved.save()
            var travelTime = moment(savedCount.holdEndTime)
              .add(Number(minutes[0]), "minutes")
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
                console.log("---------------- cron hit -----------------");
                let holdAfterSaved = await UserActivity.findOne({
                  _id: savedCount._id,
                });
                if (holdAfterSaved.holdCount == "0") {
                  holdAfterSaved.holdCount = findPlan.plansId.hold;
                  holdAfterSaved.holdEndTime = "0";
                  await holdAfterSaved.save();
                }
              }
            );
          }

          if (alreadyHoldByReceiver) {
            if (!findChat) {
              let chat = new Chat({
                senderId: req._id,
                receiverId: receivedId,
                msg: "Welcome",
                ignore: true
              });
              await chat.save();
            }
            let notification = new Notification({
              senderId: req.user._id,
              receivedId: receivedId,
              title: "Klust3r",
              description: "Congratulations! You have a match with",
              type: "match"
            })
            await notification.save();
            if (received.notification) {
              let notificationCount = await Notification.find({ receivedId: receivedId, read: false, isDeleted: false }).countDocuments()

              let token = received.deviceToken;
              console.log("---------received----token---------", token)
              let msg = {
                "to": token,

                "notification": {
                  "sound": "default",
                  "title": 'Klust3r',
                  "type": "match",
                  "notificationCount": `${notificationCount}`,
                  "body": `Congratulations! You have a match with ${sender.name}`

                }
              }
              console.log("---------received----msg---------", msg)

              fcm.send(msg, function (err, response) {
                if (err) {
                  console.log('Something has gone wrong!' + err);
                } else {
                  console.log('Successfully sent with response: ', response);
                }
              });

            }

            return res.success(
              {
                matched: true,
                percentage,
                userImage: received.image,
                userName: received.name,
                userAge: age,
                userBio: received.bio,
                userPlan,
              },
              "Profile hold success"
            );
          }

          return res.success(
            {
              matched: false,
              percentage,
              userImage: received.image,
              userName: received.name,
              userAge: age,
              userBio: received.bio,
              userPlan,
            },
            "Profile hold success"
          );
        } else {
          let hold = await UserActivity.findOne({ userId: req._id });
          let endTime = hold.holdEndTime;
          let now = moment();
          var travelTime = moment(endTime)
            .add(Number(minutes[0]), "minutes")
            .format();
          console.log("-------------travelTime -------------", travelTime);
          let end = moment(travelTime); // next date time when likeCount increase
          let duration = moment.duration(end.diff(now));

          //Get hours and subtract from duration
          var hours = duration.hours();
          duration.subtract(hours, "hours");

          //Get Minutes and subtract from duration
          var minutes = duration.minutes();
          duration.subtract(minutes, "minutes");

          //Get seconds
          var seconds = duration.seconds();

          return res.warn(
            { upgradePlan: true, hours, minutes, seconds },
            "You are run out of holds, the holds will be restored back to full after the replenishment time has passed Or you can purchase the items"
          );
        }
      }
    } catch (err) {
      console.log(err);
      return next(err);
    }
  }

  async userDetailInList(req, res, next) {
    let { receivedId } = req.body;
    try {
      let percentage = 0;
      let findUser = await User.findOne({ _id: receivedId });
      let cUserQuestions = await UserQusetionaryReport.find({
        userId: req.user._id,
      }).lean();

      if (findUser) {
        let userPlan = await UserPlan.findOne(
          {
            userId: receivedId,
            isActive: true,
          },
          { _id: 1 }
        ).populate({ path: "plansId", select: "image name", model: Plans });
        let receiverUserQuestions = await UserQusetionaryReport.find({
          userId: receivedId,
        }).lean();

        cUserQuestions.map(async (x) => {
          receiverUserQuestions.map(async (r) => {
            if (
              x.questionId.equals(r.questionId) &&
              ((r.yes && x.yes && r.yes === x.yes) ||
                (r.no && x.no && r.no === x.no) ||
                (r.default && x.default && r.default === x.default))
            ) {
              percentage += 100;
            }
          });
        });
        percentage = Math.floor(percentage / 9);
        let dob = new Date(findUser.dob);
        //calculate month difference from current date in time
        let month_diff = Date.now() - dob.getTime();

        //convert the calculated difference in date format
        let age_dt = new Date(month_diff);

        //extract year from date
        let year = age_dt.getUTCFullYear();

        //now calculate the age of the user
        let age = Math.abs(year - 1970);
        return res.success(
          {
            userImage: findUser.image,
            userName: findUser.name,
            userBio: findUser.bio,
            userAge: age,
            percentage: percentage,
            userPlan: userPlan,
          },
          "User deatil fetched"
        );
      } else {
        return res.notFound({}, "User not found");
      }
    } catch (err) {
      console.log(err);
      return next(err);
    }
  }

  async lockRequest(req, res, next) {
    let { receivedId } = req.body;
    try {
      let receiver = await User.findOne({ _id: receivedId }).lean();
      let sender = await User.findOne({ _id: req.user._id }).lean();

      let findPlan = await UserPlan.findOne({
        userId: req._id,
        isActive: true,
      }).populate({
        path: "plansId",
        model: Plans,
      });
      let time = findPlan.plansId.replenishTime;
      var minutes = time.split(" ");
      let currentLockCount = await UserActivity.findOne({
        userId: req.user._id,
      });

      if (findPlan.plansId.lock == "0 HRS") {
        return res.warn(
          { upgradePlan: false },
          "Please upgrade your plan....This feature is not available in this plan"
        );
      }

      // 1.Already got request from receiver to current user
      let alreadyGotRequest = await LockProfile.findOne({
        lockById: receivedId,
        receivedId: req.user._id,
        lockStatus: false,
      });

      // 2.Already sent request to receiver from current user
      let alreadySent = await LockProfile.findOne({
        lockById: req.user._id,
        receivedId,
        lockStatus: false,
      });

      // 3.Check current user already locked with another user
      let alreadyLocked = await LockProfile.findOne({
        lockById: req.user._id,
        lockStatus: true,
      });

      // 4.Check receiver user already locked with another user but current user not
      let receiverAlreadyLocked = await LockProfile.findOne({
        lockById: receivedId,
        lockStatus: true,
      });

      // Check condition 1 -----
      if (alreadyGotRequest) {
        return res.warn(
          { upgradePlan: false },
          "You already got request from this user, please check your request list"
        );
      }

      // // Check condition 2 -----
      if (alreadySent) {
        await alreadySent.remove();
        await Notification.findOneAndRemove({ senderId: req.user._id, receivedId: receivedId, type: "lock_request" })
        return res.success({}, "You remove locked request to this user");
      }

      // // Check condition 3 -----
      if (alreadyLocked) {
        return res.warn(
          { upgradePlan: false },
          "You can't send lock request because you are already locked with someone else"
        );
      }

      if (currentLockCount.lockCount == '0 HRS' && currentLockCount.lockEndTime) {

        console.log("-----replenish time")

        let endTime = currentLockCount.lockEndTime;
        let now = moment();
        var travelTime = moment(endTime)
          .add(Number(minutes[0]), "minutes")
          .format();
        console.log(
          "----------minutes[0] when already like count == 0 end",
          minutes[0]
        );
        let end = moment(travelTime); // next date time when likeCount increase
        let duration = moment.duration(end.diff(now));

        //Get hours and subtract from duration
        var hours = duration.hours();
        duration.subtract(hours, "hours");

        //Get Minutes and subtract from duration
        var minutes = duration.minutes();
        duration.subtract(minutes, "minutes");

        //Get seconds
        var seconds = duration.seconds();
        return res.warn(
          { upgradePlan: true, hours, minutes, seconds },
          "You are run out of lock, the lock will be restored back to full after the replenishment time has passed Or you can purchase the items"
        );

      } else {

        // Check condition 4 -----
        if (receiverAlreadyLocked) {
          let profileLock = new LockProfile();
          profileLock.lockById = req.user._id;
          profileLock.receivedId = receivedId;

          let saveProfileLock = await profileLock.save();

          let notification = new Notification({
            senderId: req.user._id,
            receivedId: receivedId,
            title: "Klust3r",
            description: "Sent lock request to you",
            type: "lock_request"
          })
          await notification.save();
          if (receiver.notification) {
            let notificationCount = await Notification.find({ receivedId: receivedId, read: false, isDeleted: false }).countDocuments()

            let token = receiver.deviceToken;
            console.log("---------receiver----token---------", token)
            let msg = {
              "to": token,

              "notification": {
                "sound": "default",
                "title": 'Klust3r',
                "type": "lock_request",
                "notificationCount": `${notificationCount}`,
                "body": `${sender.name} sent request for a lock`,
                "_id": `${saveProfileLock._id}`
              }
            }
            // console.log("---------receiver----msg---------", msg)

            fcm.send(msg, function (err, response) {
              if (err) {
                console.log('Something has gone wrong!' + err);
              } else {
                console.log('Successfully sent with response: ', response);
              }
            });

          }


          return res.success(
            { upgradePlan: false },
            "Locked Request sent but this user is already locked with someone else"
          );
        }

        // If all conditions are not matched -----

        let profileLock = new LockProfile();
        profileLock.lockById = req.user._id;
        profileLock.receivedId = receivedId;

        let saveProfileLock = await profileLock.save();

        let notification = new Notification({
          senderId: req.user._id,
          receivedId: receivedId,
          title: "Klust3r",
          description: "Sent lock request to you",
          type: "lock_request"
        })
        await notification.save();

        if (receiver.notification) {
          let notificationCount = await Notification.find({ receivedId: receivedId, read: false, isDeleted: false }).countDocuments()

          let token = receiver.deviceToken;
          // console.log("---------receiver----token---------", token)
          let msg = {
            "to": token,

            "notification": {
              "sound": "default",
              "title": 'Klust3r',
              "type": "lock_request",
              "notificationCount": `${notificationCount}`,
              "body": `${sender.name} sent request for a lock`,
              "_id": `${saveProfileLock._id}`
            }
          }
          // console.log("---------receiver----msg---------", msg)

          fcm.send(msg, function (err, response) {
            if (err) {
              console.log('Something has gone wrong!' + err);
            } else {
              console.log('Successfully sent with response: ', response);
            }
          });

        }

        return res.success({ upgradePlan: false }, "Locked request sent");

      }

    } catch (err) {
      console.log(err);
      return next(err);
    }
  }
  async findRequest(req, res, next) {
    try {
      let { _id } = req.body
      let request = await LockProfile.findOne({ _id: _id, lockStatus: false })
        .populate({ path: "lockById", select: "image name dob", model: User })
        .populate({ path: "receivedId", select: "image name dob", model: User });
      if (request) {
        let dob = new Date(request.lockById.dob);
        //calculate month difference from current date in time
        let month_diff = Date.now() - dob.getTime();

        //convert the calculated difference in date format
        let age_dt = new Date(month_diff);

        //extract year from date
        let year = age_dt.getUTCFullYear();

        //now calculate the age of the user
        let age = Math.abs(year - 1970);
        return res.success({ request, senderAge: age }, "Lock request get succesfully");
      } else {
        return res.notFound({}, "Lock request not found");
      }
    } catch (error) {
      console.log(error)
      res.next(error)
    }
  }

  async likeList(req, res, next) {
    let { slug } = req.body;
    try {
      let chat = await Chat.aggregate([
        {
          $match: {
            $or: [
              { senderId: ObjectId(req._id) },
              { receiverId: ObjectId(req._id) },
            ],
          },
        },
        {
          $project: {
            userId: {
              $cond: [
                { $eq: [req._id, "$senderId"] },
                "$receiverId",
                "$senderId",
              ],
            },
          },
        },
        {
          $group: {
            _id: "$userId",
          },
        },
      ]);
      chat = chat.length > 0 ? chat.map((x) => x._id) : [];
      if (slug == "MY LIKES") {
        console.log("-------chat--------", chat);
        let likeProfileList = await LikeProfile.find({
          likedById: req.user._id,
          receivedId: { $not: { $in: chat } },
        })
          .select({ receiveDescription: 0 })
          .populate({ path: "likedById", select: "image name", model: User })
          .populate({ path: "receivedId", select: "image name", model: User });

        if (likeProfileList == "") {
          return res.warn({}, "NO MY LIKES LIST");
        } else {
          return res.success({ myLikedList: likeProfileList }, "MY LIKES LIST");
        }
      } else if (slug == "RECEIVED LIKES") {
        let likeProfileList = await LikeProfile.find({
          receivedId: req.user._id,
          likedById: { $not: { $in: chat } },
        })
          .select({ myDescription: 0 })
          .populate({ path: "likedById", select: "image name", model: User })
          .populate({ path: "receivedId", select: "image name", model: User });

        if (likeProfileList.length > 0) {
          return res.success(
            { receivedLikedList: likeProfileList },
            "RECEIVED LIKES LIST"
          );
        } else {
          return res.warn({}, "NO RECEIVED LIKES LIST");
        }
      } else {
        return res.warn({}, "like list error");
      }
    } catch (err) {
      console.log(err);
      return next(err);
    }
  }

  async loveList(req, res, next) {
    let { slug } = req.body;
    try {
      if (slug == "MY LOVES") {
        let loveProfileList = await LoveProfile.find({
          lovedById: req.user._id,
        })
          .select({ receiveDescription: 0 })
          .populate({ path: "lovedById", select: "image name", model: User })
          .populate({ path: "receivedId", select: "image name", model: User });

        if (loveProfileList == "") {
          return res.warn({}, "NO MY LOVES LIST");
        } else {
          return res.success({ myLovedList: loveProfileList }, "MY LOVES LIST");
        }
      } else if (slug == "RECEIVED LOVES") {
        let loveProfileList = await LoveProfile.find({
          receivedId: req.user._id,
        })
          .select({ myDescription: 0 })
          .populate({ path: "lovedById", select: "image name", model: User })
          .populate({ path: "receivedId", select: "image name", model: User });

        if (loveProfileList == "") {
          return res.warn({}, "NO RECEIVED LOVES LIST");
        } else {
          return res.success(
            { receivedLovedList: loveProfileList },
            "RECEIVED LOVES LIST"
          );
        }
      } else {
        return res.warn({}, "LOVES LIST ERROR");
      }
    } catch (err) {
      console.log(err);
      return next(err);
    }
  }

  async holdList(req, res, next) {
    let { slug } = req.body;
    try {
      if (slug == "MY KORIS") {
        let holdProfileList = await HoldProfile.find({
          holdById: req.user._id,
        })
          .select({ receiveDescription: 0 })
          .populate({ path: "holdById", select: "image name", model: User })
          .populate({ path: "receivedId", select: "image name", model: User });

        if (holdProfileList == "") {
          return res.warn({}, "NO MY KORIS LIST");
        } else {
          return res.success({ myKorisList: holdProfileList }, "MY KORIS LIST");
        }
      } else if (slug == "RECEIVED KORIS") {
        let holdProfileList = await HoldProfile.find({
          receivedId: req.user._id,
        })
          .select({ myDescription: 0 })
          .populate({ path: "holdById", select: "image name", model: User })
          .populate({ path: "receivedId", select: "image name", model: User });

        if (holdProfileList == "") {
          return res.warn({}, "NO RECEIVED KORIS LIST");
        } else {
          return res.success(
            { receivedKorisList: holdProfileList },
            "RECEIVED KORIS LIST"
          );
        }
      } else {
        return res.warn({}, "KORIS LIST ERROR");
      }
    } catch (err) {
      console.log(err);
      return next(err);
    }
  }

  async lockList(req, res, next) {
    let { slug } = req.body;
    try {
      if (slug == "LOCK STATUS") {
        let lockProfileList = await LockProfile.find({
          lockById: req.user._id,
          lockStatus: true,
        })
          .populate({ path: "lockById", select: "image name", model: User })
          .populate({ path: "receivedId", select: "image name", model: User });

        if (lockProfileList == "") {
          return res.warn({}, "NO LOCK STATUS LIST");
        } else {
          return res.success(
            { lockStatusList: lockProfileList },
            "LOCK STATUS LIST"
          );
        }
      } else if (slug == "LOCK REQUESTS") {
        let lockProfileList = await LockProfile.find({
          receivedId: req.user._id,
          lockStatus: false,
        })
          .populate({ path: "lockById", select: "image name", model: User })
          .populate({ path: "receivedId", select: "image name", model: User });

        if (lockProfileList == "") {
          return res.warn({}, "NO LOCK REQUESTS LIST");
        } else {
          return res.success(
            { lockRequestsList: lockProfileList },
            "RECEIVED KORIS LIST"
          );
        }
      } else {
        return res.warn({}, "LOCK LIST ERROR");
      }
    } catch (err) {
      console.log(err);
      return next(err);
    }
  }

  async acceptLockRequest(req, res, next) {
    let { _id } = req.body;
    try {
      let findRequest = await LockProfile.findOne({
        _id,
        lockStatus: false,
      });

      // 1.check if current user is already locked with someone
      let alreadyLocked = await LockProfile.findOne({
        lockById: req.user._id, // interchange
        lockStatus: true,
      });

      if (findRequest) {
        let findChat = await Chat.findOne({ $or: [{ 'senderId': findRequest.lockById, 'receiverId': findRequest.receivedId }, { 'senderId': findRequest.receivedId, 'receiverId': findRequest.lockById }] }); // chat find with receiver

        // note: find chat enable field when already chatted before and chat enable field hit true
        // 2.if requset sender user is already locked
        let requestUserAlreadyLocked = await LockProfile.findOne({
          lockById: findRequest.lockById, // interchange
          lockStatus: true,
        });
        // check condition 1
        if (alreadyLocked) {
          return res.warn(
            {},
            "You can't accept this request because you already locked with someone"
          );
        }
        // check condition 2
        if (requestUserAlreadyLocked) {
          return res.warn(
            {},
            "You can't accept this request because sender user locked with someone after sent this request"
          );
        }
        let sender = await User.findOne({ _id: findRequest.lockById }).lean();
        let receiver = await User.findOne({ _id: req.user._id }).lean();
        // if all conditions are not matched
        findRequest.lockStatus = true;
        findRequest.acceptTime = moment().format();

        let savedRequest = await findRequest.save();
        // ------- interchange ------
        let lockRequest = new LockProfile();
        lockRequest.lockById = savedRequest.receivedId;
        lockRequest.receivedId = savedRequest.lockById;
        lockRequest.lockStatus = true;
        lockRequest.acceptTime = moment().format();
        let acceptedData = await lockRequest.save();


        // ----notification to sender 
        let notification = new Notification({
          senderId: savedRequest.receivedId,
          receivedId: savedRequest.lockById,
          title: "Klust3r",
          description: "accept your lock request",
          type: "lock_accept"
        })
        await notification.save();

        if (sender.notification) {
          let notificationCount = await Notification.find({ receivedId: findRequest.lockById, read: false, isDeleted: false }).countDocuments()

          let token = sender.deviceToken;
          console.log("---------sender----token---------", token)
          let msg = {
            "to": token,

            "notification": {
              "sound": "default",
              "title": 'Klust3r',
              "type": "lock_accept",
              "notificationCount": `${notificationCount}`,
              "body": `${receiver.name} accept your lock request`

            }
          }
          console.log("---------sender----msg---------", msg)

          fcm.send(msg, function (err, response) {
            if (err) {
              console.log('Something has gone wrong!' + err);
            } else {
              console.log('Successfully sent with response: ', response);
            }
          });

        }

        let senderLockCount = await UserActivity.findOne({
          userId: findRequest.lockById,
        });
        let e = senderLockCount.lockCount.match(/[a-zA-Z]+|[0-9]+/g); // split number and alpha characters

        senderLockCount.lockCount = '0 HRS'
        senderLockCount.lockEndTime = moment().add(e[0], "hours").format();

        let senderLockCountSave = await senderLockCount.save();

        console.log("-=-=-==>>>senderLockCount", senderLockCountSave)


        // Find plan of request sender
        let findPlanOfSender = await UserPlan.findOne({
          userId: findRequest.lockById,
          isActive: true,
        }).populate({ path: "plansId", select: "lock replenishTime", model: Plans });

        let a = findPlanOfSender.plansId.lock.match(/[a-zA-Z]+|[0-9]+/g); // split number and alpha characters
        let b = findPlanOfSender.plansId.replenishTime.match(/[a-zA-Z]+|[0-9]+/g); // split number and alpha characters
        let startdate = moment(acceptedData.acceptTime); // request accepted date time

        let nexttDate = startdate.add(a[0], "hours").format();
        console.log("-=-=nexttDate", nexttDate)

        let date = new Date(nexttDate);
        let endDate = moment(date);

        let date_ = new Date(endDate);
        let actlDate = date_.getDate();
        let monts = date_.getMonth() + 1;
        let hrs = date_.getHours();
        let mints = date_.getMinutes();
        let sec = date_.getSeconds();
        // cron run when sender plan hrs complete and interchange and request both delete and chat enabled field false
        cron.schedule(
          `${sec} ${mints} ${hrs} ${actlDate} ${monts} *`,
          async () => {
            await savedRequest.remove();
            await acceptedData.remove();

            console.log(
              ">>>>>>>>>>>>>>--------- lock request removed from sender's plan >>>>>>>>>>>>>>---------"
            );
          }
        );

        //cron run for sender to refill lock count after the time lock count + replenish time 
        let refillStartdate = moment(senderLockCountSave.lockEndTime); // request accepted date time

        let refillNexttDate = refillStartdate.add(b[0], "minutes").format();
        console.log("-=-=refillNexttDate", refillNexttDate)

        let refillDate = new Date(refillNexttDate);
        let refillEndDate = moment(refillDate);

        let refillDate_ = new Date(refillEndDate);
        let actlDate_ = refillDate_.getDate();
        let monts_ = refillDate_.getMonth() + 1;
        let hrs_ = refillDate_.getHours();
        let mints_ = refillDate_.getMinutes();
        let sec_ = refillDate_.getSeconds();
        cron.schedule(
          `${sec_} ${mints_} ${hrs_} ${actlDate_} ${monts_} *`,
          async () => {
            console.log(
              ">>>>>>>>>>>>>>--------- cron hit to refill sender lock count after lock time and replenish time  >>>>>>>>>>>>>>---------"
            );
            let senderLockCount_ = await UserActivity.findOne({
              userId: senderLockCountSave.userId,
            });

            if (senderLockCount_.lockCount == '0 HRS' && senderLockCount_.lockEndTime == senderLockCountSave.lockEndTime) {
              let findPlan_ = await UserPlan.findOne({
                userId: senderLockCountSave.userId,
                isActive: true,
              }).populate({ path: "plansId", select: "lock", model: Plans });
              senderLockCount_.lockCount = findPlan_.plansId.lock
              senderLockCount_.lockEndTime = '0'
              await senderLockCount_.save()
              console.log("-=-=senderLockCount_", senderLockCount_)

            }


          }
        );
        if (!findChat) {
          let chat = new Chat({
            senderId: req._id,
            receiverId: findRequest.lockById,
            msg: "Welcome",
            ignore: true
          });
          await chat.save();
        }

        return res.success({}, "Request accepted");
      } else {
        return res.warn({}, "This request already accepted");
      }
    } catch (err) {
      console.log(err);
      return next(err);
    }
  }

  async declineLockRequest(req, res, next) {
    let { _id } = req.body;
    try {
      let findRequest = await LockProfile.findOne({
        _id,
        lockStatus: false,
      });
      // 1.check if current user is already locked with someone
      let alreadyLocked = await LockProfile.findOne({
        lockById: req.user._id, // interchange
        lockStatus: true,
      });
      if (findRequest) {
        // check condition 1
        if (alreadyLocked) {
          return res.warn(
            {},
            "You can't decline this request because you already locked with someone"
          );
        }
        await Notification.findOneAndRemove({ senderId: findRequest.lockById, receivedId: findRequest.receivedId, type: "lock_request" })

        console.log("-=-=notification removed")

        await findRequest.remove();

        return res.success({}, "Request declined");
      } else {
        return res.warn(
          {},
          "This request already accepted or request notFound"
        );
      }
    } catch (err) {
      console.log(err);
      return next(err);
    }
  }

  async referEarn(req, res, next) {
    let user = await User.findOne({ _id: req.user._id });
    let reward = await Reward.findOne({
      slug: "3_FRIENDS",
      isSuspended: false,
      isDeleted: false,
    });
    let refer = {};
    if (reward) {
      refer.code = user.referalCode;
      refer.slug = reward.title;
      refer.earnCurrency = `$${reward.reward}`;

      return res.success({ refer: refer }, "REFER A FRIEND");
    } else {
      return res.warn({ refer: refer }, "REFER A FRIEND ERROR");
    }
  }

  async referLink(req, res, next) {
    let referLink = "https://play.google.com/store/games?pli=1";

    return res.success({ referLink: referLink }, "REFER A FRIEND LINK");
  }

  async upgradePlan(req, res, next) {
    let { planId, month } = req.body; // month 0 when plan is free
    try {

      let findPlan = await Plans.findOne({ _id: planId, isSuspended: false });
      let findUser = await User.findOne({ _id: req._id });
      let findUserActivity = await UserActivity.findOne({ userId: req._id });
      let userWallet = await UserWallet.findOne({ userId: req._id });
      let userdating = await UserDatingPreferences.findOne({ userId: req._id })
      console.log("-----------------findPaln", findPlan)

      if (findPlan) {


        // if (month == "1") {
        //   if (userWallet.currentBalance < findPlan.price) {
        //     return res.warn({}, "You have insuficient wallet");
        //   }
        // }
        // if (month == "6") {
        //   if (userWallet.currentBalance < findPlan.price6) {
        //     return res.warn({}, "You have insuficient wallet");
        //   }
        // }

        // if (month == "12") {
        //   if (userWallet.currentBalance < findPlan.price12) {
        //     return res.warn({}, "You have insuficient wallet");
        //   }
        // }

        let findUserPlan = await UserPlan.findOne({
          userId: req._id,
          isActive: true,
        });
        console.log("-----------------findUserPlan", findUserPlan)

        if (findUserPlan) {
          await findUserPlan.remove();
          if (!findUser.questionSkip) {
            let questionary = await UserQusetionaryReport.find({
              userId: req.user._id,
            });
            if (questionary.length > 0) {
              // await questionary.remove()
              await UserQusetionaryReport.deleteMany({
                userId: req.user._id,
              });
            }
          }
          let userPlan = new UserPlan();
          userPlan.userId = req._id;
          userPlan.plansId = planId;
          userPlan.isActive = true;

          if (findPlan.type == "PAID") {
            // let userPayment = new UserPaymentDetail()
            // userPayment.userId = req._id;
            // userPayment.plansId = planId;
            // if (month == 1) {
            //   userPayment.currency = findPlan.price
            // } else if (month == 6) {
            //   userPayment.currency = findPlan.price6
            // } else {
            //   userPayment.currency = findPlan.price12
            // }
            // let userPaymentHistory = await userPayment.save()
            // console.log('------------userPaymentHistory---------------', userPaymentHistory)

            userPlan.duration = month;
            userPlan.time = moment().format()
            findUser.questionSkip = false;
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
                let _userdating = await UserDatingPreferences.findOne({ userId: req._id })


                var planEndTime = moment(_userPlan.time)
                  .add(Number(_userPlan.duration), "month")
                  .format();

                if (_userPlan.time && _userPlan.duration) {
                  if (planEndTime == currentTime) {
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

                    _userdating.scrollingCaps = 'SLOWER'
                    await _userdating.save();

                  }

                }

              }
            );
          }
          if (findPlan.type == "FREE") {
            userPlan.duration = '';
            userPlan.time = '';
            findUser.questionSkip = true;
          }
          await userPlan.save();

          // if (month == "1") {

          //   userWallet.currentBalance =
          //     Number(userWallet.currentBalance) - Number(findPlan.price);
          //   await userWallet.save();
          //   let earnings = new UserEarning({
          //     userId: req._id,
          //     greeting: `Your plan has been upgraded to ${findPlan.name}`,
          //     amount: `-$${findPlan.price}`,
          //     type: findPlan._id,
          //     imageType: true,
          //   });
          //   await earnings.save();
          // }

          // if (month == "6") {
          //   userWallet.currentBalance =
          //     Number(userWallet.currentBalance) - Number(findPlan.price6);
          //   await userWallet.save();
          //   let earnings = new UserEarning({
          //     userId: req._id,
          //     greeting: `Your plan has been upgraded to ${findPlan.name}`,
          //     amount: `-$${findPlan.price6}`,
          //     type: findPlan._id,
          //     imageType: true,
          //   });
          //   await earnings.save();
          // }

          // if (month == "12") {
          //   userWallet.currentBalance =
          //     Number(userWallet.currentBalance) - Number(findPlan.price12);
          //   await userWallet.save();
          //   let earnings = new UserEarning({
          //     userId: req._id,
          //     greeting: `Your plan has been upgraded to ${findPlan.name}`,
          //     amount: `-$${findPlan.price12}`,
          //     type: findPlan._id,
          //     imageType: true,
          //   });
          //   await earnings.save();
          // }

          let savedUser = await findUser.save();

          if (findUserActivity) {
            findUserActivity.likeCount = findPlan.like;
            findUserActivity.likeEndTime = "0";
            findUserActivity.loveCount = findPlan.love;
            findUserActivity.loveEndTime = "0";
            findUserActivity.holdCount = findPlan.hold;
            findUserActivity.holdEndTime = "0";
            findUserActivity.lockCount = findPlan.lock;
            findUserActivity.lockEndTime = "0";
            findUserActivity.superLikeCount = findPlan.superLike;
            findUserActivity.superLikeEndTime = "0";
            findUserActivity.romantikCount = findPlan.romantiks;
            findUserActivity.romantikEndTime = "0";
            findUserActivity.sentRomantik = "0";
            findUserActivity.messageCount = findPlan.dm;
            findUserActivity.messageEndTime = "0";
            findUserActivity.sentMessage = "0";
            findUserActivity.chatBackground = findPlan.chatBackground;
            findUserActivity.phoneCalls = findPlan.phoneCalls;
            findUserActivity.videoCalls = findPlan.videoCalls;
            findUserActivity.zodiacDescription = findPlan.zodiacDescription;

            await findUserActivity.save();
          }

          if (userdating) {
            if (findPlan.name == 'Pegasus') {
              userdating.scrollingCaps = 'FASTER'
            } else {
              userdating.scrollingCaps = 'SLOWER'
            }
            await userdating.save();
          }

          return res.success(
            {
              findPlan,
              questionSkip: savedUser.questionSkip,
            },
            "Plan upgrade successfully"
          );
        } else {
          return res.warn({}, "Please purchase plan first");
        }
      } else {
        return res.notFound({}, "Plan not found or suspended");
      }
    } catch (err) {
      console.log(err);
      return next(err);
    }
  }

  async requirementsToEarn(req, res, next) {
    try {
      let requirements = await Reward.find(
        { isSuspended: false, isDeleted: false },
        { created: 0, updated: 0, __v: 0 }
      );
      if (requirements.length > 0) {
        return res.success({ requirements }, "Requirements to earn currency");
      } else {
        return res.notFound({}, "No requirements found");
      }
    } catch (err) {
      console.log(err);
      return next(err);
    }
  }

  async myEarnings(req, res, next) {
    let { sort, slug } = req.body;
    try {
      let start = moment().day(-6).toDate(); // start date of last week from monday
      let end = new Date(start);
      end.setDate(end.getDate() + 6); // date of sunday from start date of last week from monday
      // last month
      let lastMonthFirstDate = moment()
        .subtract(1, "months")
        .startOf("month")
        .format();
      let lastMonthLastDate = moment()
        .subtract(1, "months")
        .endOf("month")
        .format();
      // last 3 months
      let lastThreeMonthFirstDate = moment()
        .subtract(3, "months")
        .startOf("month")
        .format();
      let lastThreeMonthLastDate = moment()
        .subtract(1, "months")
        .endOf("month")
        .format();

      let totalReward = await Reward.find({
        isSuspended: false,
      }).countDocuments();

      let currentAmount = await UserWallet.findOne(
        { userId: req._id },
        { currentBalance: 1, _id: 0 }
      );

      // let myEarningsCount = await UserEarning.find({
      //   userId: req._id,
      // }).countDocuments()
      // let earnProgress = Math.floor((myEarningsCount / totalReward) * 100)

      //let progress= await UserReward.find({userId: req._id}).sort({progress:-1}).limit(1);
      let progress = await UserReward.aggregate([
        {
          $match: { userId: req._id },
        },
        {
          $sort: { progress: -1 },
        },
        {
          $limit: 1,
        },
        {
          $lookup: {
            from: "rewards",
            foreignField: "_id",
            localField: "rewardId",
            as: "Reward",
          },
        },
        {
          $unwind: "$Reward",
        },
        {
          $project: {
            progress: {
              $function: {
                body: function (progress) {
                  return Math.floor(progress);
                },
                args: ["$progress"],
                lang: "js",
              },
            },
            rewardName: "$Reward.title",
            price: "$Reward.reward",
          },
        },
      ]);

      console.log("progress+++++++++++++++++", progress);

      if (sort == "all" && slug == "myEarning") {
        let myEarnings = await UserEarning.find(
          { userId: req._id },
          { greeting: 1, amount: 1, type: 1, created: 1, _id: 0 }
        ).sort({ created: -1 });

        if (myEarnings.length > 0) {
          return res.success(
            {
              myEarnings,
              currentBalance: currentAmount ? currentAmount.currentBalance : 0,
              earnProgress: progress,
            },
            "Your earnings fetch successfully"
          );
        } else {
          return res.notFound(
            {
              myEarnings,
              currentBalance: currentAmount ? currentAmount.currentBalance : 0,
              earnProgress: progress,
            },
            "You have no earnings yet"
          );
        }
      }

      if (sort == "lastWeek" && slug == "myEarning") {
        let myEarnings = await UserEarning.find(
          { userId: req._id, created: { $gte: start, $lte: end } },
          { greeting: 1, amount: 1, type: 1, created: 1, _id: 0 }
        ).sort({ created: -1 });

        if (myEarnings.length > 0) {
          return res.success(
            {
              myEarnings,
              currentBalance: currentAmount ? currentAmount.currentBalance : 0,
              earnProgress: progress,
            },
            "Your earnings fetch successfully"
          );
        } else {
          return res.notFound(
            {
              myEarnings,
              currentBalance: currentAmount ? currentAmount.currentBalance : 0,
              earnProgress: progress,
            },
            "You have no earnings in the last week"
          );
        }
      }

      if (sort == "lastMonth" && slug == "myEarning") {
        let myEarnings = await UserEarning.find(
          {
            userId: req._id,
            created: { $gte: lastMonthFirstDate, $lte: lastMonthLastDate },
          },
          { greeting: 1, amount: 1, type: 1, created: 1, _id: 0 }
        ).sort({ created: -1 });

        if (myEarnings.length > 0) {
          return res.success(
            {
              myEarnings,
              currentBalance: currentAmount ? currentAmount.currentBalance : 0,
              earnProgress: progress,
            },
            "Your earnings fetch successfully"
          );
        } else {
          return res.notFound(
            {
              myEarnings,
              currentBalance: currentAmount ? currentAmount.currentBalance : 0,
              earnProgress: progress,
            },
            "You have no earnings in the last week"
          );
        }
      }

      if (sort == "lastThreeMonth" && slug == "myEarning") {
        let myEarnings = await UserEarning.find(
          {
            userId: req._id,
            created: {
              $gte: lastThreeMonthFirstDate,
              $lte: lastThreeMonthLastDate,
            },
          },
          { greeting: 1, amount: 1, type: 1, created: 1, _id: 0 }
        ).sort({ created: -1 });

        if (myEarnings.length > 0) {
          return res.success(
            {
              myEarnings,
              currentBalance: currentAmount ? currentAmount.currentBalance : 0,
              earnProgress: progress,
            },
            "Your three months earning fetch successfully"
          );
        } else {
          return res.notFound(
            {
              myEarnings,
              currentBalance: currentAmount ? currentAmount.currentBalance : 0,
              earnProgress: progress,
            },
            "You have no earnings in the last three months"
          );
        }
      }
      return res.warn({}, "Enter correct slug and sort");
    } catch (err) {
      console.log(err);
      return next(err);
    }
  }

  async availableItemsInWallet(req, res, next) {
    try {
      let purchaseItemsList = [];
      let findPlan = await UserPlan.findOne({
        userId: req._id,
        isActive: true,
      });
      let plan = await Plans.findOne({ _id: findPlan.plansId })
      let query = { planId: findPlan.plansId }

      if (plan.type == 'FREE') {
        query.$and = [{ name: { $ne: 'Saski' } }, { name: { $ne: 'Romantik' } }]
      }

      let wallet = await UserWallet.findOne({
        userId: req.user._id,
      });
      let superLikes = await CurrencyActionsReplenish.find({
        name: "Super Like",
      });

      if (superLikes.length > 0) {
        superLikes.map(async (superLike) => {
          let obj = {};
          obj.itemId = superLike._id;
          obj.value = superLike.value;
          obj.image = superLike.image;
          obj.name = superLike.name;
          obj.price = superLike.price;

          if (superLike.price <= wallet.currentBalance) {
            obj.show = true;
          } else {
            obj.show = false;
          }
          purchaseItemsList.push(obj);
        });
      }

      let replenishItems = await CurrencyActionsReplenish.find(query);

      if (replenishItems.length > 0) {
        async.mapSeries(
          replenishItems,
          async function (items) {
            let obj = {};
            // let wallet = await UserWallet.findOne({
            //   userId: req.user._id,
            // });
            // console.log("---------------wallet", wallet.currentBalance);
            // console.log("---------------items.price", items.price);

            obj.itemId = items._id;
            obj.value = items.value;
            obj.image = items.image;
            obj.name = items.name;
            obj.price = items.price;

            if (items.price <= wallet.currentBalance) {
              obj.show = true;
            } else {
              obj.show = false;
            }

            // obj.show = wallet.currentBalance >= items.price ? true : false;
            purchaseItemsList.push(obj);
          },
          function () {
            return res.success({ purchaseItemsList }, "Purchase items list");
          }
        );
      }
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  async purchaseItemsInWallet(req, res, next) {
    let { id } = req.body;
    try {
      let replenishItem = await CurrencyActionsReplenish.findOne({
        _id: id,
      });

      let wallet = await UserWallet.findOne({
        userId: req.user._id,
      });
      let findUserActivity = await UserActivity.findOne({ userId: req._id });

      if (wallet.currentBalance >= replenishItem.price) {
        if (replenishItem.name == "Teken") {
          findUserActivity.likeCount =
            Number(findUserActivity.likeCount) + Number(replenishItem.value);
          findUserActivity.likeEndTime = "0";
        }
        if (replenishItem.name == "Koi") {
          findUserActivity.loveCount =
            Number(findUserActivity.loveCount) + Number(replenishItem.value);
          findUserActivity.loveEndTime = "0";
        }
        if (replenishItem.name == "Kori") {
          findUserActivity.holdCount =
            Number(findUserActivity.holdCount) + Number(replenishItem.value);
          findUserActivity.holdEndTime = "0";
        }
        if (replenishItem.name == "Saski") {
          let a = findUserActivity.lockCount.match(/[a-zA-Z]+|[0-9]+/g); // split number and alpha characters
          let a_ = Number(a[0]) + Number(replenishItem.value)
          findUserActivity.lockCount = `${a_} HRS`
          findUserActivity.lockEndTime = "0";
        }
        if (replenishItem.name == "Messages") {
          findUserActivity.messageCount =
            Number(findUserActivity.messageCount) + Number(replenishItem.value);
          findUserActivity.messageEndTime = "0";
        }
        if (replenishItem.name == "Romantik") {
          findUserActivity.romantikCount =
            Number(findUserActivity.romantikCount) +
            Number(replenishItem.value);
          findUserActivity.romantikEndTime = "0";
        }

        if (replenishItem.name == "Super Like") {
          findUserActivity.superLikeCount =
            Number(findUserActivity.superLikeCount) +
            Number(replenishItem.value);
          findUserActivity.superLikeEndTime = "0";
        }

        await findUserActivity.save();
        wallet.currentBalance = wallet.currentBalance - replenishItem.price;
        await wallet.save();

        if (replenishItem.name == 'Saski') {
          let earnings = new UserEarning({
            userId: req._id,
            greeting: `You purchase ${replenishItem.value} HRS ${replenishItem.name}`,
            amount: `-$${replenishItem.price}`,
            type: replenishItem._id,
            imageType: true,
          });
          await earnings.save();
        } else {
          let earnings = new UserEarning({
            userId: req._id,
            greeting: `You purchase ${replenishItem.value} ${replenishItem.name}`,
            amount: `-$${replenishItem.price}`,
            type: replenishItem._id,
            imageType: true,
          });
          await earnings.save();
        }

        return res.success({}, "Purchase sucessfull");
      } else {
        return res.warn({}, "Insufficiant Balance");
      }
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  async chatList(req, res, next) {
    try {
      let CHATS = await Chat.aggregate([
        {
          $match: {
            $or: [{ senderId: req._id }, { receiverId: req._id }]
          }
        },
        {
          $sort: {
            created: -1
          }
        },
        {
          $project: {
            _id: 0,
            receiverId: {
              $cond: [{ $eq: [req._id, "$senderId"] }, "$receiverId", "$senderId"]
            }
          }
        },
        {
          $group: {
            _id: "$receiverId"
          }
        },
        {
          "$lookup": {
            "from": "users",
            "let": {
              "userId": "$_id"
            },
            "pipeline": [
              {
                "$match": { "$expr": { "$eq": ["$_id", '$$userId'] } }
              }
            ],
            "as": "Friend"
          }
        },
        {
          $unwind: {
            path: "$Friend"
          }
        },
        {
          "$lookup": {
            "from": "chats",
            "let": {
              "userId": "$_id",
              "userIdd": req._id
            },
            "pipeline": [
              {
                "$match": {
                  $or: [
                    {
                      $and: [
                        { "$expr": { "$eq": ["$senderId", "$$userId"] } },
                        { "$expr": { "$eq": ["$receiverId", "$$userIdd"] } },
                      ]
                    },
                    {
                      $and: [
                        { "$expr": { "$eq": ["$senderId", "$$userIdd"] } },
                        { "$expr": { "$eq": ["$receiverId", "$$userId"] } },
                      ]
                    },
                  ]
                }

              },
              {
                $sort: { created: -1 }
              }
            ],
            "as": "Chats"
          }
        },
        {
          $project: {

            _id: 0,
            "friend._id": "$Friend._id",
            "friend.name": "$Friend.name",
            "friend.image": "$Friend.image",
            "msg": {
              $arrayElemAt: ["$Chats", 0]
            },
          }
        },
        {
          $sort: { "msg.created": -1 }
        }
      ]);
      // console.log('--------------chat----------', CHATS)
      let chats = [];
      if (CHATS.length > 0) {
        CHATS.map(e => {
          if (e.msg?.ignore){
            e.msg={}
          } {
            chats.push(e)
          }
        })
      }

      return res.success({
        chats
      }, `Individual  chat list`);

    } catch (err) {
      console.log(err)
      return next(err);
    }
  }

  async chatBgColor(req, res, next) {

    let id = req.user._id
    let chatColor = []
    try {
      let userChatColor = await UserChatColor.findOne({ userId: ObjectId(id), colorType: req.query.colorType })
      let chatColors = await ChatColor.find()
      if (chatColors.length > 0) {
        async.mapSeries(
          chatColors,
          async function (items) {
            let obj = {};
            obj._id = items._id,
              obj.colorCode = items.colorCode
            if (items._id.toString() == userChatColor.colorId.toString()) {
              obj.selected = true;
            } else {
              obj.selected = false;
            }
            chatColor.push(obj);
          },
          function () {
            return res.success({ chatColor }, "Color code fetch successfully.");
          }
        );
      }
    } catch (err) {
      console.log(err);
      return next(err);
    }
  }

  async setChatBgColor(req, res, next) {
    try {
      console.log('------chatbg------')
      let id = req.user._id
      let chatColor = await UserChatColor.findOne({ userId: ObjectId(id), colorType: req.query.colorType })
      let userActivity = await UserActivity.findOne({ userId: ObjectId(id) });
      // console.log('----userchat-----',chatColor)

      if (chatColor) {
        if (userActivity.chatBackground == 'YES') {
          console.log('---------------UpdateEntry--------------')
          chatColor.colorId = req.query.colorId

          let saveColor = await chatColor.save()
          return res.success({ saveColor }, "Color update Successfully.")
        } else {
          return res.warn({}, "You Can not perform this action.")
        }
      }
    } catch (err) {
      console.log(err);
      return next(err);
    }
  }

  async sendMessage(req, res, next) {
    let { msg, image, romantik } = req.body
    try {
      let findPlan = await UserPlan.findOne({
        userId: req._id,
        isActive: true,
      }).populate({ path: "plansId", model: Plans });
      let time = findPlan.plansId.replenishTime;
      var minutes = time.split(" ");

      let msgCount = await UserActivity.findOne({
        userId: req.user._id,
      });

      if (msg || image) {
        if (msgCount.messageCount == '0') {
          let endTime = msgCount.messageEndTime;
          let now = moment();
          var travelTime = moment(endTime)
            .add(Number(minutes[0]), "minutes")
            .format();
          console.log(
            "----------minutes[0] when already meesage count == 0 end",
            minutes[0]
          );
          let end = moment(travelTime); // next date time when messageCount increase
          let duration = moment.duration(end.diff(now));

          //Get hours and subtract from duration
          var hours = duration.hours();
          duration.subtract(hours, "hours");

          //Get Minutes and subtract from duration
          var minutes = duration.minutes();
          duration.subtract(minutes, "minutes");

          //Get seconds
          var seconds = duration.seconds();
          return res.warn(
            { upgradePlan: true, hours, minutes, seconds },
            "You are run out of messages, the messages will be restored back to full after the replenishment time has passed Or you can purchase the items"
          );
        }
      }
      // if (romantik) {

      //   if (msgCount.romantikCount == '0') {

      //     if (msgCount.romantikEndTime == '0') {

      //       return res.warn(
      //         { upgradePlan: false },
      //         "Please upgrade your plan....Romantik is not available in this plan"
      //       );

      //     }
      //     let endTime = msgCount.romantikEndTime;
      //     let now = moment();
      //     var travelTime = moment(endTime)
      //       .add(Number(minutes[0]), "minutes")
      //       .format();
      //     console.log(
      //       "----------minutes[0] when already romantik count == 0 end",
      //       minutes[0]
      //     );
      //     let end = moment(travelTime); // next date time when romantikCount increase
      //     let duration = moment.duration(end.diff(now));

      //     //Get hours and subtract from duration
      //     var hours = duration.hours();
      //     duration.subtract(hours, "hours");

      //     //Get Minutes and subtract from duration
      //     var minutes = duration.minutes();
      //     duration.subtract(minutes, "minutes");

      //     //Get seconds
      //     var seconds = duration.seconds();
      //     return res.warn(
      //       { upgradePlan: true, hours, minutes, seconds },
      //       "You are run out of romantiks, the romantiks will be restored back to full after the replenishment time has passed Or you can purchase the items"
      //     );
      //   }
      // }
      return res.success({ upgradePlan: false }, "Send message");

    } catch (error) {
      console.log(error)
      res.next(error)

    }

  }

  async romantiks(req, res, next) {
    try {
      let romantiks = await Romantiks.find({ isSuspended: false, isDeleted: false })
      let userActivity = await UserActivity.findOne({ userId: req._id })
      let findPlan = await UserPlan.findOne({
        userId: req._id,
        isActive: true,
      }).populate({ path: "plansId", model: Plans });

      let time = findPlan.plansId.replenishTime;
      var minutes = time.split(" ");

      console.log("----", findPlan)
      if (userActivity.romantikCount == '0') {

        if (userActivity.romantikEndTime == '0') {

          return res.warn(
            { upgradePlan: false },
            "Please upgrade your plan....Romantik is not available in this plan"
          );

        }
        let endTime = userActivity.romantikEndTime;
        let now = moment();
        var travelTime = moment(endTime)
          .add(Number(minutes[0]), "minutes")
          .format();
        console.log(
          "----------minutes[0] when already romantik count == 0 end",
          minutes[0]
        );
        let end = moment(travelTime); // next date time when romantikCount increase
        let duration = moment.duration(end.diff(now));

        //Get hours and subtract from duration
        var hours = duration.hours();
        duration.subtract(hours, "hours");

        //Get Minutes and subtract from duration
        var minutes = duration.minutes();
        duration.subtract(minutes, "minutes");

        //Get seconds
        var seconds = duration.seconds();
        return res.warn(
          { upgradePlan: true, hours, minutes, seconds },
          "You are run out of romantiks, the romantiks will be restored back to full after the replenishment time has passed Or you can purchase the items"
        );
      }
      if (romantiks) {
        return res.success(
          { romantiks: romantiks, sent: userActivity.sentRomantik, total: findPlan.plansId.romantiks },
          'Romantiks list get sucessfully',
        )
      }
      return res.warn('', req.__('ROMANTIKS_ERROR'))
    } catch (error) {
      console.log(error)
      res.next(error)
    }
  }

  async image(req, res, next) {
    try {
      let form = new multiparty.Form()
      form.parse(req, async function (err, fields, files) {
        let fileupload = files.image[0]
        try {
          let image = await uploadImage(fileupload, 'chat')
          let url = `${process.env.AWS_BASE_URL}${image.Key}`
          return res.success({ image, url }, 'image uploaded successfully')
        } catch (err) {
          return res.next(err)
        }
      })
    } catch (err) {
      console.log(err)
      return next(err)
    }

  }

  async getLastRomantik(req, res, next) {

    try {
      let { senderId } = req.body
      let chat = await Chat.find({ receiverId: req._id, senderId: senderId }).sort({ created: -1 })
      // console.log('----------chat----------',chat)
      let arr = []
      let msg = []
      if (chat.length > 0) {
        chat.map(val => {
          if (val.romantik && !val.read) {
            let obj = {}
            obj.romantik = val.romantik
            obj.msg = val.msg
            arr.push(obj)
          }
        })
        if (arr.length > 0) {
          // console.log(arr.length,'leangth---')
          // await chat.updateaMany({read: true})
          chat.map(async value => {
            // console.log('value------------------------------------',value)
            value.read = true
            await value.save()
          })
          return res.success({ romantks: arr[0] }, 'Recent romantiks')
        }
        return res.warn({}, 'No recent romantiks')
      }
      return res.notFound({}, 'Chat not found')
    } catch (error) {
      console.log(error)
      res.next(error)
    }

  }

  /*async setTextBgColor(req, res, next) {
    try {
      console.log('------settextbg-------')
      let id = req.user._id

      let chatColor = await UserChatColor.findOne({ userId: ObjectId(id), colorType: req.query.colorType })
      console.log('----userchat-----',chatColor)

      if (chatColor) {
        console.log('---------------UpdateEntry--------------')
        chatColor.colorId = req.query.colorId
        saveColor = await chatColor.save()

        return res.success({ saveColor }, "Color update Successfully.")
      } else {
        console.log('--------------newEnter-------------')
        let bgColor = new UserChatColor({
          colorId: req.query.colorId,
          colorType: req.query.colorType,
          userId: id
        });

        var saveColor = await bgColor.save();
        return res.success({ saveColor }, 'Color add Successfully.')
      }
    } catch (err) {
      console.log(err);
      return next(err);
    }
  }*/

  async privacy_policyPage(req, res) {
    res.render("privacy", {
      API_URL,
    });
  }

  async Aboutus(req, res) {
    res.render("about_us", {
      API_URL,
    });
  }

  async termsAndconditionPage(req, res) {
    res.render("terms_conditions", {
      API_URL: API_URL,
    });
  }

  async html_page(req, res) {
    console.log("-----------html page");
    const slug = req.params.slug;
    const p = await Page.findOne({ slug: slug });
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.send(p);
  }

  async pages(req, res, next) {
    const query = req.body.slug;
    let pageURL = "";
    if (query === "privacy-policy") {
      pageURL = `${process.env.API_URL}/users/privacy_policy`;
    } else if (query == "terms-conditions") {
      pageURL = `${process.env.API_URL}/users/terms_conditions`;
    } else if (query == "about-us") {
      pageURL = `${process.env.API_URL}/users/about_us`;
    }

    return res.success(
      {
        // status: true,
        pageURL,
      },
      "Page URL fetched successfully"
    );
  }


  async MakeCall(req, res, next) {
    // let {  } = req.body;
    try {

      let TO = req.body.to;

      const voiceResponse = new VoiceResponse();
      const dial = voiceResponse.dial();
      const client = dial.client();
      client.identity(TO);
      voiceResponse.say('WelCome');
      return res.send(voiceResponse.toString());

    } catch (err) {
      console.log(err)
      return next(err);
    }


  }
  async AccessTokenVoice(req, res, next) {

    let { identity, DEVICE } = req.query;
    try {

      const accountSid = process.env.TWILIO_SID;
      const apiKey = process.env.API_KEY;
      const apiSecret = process.env.API_KEY_SECRET;
      const outgoingApplicationSid = process.env.APP_SID;

      let pushCredSid = process.env.PUSH_CREDENTIAL_SID_ANDROID;

      const voiceGrant = new VoiceGrant({
        outgoingApplicationSid: outgoingApplicationSid,
        pushCredentialSid: pushCredSid,
      });

      let token = new AccessToken(accountSid, apiKey, apiSecret);
      token.addGrant(voiceGrant);
      token.identity = identity;

      let TOKEN = token.toJwt();
      let CallToken = {};
      CallToken.token = TOKEN;
      CallToken.identity = identity;

      return res.success({ CallToken }, 'Access Token for voice chat')
    } catch (err) {
      console.log(err)
      return next(err);
    }

  }
  async AccessTokenVideo(req, res, next) {

    let { identity, DEVICE, roomName, userId, _identity } = req.query;
    try {

      const token = new AccessToken(
        process.env.TWILIO_SID,
        process.env.API_KEY,
        process.env.API_KEY_SECRET,
        { identity: identity }
      );
      const videoGrant = new VideoGrant({
        room: roomName,
      });


      token.addGrant(videoGrant);
      let TOKEN = token.toJwt();
      let CallToken = {};
      CallToken.token = TOKEN;
      CallToken.identity = identity;
      CallToken.roomName = roomName;
      CallToken.userId = userId;

      let user = await User.findOne({ _id: userId }).lean();


      const _token = new AccessToken(
        process.env.TWILIO_SID,
        process.env.API_KEY,
        process.env.API_KEY_SECRET,
        { identity: _identity }
      );

      const _videoGrant = new VideoGrant({
        room: roomName,
      });

      _token.addGrant(_videoGrant);
      let _TOKEN = _token.toJwt();

      let deviceToken = user.deviceToken;
      let msg = {
        "to": deviceToken,
        priority: 'high',
        contentAvailable: true,
        timeToLive: 1,
        data: {
          "type": "video_call",
          "caller_name": `${req.user.name}`,
          "room_name": `${roomName}`,
          "caller_image": `${req.user.image}`,
          "twi_bridge_token": `${_TOKEN}`,
          "twi_account_sid": `${process.env.TWILIO_SID}`,
          "userId": `${userId}`,
          "identity": `${_identity}`,
          "type": "video_call"
        },
        "notification": {
          "sound": "default",
          "title": `${user.name}`,
          "body": `${req.user.name} calling`,
          "type": "video_call",
          "test": "test"
        }

      }

      fcm.send(msg, function (err, response) {
        if (err) {
          console.log('Something has gone wrong!' + err);
        } else {
          console.log('Successfully sent with response: ', response);
        }
      });

      return res.success({ CallToken }, 'Access Token for video chat')
    } catch (err) {
      console.log(err)
      return next(err);
    }

  }
  async RejectVideoCall(req, res, next) {
    try {

      let { userId } = req.query;
      let user = await User.findOne({ _id: userId }).lean();



      let deviceToken = user.deviceToken;
      let msg = {
        "to": deviceToken,
        priority: 'high',
        contentAvailable: true,
        timeToLive: 1,
        data: {
          "type": "video_call_reject",
          "userId": `${userId}`,
        },
        "notification": {
          "sound": "default",
          "title": ``,
          "body": ``,
          "type": "video_call_reject",
          // "test":"test"
        }

      }

      fcm.send(msg, function (err, response) {
        if (err) {
          console.log('Something has gone wrong!' + err);
        } else {
          console.log('Successfully sent with response: ', response);
        }
      });


      return res.success();
    } catch (err) {
      console.log(err)
      return next(err);
    }
  }

  async AccessTokenAudio(req, res, next) {
    try {
      console.log('-----------Create AccessToken for audio-------------')
      let { channelName, uid, receiverId, type } = req.body;

      // Set response header
      res.header('Access-Control-Allow-Origin', '*');

      //get channel name
      // const channelName = '7d72365eb983485397e3e3f9d460bdda';
      if (!channelName) {
        return res.warn("Channel is required")
      }

      // get uid
      // let uid = 2882341273
      if (!uid || uid == '') {
        uid = 0;
      }

      // get role
      let role = RtcRole.PUBLISHER;
      // let role = RtcRole.SUBSCRIBE;

      // get the expire token
      // let expirationTimeInSeconds = 3600;

      // // currentTimestamp
      // // const currentTime = Math.floor(Date.now() / 1000);
      // var currentTimestamp = Math.floor(Date.now() / 1000)
      // var privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds

      // // build the token
      // var token_ = RtcTokenBuilder.buildTokenWithUid(APP_ID, APP_ID, channelName, uid, role, privilegeExpiredTs);
      // resp.header("Access-Control-Allow-Origin", "*")
      //resp.header("Access-Control-Allow-Origin", "http://ip:port")
      //  return resp.json({ 'key': key }).send();

      // let token = new AccessToken2(APP_ID, APP_CERTIFICATE, currentTime,role, expireTime)
      // let rtc_service = new ServiceRtc(channelName, uid)
      // token.add_service(rtc_service)
      // let token_ = token.build()
      // return the token





      const expirationTimeInSeconds = 3600

      const currentTimestamp = Math.floor(Date.now() / 1000)

      const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

      // IMPORTANT! Build token with either the uid or with the user account. Comment out the option you do not want to use below.

      // Build token with uid
      const tokenA = RtcTokenBuilder.buildTokenWithUid(APP_ID, APP_CERTIFICATE, channelName, 0, 1);
      console.log("Token With Integer Number Uid: " + tokenA);
      console.log("==================>>>", APP_ID, APP_CERTIFICATE, channelName, uid, role);

      //1c98de0d06324f979f6a718184ef6c64
      //67afe071d2c14e328757b540cea88561

      let receiver = await User.findOne({ _id: receiverId }).lean();
      let sender = await User.findOne({ _id: req.user._id }).lean()
      if (!receiver) {
        res.warn({}, "User not found")
      }
      let token = receiver.deviceToken;
      console.log("---------receiver----token---------", token)
      let msg = {
        "to": token,
        data: {
          "channelName": `${channelName}`,
          "type": "Receive",
          "_VIDEO": `${type}`,
          "token": `${tokenA}`,
          "senderName": `${sender.name}`,
          "senderImage": `${sender.image}`,
          "senderId": `${sender._id}`,
        },

        "notification": {
          "sound": "default",
          "title": 'Klust3r',

        }
      }
      // console.log("---------receiver----msg---------", msg)

      fcm.send(msg, function (err, response) {
        if (err) {
          console.log('Something has gone wrong!' + err);
        } else {
          console.log('Successfully sent with response: ', response);
        }
      });


      return res.success({ token_: tokenA, channelName, type }, 'Access Token for voice chat')
    } catch (err) {
      console.log(err)
      return next(err);
    }
  }

  async ReceivedCall(req, res, next) {
    try {
      console.log('-----------Create call-------------')
      let { channelId, receiverId } = req.body;
      let receiver = await User.findOne({ _id: receiverId }).lean();
      let sender = await User.findOne({ _id: req.user._id }).lean()
      if (!receiver) {
        res.warn({}, "User not found")
      }
      let token = receiver.deviceToken;
      console.log("---------receiver----token---------", token)
      let msg = {
        "to": token,

        "notification": {
          "sound": "default",
          "title": 'Klust3r',
          "type": "Receive",
          "body": `${sender.name}`,
          "channelId": `${channelId}`

        }
      }
      // console.log("---------receiver----msg---------", msg)

      fcm.send(msg, function (err, response) {
        if (err) {
          console.log('Something has gone wrong!' + err);
        } else {
          console.log('Successfully sent with response: ', response);
        }
      });
      return res.success({}, 'Create call')
    } catch (err) {
      console.log(err)
      return next(err);
    }
  }
  async AccptRjctCall(req, res, next) {
    try {
      console.log('-----------Incoming call-------------')
      let { slug, receiverId } = req.body;
      let receiver = await User.findOne({ _id: receiverId }).lean();
      if (!receiver) {
        res.warn({}, "User not found")
      }
      let token = receiver.deviceToken;
      console.log("---------receiver----token---------", token)
      let msg = {
        "to": token,
        data: {
          "type": `${slug}`,
          "receiverId": `${receiver._id}`,
        },

        "notification": {
          "sound": "default",
          "title": 'Klust3r'

        }
      }
      // console.log("---------receiver----msg---------", msg)

      fcm.send(msg, function (err, response) {
        if (err) {
          console.log('Something has gone wrong!' + err);
        } else {
          console.log('Successfully sent with response: ', response);
        }
      });
      return res.success({}, 'Incoming call')
    } catch (err) {
      console.log(err)
      return next(err);
    }
  }

  async zodiacList(req, res, next) {

    try {
      let zodiacList = await ZodiacImage.find({ isSuspended: false, isDeleted: false })
      if (zodiacList) {
        return res.success({ zodiacList }, `Zodiac list get successfully`);
      }
    } catch (error) {
      console.log(error)
      res.next(error)
    }

  }

  async singleZodiac(req, res, next) {

    try {
      console.log(req.body._id, "----------------------")
      let zodiac = await ZodiacImage.findOne({ _id: req.body._id, isSuspended: false, isDeleted: false })
      console.log(".............", zodiac)
      if (zodiac) {
        return res.success({ zodiac }, `Zodiac get successfully`);
      }
      return res.notFound({}, `Zodiac not found`);

    } catch (error) {
      console.log(error)
      res.next(error)
    }

  }

  async apiAstr(req, res, next) {
    try {
      console.log('-----------------ASTROLOGY DATA --------------')
      let { name, astrology, dob, gender, lat, long, timezone } = req.body
      let zodiac = await ZodiacImage.findOne({ name: astrology })
      // console.log('----------image-00-------',zodiac)
      let userZodiac = await UserActivity.findOne({
        userId: req.user._id,
      });
      let findWallet = await UserWallet.findOne({ userId: req._id });
      // console.log(dob.split("/"))
      // console.log(moment().format('YYYY-MM-DD HH:mm:ss'))
      // let dobFormate = moment().format('YYYY-MM-DD HH:mm:ss')
      let newDate_ = new Date(dob)
      console.log('-------newDate---', newDate_)
      let year = newDate_.getFullYear()
      let month = newDate_.getMonth() + 1
      let day = newDate_.getDate()
      let hour = newDate_.getHours()
      let min = newDate_.getMinutes()
      console.log(min, hour, day, month, year)

      if (userZodiac) {
        if (userZodiac.zodiacDescription == 'NONE') {
          return res.warn(
            { upgradePlan: false },
            "Please upgrade your plan....Zodiac Description is not available in this plan"
          );
        }
      }
      const body = { day: day, month: month, year: year, hour: hour, min: min, lat: lat, lon: long, tzone: timezone };

      var generateAuthToken = {
        method: 'POST',
        url: 'https://json.astrologyapi.com/v1/general_ascendant_report/tropical',
        body: JSON.stringify(body),
        headers: {
          "authorization": "Basic " + btoa(astrUserId + ":" + astrApiKey),
          "Content-Type": 'application/json'
        },
      };

      function doRequest(options) {
        return new Promise(function (resolve, reject) {
          request(options, function (error, res, body) {
            if (!error && res.statusCode === 200) {
              resolve(body);
            } else {
              reject(error);
            }
          });
        });
      }

      let astrData = await doRequest(generateAuthToken)

      console.log("------astrData-------", astrData)
      let objAstr = JSON.parse(astrData)
      let arr = [{ name: name, image: zodiac.image, zodiacName: objAstr.ascendant, data: objAstr.report }]
      // let arr = [{ name: name, image: zodiac.image, zodiacName: astrology, data: [] }]


      let userZodiacRecord = await UserZodiacRecord.findOne({ userId: req.user._id })

      if (userZodiacRecord) {

        let currentDate = moment().format('YYYY-MM-DD')
        let checkDate = moment(userZodiacRecord.time).format('YYYY-MM-DD')

        if (currentDate > checkDate) {

          userZodiacRecord.days += 1;
          userZodiacRecord.time = moment().format();
          let saveUserZodiacRecord = await userZodiacRecord.save()

          if (saveUserZodiacRecord.days == 7) {
            let userWeeklyZodiac = await UserRewardActivity.findOne({ userId: req._id, slug: "WEEKLY_HOROSCOPE" }).populate({ path: 'rewardId', model: Reward })
            if (!userWeeklyZodiac.status) {
              let userEarn = new UserEarning();
              userEarn.userId = req._id;
              userEarn.greeting = `Congratulations!! You have received $${userWeeklyZodiac.rewardId.reward} for ${userWeeklyZodiac.rewardId.title}`;
              userEarn.amount = `+$${userWeeklyZodiac.rewardId.reward}`;
              userEarn.type = userWeeklyZodiac.rewardId._id;
              await userEarn.save();
              // add amount after assign reward
              if (findWallet) {
                findWallet.currentBalance += userWeeklyZodiac.rewardId.reward;
                await findWallet.save();
              }
              userWeeklyZodiac.status = true
              await userWeeklyZodiac.save();
            }
          }
          if (saveUserZodiacRecord.days == 30) {
            let userMonthlyZodiac = await UserRewardActivity.findOne({ userId: req._id, slug: "MONTHLY_HOROSCOPE" }).populate({ path: 'rewardId', model: Reward })
            if (!userMonthlyZodiac.status) {
              let userEarn = new UserEarning();
              userEarn.userId = req._id;
              userEarn.greeting = `Congratulations!! You have received $${userMonthlyZodiac.rewardId.reward} for ${userMonthlyZodiac.rewardId.title}`;
              userEarn.amount = `+$${userMonthlyZodiac.rewardId.reward}`;
              userEarn.type = userMonthlyZodiac.rewardId._id;
              await userEarn.save();
              // add amount after assign reward
              if (findWallet) {
                findWallet.currentBalance += userMonthlyZodiac.rewardId.reward;
                await findWallet.save();
              }
              userMonthlyZodiac.status = true
              await userMonthlyZodiac.save();
            }
          }

        }

      } else {
        let userDaliyZodiac = await UserRewardActivity.findOne({ userId: req._id, slug: "DAILY_HOROSCOPE" }).populate({ path: 'rewardId', model: Reward })
        let userZodiacRecord = new UserZodiacRecord({
          userId: req.user._id,
          time: moment().format()
        })
        await userZodiacRecord.save();

        if (!userDaliyZodiac.status) {
          let userEarn = new UserEarning();
          userEarn.userId = req._id;
          userEarn.greeting = `Congratulations!! You have received $${userDaliyZodiac.rewardId.reward} for ${userDaliyZodiac.rewardId.title}`;
          userEarn.amount = `+$${userDaliyZodiac.rewardId.reward}`;
          userEarn.type = userDaliyZodiac.rewardId._id;
          await userEarn.save();
          // add amount after assign reward
          if (findWallet) {
            findWallet.currentBalance += userDaliyZodiac.rewardId.reward;
            await findWallet.save();
          }
          userDaliyZodiac.status = true
          await userDaliyZodiac.save();
        }

      }

      return res.success(arr, 'Astrology data fetch successfully.')

    } catch (err) {
      console.log(err)
      return res.warn({}, 'server is not responding. please try after some time')
    }

  }

  async gameList(req, res, next) {

    try {
      let games = []
      let singleData = []
      let played=false
      let currentGame = await CurrentGame.findOne({ userId: req._id })
      let game = await Game.find({ isSuspended: false, isDeleted: false })
      console.log("---------currentGame", currentGame)
      console.log("---------game", game)
      if (game.length > 0) {
        // console.log("------------------if", game.length)
        if (currentGame) {
          // console.log("--------currentGame----------if")
          if(currentGame.progress!=0){
            played=true
          }
          async.mapSeries(
            game,
            async function (items) {
              let obj = {};
              obj._id = items._id
              obj.name = items.name
              obj.image = items.image
              obj.colorCode = items.colorCode
              if (items._id.toString() == currentGame.gameId.toString()) {
                obj.selected = true
                obj.progress = currentGame.progress
                singleData.push(obj)
              } else {
                obj.selected = false
                obj.progress = 0
              }
              games.push(obj);
            },
            function () {
              return res.success({ games, singleData,played }, "Game list get successfully");
            }
          );
        } else {
          // console.log("--------currentGame----------else")

          async.mapSeries(
            game,
            async function (items) {
              let obj = {};
              obj._id = items._id
              obj.name = items.name
              obj.image = items.image
              obj.colorCode = items.colorCode
              obj.selected = false
              obj.progress = 0
              games.push(obj);
            },
            function () {
              return res.success({ games, singleData,played }, "Game list get successfully");
            }
          );
        }
      } else {
        return res.notFound({}, `Games not found`);
      }
    } catch (error) {
      console.log(error)
      res.next(error)
    }

  }

  async singleGame(req, res, next) {
    try {
      let currentGame = await CurrentGame.findOne({ userId: req._id })
      let game = await Game.findOne({ _id: req.body._id, isSuspended: false, isDeleted: false })
      let stage = await Stage.find({})
      let arr = []
      console.log(stage)
      if (currentGame) {
        if (currentGame.gameId.toString() == game._id) {
          async.mapSeries(
            stage,
            async function (items) {
              let obj = {};
              obj._id = items._id
              obj.name = items.name
              obj.stageNo = items.stageNo
              if (items._id.toString() == currentGame.stageId.toString()) {
                obj.locked = false
                obj.progress = currentGame.progress
              } else {
                obj.locked = true
                obj.progress = 0
              }
              arr.push(obj);
            },
            function () {
              return res.success({ game, progress: currentGame.progress, stage: arr }, `Game and Stage get successfully`);
            }
          );
        } else {
          await currentGame.remove();
          await UserGame.findOneAndRemove({ userId: req._id })
          let currGame = new CurrentGame({
            gameId: game._id,
            userId: req._id,
            stageId: stage[0]._id
          })
          await currGame.save()
          async.mapSeries(
            stage,
            async function (items) {
              let obj = {};
              obj._id = items._id
              obj.name = items.name
              obj.stageNo = items.stageNo
              if (items._id.toString() == currGame.stageId.toString()) {
                obj.locked = false
                obj.progress = currGame.progress
              } else {
                obj.locked = true
                obj.progress = 0
              }
              arr.push(obj);
            },
            function () {
              return res.success({ game, progress: currGame.progress, stage: arr }, `Game and Stage get successfully`);
            }
          );
        }
      } else {
        let currGame = new CurrentGame({
          gameId: game._id,
          userId: req._id,
          stageId: stage[0]._id
        })

        await currGame.save()
        async.mapSeries(
          stage,
          async function (items) {
            let obj = {};
            obj._id = items._id
            obj.name = items.name
            obj.stageNo = items.stageNo
            if (items._id.toString() == currGame.stageId.toString()) {
              obj.locked = false
              obj.progress = currGame.progress
            } else {
              obj.locked = true
              obj.progress = 0
            }
            arr.push(obj);
          },
          function () {
            return res.success({ game, progress: currGame.progress, stage: arr }, `Game and Stage get successfully`);
          }
        );
      }
    } catch (error) {
      console.log(error)
      res.next(error)
    }

  }

  async getLevel(req, res, next) {
    try {
      console.log('------getLevel-------')
      let { stageId, width, heigth } = req.body
      console.log("----------width", width)
      console.log("----------heigth", heigth)
      let stage = await Stage.find({ _id: stageId })
      let userGame = await UserGame.findOne({ stageId: stageId, userId: req._id }).populate({ path: 'levelId', model: Level, select: 'levelNo' })
      let currentGame = await CurrentGame.findOne({ userId: req._id }).populate({ path: 'gameId', model: Game })
      console.log("-----------usergame", userGame)
      currentGame.stageId = stageId;
      await currentGame.save();
      console.log("-----------currentGame", currentGame)

      if (userGame) {
        console.log("-------------if")
        if (userGame.isCompleted) {

          console.log("-------------if-------if--completed")
          console.log("-------------if-------if--completed----levelNo", userGame.levelId.levelNo)
          if (userGame.levelId.levelNo == 660) {
            return res.warn({}, `Congratulations!, you completed all stages and levels.play next game`);
          }

          let pattern = await Level.findOne({ stageId: stageId, levelNo: ++userGame.levelId.levelNo })

          userGame.levelId = pattern._id
          userGame.isCompleted = false
          await userGame.save();
          let coordinates = getCoordinates(width, heigth, pattern.verteces)
          console.log("-----------coordinates", coordinates)

          console.log("--------usergane", userGame)
          console.log("--------usergane", currentGame.progress)
          return res.success({ pattern, stage, game: currentGame, coordinates }, `Level get successfully`);
        } else {
          console.log("-------------if-------else--completed")
          console.log("--------usergane", currentGame.progress)

          let pattern = await Level.findOne({ stageId: stageId, levelNo: userGame.levelId.levelNo })
          let coordinates = getCoordinates(width, heigth, pattern.verteces)
          console.log("-----------coordinates", coordinates)

          return res.success({ pattern, stage, game: currentGame, coordinates }, `Level get successfully`);
        }
      } else {
        console.log("-------------else")


        let level = await Level.findOne({ stageId: stageId, levelNo: 1 })
        let usergame = new UserGame({
          stageId: stageId,
          userId: req._id,
          levelId: level._id
        })
        await usergame.save();
        let pattern = await Level.findOne({ stageId: stageId, levelNo: level.levelNo })
        // console.log("-----------coordinates", coordinates)

        let coordinates = getCoordinates(width, heigth, pattern.verteces)

        return res.success({ pattern, stage, game: currentGame, coordinates }, `Level get successfully`);
      }
    } catch (error) {
      console.log(error)
      res.next(error)
    }

  }

  async gameResult(req, res, next) {
    try {
      let getReward = false
      let getRewardAmt = 0
      let passedLevel = 0

      let userGame = await UserGame.findOne({ userId: req._id }).populate({ path: 'stageId', model: Stage }).populate({ path: 'levelId', model: Level })
      let findWallet = await UserWallet.findOne({ userId: req._id });
      let currentGame = await CurrentGame.findOne({ userId: req._id })
      if (userGame) {
        let stageNo = Number(userGame.stageId.stageNo)
        let levelNo = Number(userGame.levelId.levelNo)
        passedLevel = levelNo

        let levrage = levelNo / stageNo
        if (levelNo == 5) {
          let level5 = await UserRewardActivity.findOne({ userId: req._id, slug: "5_GAME_LEVEL" }).populate({ path: 'rewardId', model: Reward })
          console.log("---------level5", level5)
          if (!level5.status) {
            let userEarn = new UserEarning();
            userEarn.userId = req._id;
            userEarn.greeting = `Congratulations!! You have received $${level5.rewardId.reward} for ${level5.rewardId.title}`;
            userEarn.amount = `+$${level5.rewardId.reward}`;
            userEarn.type = level5.rewardId._id;
            await userEarn.save();
            // add amount after assign reward
            if (findWallet) {
              findWallet.currentBalance += level5.rewardId.reward;
              await findWallet.save();
            }
            level5.status = true
            await level5.save();
            getReward = true
            getRewardAmt = level5.rewardId.reward
          }
        }
        if (levelNo == 25) {
          let level25 = await UserRewardActivity.findOne({ userId: req._id, slug: "25_GAME_LEVEL" }).populate({ path: 'rewardId', model: Reward })
          if (!level25.status) {
            let userEarn = new UserEarning();
            userEarn.userId = req._id;
            userEarn.greeting = `Congratulations!! You have received $${level25.rewardId.reward} for ${level25.rewardId.title}`;
            userEarn.amount = `+$${level25.rewardId.reward}`;
            userEarn.type = level25.rewardId._id;
            await userEarn.save();
            // add amount after assign reward
            if (findWallet) {
              findWallet.currentBalance += level25.rewardId.reward;
              await findWallet.save();
            }
            level25.status = true
            await level25.save();
            getReward = true
            getRewardAmt = level25.rewardId.reward
          }
        }
        if (levelNo == 55) {
          let level55 = await UserRewardActivity.findOne({ userId: req._id, slug: "55_GAME_LEVEL" }).populate({ path: 'rewardId', model: Reward })
          if (!level55.status) {
            let userEarn = new UserEarning();
            userEarn.userId = req._id;
            userEarn.greeting = `Congratulations!! You have received $${level55.rewardId.reward} for ${level55.rewardId.title}`;
            userEarn.amount = `+$${level55.rewardId.reward}`;
            userEarn.type = level55.rewardId._id;
            await userEarn.save();
            // add amount after assign reward
            if (findWallet) {
              findWallet.currentBalance += level55.rewardId.reward;
              await findWallet.save();
            }
            level55.status = true
            await level55.save();
            getReward = true
            getRewardAmt = level55.rewardId.reward
          }
        }
        if (levelNo == 100) {
          let level100 = await UserRewardActivity.findOne({ userId: req._id, slug: "100_GAME_LEVEL" }).populate({ path: 'rewardId', model: Reward })
          if (!level100.status) {
            let userEarn = new UserEarning();
            userEarn.userId = req._id;
            userEarn.greeting = `Congratulations!! You have received $${level100.rewardId.reward} for ${level100.rewardId.title}`;
            userEarn.amount = `+$${level100.rewardId.reward}`;
            userEarn.type = level100.rewardId._id;
            await userEarn.save();
            // add amount after assign reward
            if (findWallet) {
              findWallet.currentBalance += level100.rewardId.reward;
              await findWallet.save();
            }
            level100.status = true
            await level100.save();
            getReward = true
            getRewardAmt = level100.rewardId.reward
          }
        }
        if (levelNo == 155) {
          let level155 = await UserRewardActivity.findOne({ userId: req._id, slug: "155_GAME_LEVEL" }).populate({ path: 'rewardId', model: Reward })
          if (!level155.status) {
            let userEarn = new UserEarning();
            userEarn.userId = req._id;
            userEarn.greeting = `Congratulations!! You have received $${level155.rewardId.reward} for ${level155.rewardId.title}`;
            userEarn.amount = `+$${level155.rewardId.reward}`;
            userEarn.type = level155.rewardId._id;
            await userEarn.save();
            // add amount after assign reward
            if (findWallet) {
              findWallet.currentBalance += level155.rewardId.reward;
              await findWallet.save();
            }
            level155.status = true
            await level155.save();
            getReward = true
            getRewardAmt = level155.rewardId.reward
          }
        }
        if (levelNo == 195) {
          let level195 = await UserRewardActivity.findOne({ userId: req._id, slug: "195_GAME_LEVEL" }).populate({ path: 'rewardId', model: Reward })
          if (!level195.status) {
            let userEarn = new UserEarning();
            userEarn.userId = req._id;
            userEarn.greeting = `Congratulations!! You have received $${level195.rewardId.reward} for ${level195.rewardId.title}`;
            userEarn.amount = `+$${level195.rewardId.reward}`;
            userEarn.type = level195.rewardId._id;
            await userEarn.save();
            // add amount after assign reward
            if (findWallet) {
              findWallet.currentBalance += level195.rewardId.reward;
              await findWallet.save();
            }
            level195.status = true
            await level195.save();
            getReward = true
            getRewardAmt = level195.rewardId.reward
          }
        }
        if (levelNo == 255) {
          let level255 = await UserRewardActivity.findOne({ userId: req._id, slug: "255_GAME_LEVEL" }).populate({ path: 'rewardId', model: Reward })
          if (!level255.status) {
            let userEarn = new UserEarning();
            userEarn.userId = req._id;
            userEarn.greeting = `Congratulations!! You have received $${level255.rewardId.reward} for ${level255.rewardId.title}`;
            userEarn.amount = `+$${level255.rewardId.reward}`;
            userEarn.type = level255.rewardId._id;
            await userEarn.save();
            // add amount after assign reward
            if (findWallet) {
              findWallet.currentBalance += level255.rewardId.reward;
              await findWallet.save();
            }
            level255.status = true
            await level255.save();
            getReward = true
            getRewardAmt = level255.rewardId.reward
          }
        }
        if (levelNo == 290) {
          let level290 = await UserRewardActivity.findOne({ userId: req._id, slug: "290_GAME_LEVEL" }).populate({ path: 'rewardId', model: Reward })
          if (!level290.status) {
            let userEarn = new UserEarning();
            userEarn.userId = req._id;
            userEarn.greeting = `Congratulations!! You have received $${level290.rewardId.reward} for ${level290.rewardId.title}`;
            userEarn.amount = `+$${level290.rewardId.reward}`;
            userEarn.type = level290.rewardId._id;
            await userEarn.save();
            // add amount after assign reward
            if (findWallet) {
              findWallet.currentBalance += level290.rewardId.reward;
              await findWallet.save();
            }
            level290.status = true
            await level290.save();
            getReward = true
            getRewardAmt = level290.rewardId.reward
          }
        }
        if (levelNo == 345) {
          let level345 = await UserRewardActivity.findOne({ userId: req._id, slug: "345_GAME_LEVEL" }).populate({ path: 'rewardId', model: Reward })
          if (!level345.status) {
            let userEarn = new UserEarning();
            userEarn.userId = req._id;
            userEarn.greeting = `Congratulations!! You have received $${level345.rewardId.reward} for ${level345.rewardId.title}`;
            userEarn.amount = `+$${level345.rewardId.reward}`;
            userEarn.type = level345.rewardId._id;
            await userEarn.save();
            // add amount after assign reward
            if (findWallet) {
              findWallet.currentBalance += level345.rewardId.reward;
              await findWallet.save();
            }
            level345.status = true
            await level345.save();
            getReward = true
            getRewardAmt = level345.rewardId.reward
          }
        }
        if (levelNo == 385) {
          let level385 = await UserRewardActivity.findOne({ userId: req._id, slug: "385_GAME_LEVEL" }).populate({ path: 'rewardId', model: Reward })
          if (!level385.status) {
            let userEarn = new UserEarning();
            userEarn.userId = req._id;
            userEarn.greeting = `Congratulations!! You have received $${level385.rewardId.reward} for ${level385.rewardId.title}`;
            userEarn.amount = `+$${level385.rewardId.reward}`;
            userEarn.type = level385.rewardId._id;
            await userEarn.save();
            // add amount after assign reward
            if (findWallet) {
              findWallet.currentBalance += level385.rewardId.reward;
              await findWallet.save();
            }
            level385.status = true
            await level385.save();
            getReward = true
            getRewardAmt = level385.rewardId.reward
          }
        }
        if (levelNo == 440) {
          let level440 = await UserRewardActivity.findOne({ userId: req._id, slug: "440_GAME_LEVEL" }).populate({ path: 'rewardId', model: Reward })
          if (!level440.status) {
            let userEarn = new UserEarning();
            userEarn.userId = req._id;
            userEarn.greeting = `Congratulations!! You have received $${level440.rewardId.reward} for ${level440.rewardId.title}`;
            userEarn.amount = `+$${level440.rewardId.reward}`;
            userEarn.type = level440.rewardId._id;
            await userEarn.save();
            // add amount after assign reward
            if (findWallet) {
              findWallet.currentBalance += level440.rewardId.reward;
              await findWallet.save();
            }
            level440.status = true
            await level440.save();
            getReward = true
            getRewardAmt = level440.rewardId.reward
          }
        }
        if (levelNo == 480) {
          let level480 = await UserRewardActivity.findOne({ userId: req._id, slug: "480_GAME_LEVEL" }).populate({ path: 'rewardId', model: Reward })
          if (!level480.status) {
            let userEarn = new UserEarning();
            userEarn.userId = req._id;
            userEarn.greeting = `Congratulations!! You have received $${level480.rewardId.reward} for ${level480.rewardId.title}`;
            userEarn.amount = `+$${level480.rewardId.reward}`;
            userEarn.type = level480.rewardId._id;
            await userEarn.save();
            // add amount after assign reward
            if (findWallet) {
              findWallet.currentBalance += level480.rewardId.reward;
              await findWallet.save();
            }
            level480.status = true
            await level480.save();
            getReward = true
            getRewardAmt = level480.rewardId.reward
          }
        }
        if (levelNo == 535) {
          let level535 = await UserRewardActivity.findOne({ userId: req._id, slug: "535_GAME_LEVEL" }).populate({ path: 'rewardId', model: Reward })
          if (!level535.status) {
            let userEarn = new UserEarning();
            userEarn.userId = req._id;
            userEarn.greeting = `Congratulations!! You have received $${level535.rewardId.reward} for ${level535.rewardId.title}`;
            userEarn.amount = `+$${level535.rewardId.reward}`;
            userEarn.type = level535.rewardId._id;
            await userEarn.save();
            // add amount after assign reward
            if (findWallet) {
              findWallet.currentBalance += level535.rewardId.reward;
              await findWallet.save();
            }
            level535.status = true
            await level535.save();
            getReward = true
            getRewardAmt = level535.rewardId.reward
          }
        }
        if (levelNo == 575) {
          let level575 = await UserRewardActivity.findOne({ userId: req._id, slug: "575_GAME_LEVEL" }).populate({ path: 'rewardId', model: Reward })
          if (!level575.status) {
            let userEarn = new UserEarning();
            userEarn.userId = req._id;
            userEarn.greeting = `Congratulations!! You have received $${level575.rewardId.reward} for ${level575.rewardId.title}`;
            userEarn.amount = `+$${level575.rewardId.reward}`;
            userEarn.type = level575.rewardId._id;
            await userEarn.save();
            // add amount after assign reward
            if (findWallet) {
              findWallet.currentBalance += level575.rewardId.reward;
              await findWallet.save();
            }
            level575.status = true
            await level575.save();
            getReward = true
            getRewardAmt = level575.rewardId.reward
          }
        }
        if (levelNo == 615) {
          let level615 = await UserRewardActivity.findOne({ userId: req._id, slug: "615_GAME_LEVEL" }).populate({ path: 'rewardId', model: Reward })
          if (!level615.status) {
            let userEarn = new UserEarning();
            userEarn.userId = req._id;
            userEarn.greeting = `Congratulations!! You have received $${level615.rewardId.reward} for ${level615.rewardId.title}`;
            userEarn.amount = `+$${level615.rewardId.reward}`;
            userEarn.type = level615.rewardId._id;
            await userEarn.save();
            // add amount after assign reward
            if (findWallet) {
              findWallet.currentBalance += level615.rewardId.reward;
              await findWallet.save();
            }
            level615.status = true
            await level615.save();
            getReward = true
            getRewardAmt = level615.rewardId.reward
          }
        }
        if (levelNo == 660) {
          let level660 = await UserRewardActivity.findOne({ userId: req._id, slug: "660_GAME_LEVEL" }).populate({ path: 'rewardId', model: Reward })
          if (!level660.status) {
            let userEarn = new UserEarning();
            userEarn.userId = req._id;
            userEarn.greeting = `Congratulations!! You have received $${level660.rewardId.reward} for ${level660.rewardId.title}`;
            userEarn.amount = `+$${level660.rewardId.reward}`;
            userEarn.type = level660.rewardId._id;
            await userEarn.save();
            // add amount after assign reward
            if (findWallet) {
              findWallet.currentBalance += level660.rewardId.reward;
              await findWallet.save();
            }
            level660.status = true
            await level660.save();
            getReward = true
            getRewardAmt = level660.rewardId.reward
          }
        }

        if (levrage == 55) {
          console.log(">>>>>>>>>>>>>>>>>>>>>>>>")
          if (levelNo == 660) {
            userGame.isCompleted = true
            await userGame.save();
            return res.success({ stage: userGame.stageId._id, getReward, getRewardAmt, passedLevel }, `Level completed`);

          } else {
            let stage = await Stage.findOne({ stageNo: ++stageNo });
            let pattern = await Level.findOne({ stageId: stage._id, levelNo: ++levelNo })
            userGame.stageId = stage._id
            userGame.levelId = pattern._id
            userGame.isCompleted = false

            await userGame.save();
            currentGame.progress = 0;
            currentGame.stageId = stage._id;
            await currentGame.save();
            console.log("-------->>currentGame", currentGame)
            console.log("-------->>userGame", userGame)
            return res.success({ stage: stage._id, getReward, getRewardAmt, passedLevel }, `Level completed`);
          }

        } else {
          console.log("<<<<<<<<<<<<<<<<<<<<<<<")

          currentGame.progress = Math.round(((levelNo - (stageNo - 1) * 55) / 55) * 100);
          // currentGame.progress+=2;
          await currentGame.save();
          // let pattern = await Level.findOne({ stageId: userGame.stageId._id, levelNo: ++levelNo })
          userGame.isCompleted = true
          await userGame.save();
          return res.success({ stage: userGame.stageId._id, getReward, getRewardAmt, passedLevel }, `Level completed`);
        }
      }

    } catch (error) {
      console.log(error)
      res.next(error)
    }
  }

  async levelDetails(req, res, next) {
    try {

      let currentGame = await CurrentGame.findOne({ userId: req._id })
      if (currentGame) {
        let arr = []

        let game = await Game.findOne({ _id: currentGame.gameId, isSuspended: false, isDeleted: false })
        let stage = await Stage.find({})
        async.mapSeries(
          stage,
          async function (items) {
            let obj = {};
            obj._id = items._id
            obj.name = items.name
            obj.stageNo = items.stageNo
            if (items._id.toString() == currentGame.stageId.toString()) {
              obj.locked = false
              obj.progress = currentGame.progress
            } else {
              obj.locked = true
              obj.progress = 0
            }
            arr.push(obj);
          },
          function () {
            return res.success({ game, progress: currentGame.progress, stage: arr }, `Game and Stage get successfully`);
          }
        );

      } else {
        return res.notFound({}, `Firstly, you need to play the game then you will be able to view the level.`);

      }



    } catch (error) {
      console.log(error)
      res.next(error)

    }
  }

  async gameHint(req, res, next) {
    try {

      let gameHint = await GameHint.find({ isSuspended: false, isDeleted: false })
      let hintVideo = await GameHintVideo.find({ isSuspended: false, isDeleted: false }).lean();
      let video = `${process.env.AWS_BASE_URL}${hintVideo[0].video}`

      if (gameHint.length > 0) {
        return res.success({ gameHint, video }, `Game hints get successfully`)
      } else {
        return res.notFound({}, `Game hints not found`);
      }

    } catch (error) {
      console.log(error)
      res.next(error)

    }

  }

  async notificationList(req, res, next) {
    try {
      console.log("--------------------notificationList------------------------")

      // let skip = req.query.skip;
      // let pageSize = 5;
      // let skipedData = (skip - 1) * pageSize


      let notification = await Notification.find({ receivedId: req.user._id, isDeleted: false }).sort({ created: -1 })
        .populate({ path: "senderId", select: "image name", model: User })
        .populate({ path: "receivedId", select: "image name", model: User });
      if (notification.length > 0) {

        notification.map(async value => {
          value.read = true
          await value.save()
        })

        return res.success({ notification }, `notification list get successfully`);
      } else {
        return res.notFound({ notification: [] }, `notification list not found`);

      }

    } catch (error) {
      console.log(error)
      res.next(error)

    }
  }

  async clearNotification(req, res, next) {
    try {
      console.log("--------------------clearNotification------------------------")
      let notification = await Notification.updateMany({ receivedId: req.user._id, isDeleted: false }, { $set: { isDeleted: true } }, { multi: true })

      console.log("--------------------notification------------------------", notification)

      if (notification.nModified > 0) {
        return res.success({}, `Notifications cleared`);
      } else {
        return res.notFound({}, `No more notifications to clear`);

      }


    } catch (error) {
      console.log(error)
      res.next(error)

    }
  }

  async Test(req, res, next) {
    try {
      // let sound = new Sound()
      // let form = new multiparty.Form()
      // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
      // form.parse(req, async function (err, fields, files) {
      //   let fileupload = files.audio[0]
      //   _.forOwn(fields, (field, key) => {
      //     sound[key] = field[0]
      //   })
      //   try {
      //     let image = await uploadImageAPI(fileupload, 'Sound')
      //     console.log(image)
      //     // await unlinkAsync(file.path);
      //     sound['audio'] = image.Key
      //     let savePost = await sound.save()
      //     return res.success({ savePost }, 'sound created successfully')
      //   } catch (err) {
      //     return res.next(err)
      //   }
      // })
      let lno = 606
      while (lno <= 660) {
        let level = new Level({
          stageId: "63bd538adf8a733860af0c81",
          levelNo: lno,
          verteces: 4
        })
        await level.save()
        lno++
      }
      return res.success({}, 'level created successfully')

    } catch (err) {
      console.log(err)
      return next(err)
    }
  }

  async planStrip(req, res, next) {
    try {
      let { stripeToken, amount, month, planId } = req.body
      console.log('-----payment-----')
      stripe.customers.create({
        email: req.user.email,
        source: stripeToken,
        name: req.user.name
      })
        .then(async (customer) => {
          console.log('-----customer-----', customer)
          let AMOUNT = (amount) * 100;
          return stripe.charges.create({
            amount: AMOUNT,
            description: `Plan purchase`,
            currency: 'USD',
            customer: customer.id
          });
        })
        .then(async (charge) => {
          console.log('------charge------', charge)
          let payment = new UserPaymentDetail();
          payment.userId = req._id;
          payment.planId = planId;
          payment.amount = amount;
          payment.month = month;
          await payment.save();

          return res.success({ payment }, 'Plan purchase successfully')// If no error occurs
        })
        .catch((err) => {
          console.log(err)
          return res.warn({}, 'Payment error')
          //res.send(err)       // If some error occurs
        });
    } catch (err) {
      console.log(err)
      return next(err)
    }
  }

}
function getzodiacsign(dob) {
  console.log("-------------getzodiacsign-----------")
  let newDate_ = new Date(dob)
  console.log('-------newDate---', newDate_)
  let month = newDate_.getMonth() + 1
  let day = newDate_.getDate()

  let astro_sign = "NONE";
  if (month == 12) {

    if (day < 22)
      astro_sign = "SAGITTARIUS";
    else
      astro_sign = "CAPRICON";
  } else if (month == 1) {
    if (day < 20)
      astro_sign = "CAPRICON";
    else
      astro_sign = "AQUARIUS";
  } else if (month == 2) {
    if (day < 19)
      astro_sign = "AQUARIUS";
    else
      astro_sign = "PISCES";
  } else if (month == 3) {
    if (day < 21)
      astro_sign = "PISCES";
    else
      astro_sign = "ARIES";
  } else if (month == 4) {
    if (day < 20)
      astro_sign = "ARIES";
    else
      astro_sign = "TAURUS";
  } else if (month == 5) {
    if (day < 21)
      astro_sign = "TAURUS";
    else
      astro_sign = "GEMINI";
  } else if (month == 6) {
    if (day < 21)
      astro_sign = "GEMINI";
    else
      astro_sign = "CANCER";
  } else if (month == 7) {
    if (day < 23)
      astro_sign = "CANCER";
    else
      astro_sign = "LEO";
  } else if (month == 8) {
    if (day < 23)
      astro_sign = "LEO";
    else
      astro_sign = "VIRGO";
  } else if (month == 9) {
    if (day < 23)
      astro_sign = "VIRGO";
    else
      astro_sign = "LIBRA";
  } else if (month == 10) {
    if (day < 23)
      astro_sign = "LIBRA";
    else
      astro_sign = "SCORPIO";
  } else if (month == 11) {
    if (day < 22)
      astro_sign = "SCORPIO";
    else
      astro_sign = "SAGITTARIUS";
  }
  console.log("-------------astro_sign-----------", astro_sign)


  return astro_sign;

}

function getCoordinates(width, heigth, verteces) {
  let w = width - 50
  let h = heigth - 50
  let coordinates = []
  let x = []
  let y = []
  let start = true
  while (start) {
    console.log("sucess")
    let x_ = Math.floor(Math.random() * (w - 50) + 50)
    let y_ = Math.floor(Math.random() * (h - 50) + 50)
    console.log(x_, y_)
    let x_avl = x.includes(x_)
    let y_avl = y.includes(y_)
    console.log(x_avl, y_avl)
    if (x_avl || y_avl) {
      console.log("get")
      continue;
    } else {
      let xF = false
      let yF = false
      if (x.length != 0 && y.length != 0) {
        let xMin = x_ - 10
        let xMax = x_ + 10
        let yMin = y_ - 10
        let yMax = y_ + 10
        x.map(val => {
          if (val >= xMin && val <= xMax) {
            xF = true
          }
        })
        y.map(val => {
          if (val >= yMin && val <= yMax) {
            yF = true
          }
        })
      }
      console.log("-r-", xF, yF)

      if (xF || yF) {
        console.log("found")
        continue;
      } else {

        x.push(x_)
        y.push(y_)
      }
    }
    if (x.length == verteces && y.length == verteces) {

      start = false
      for (let i = 0; i < verteces; i++) {
        let obj = {}
        obj._id = uuid.v4()
        obj.x = x[i]
        obj.y = y[i]
        coordinates.push(obj)
      }
    }
  }
  return coordinates
}



module.exports = new UserController();
