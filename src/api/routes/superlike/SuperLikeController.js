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
    Country,
    Reward,
    UserActivity,
    UserWallet,
    UserEarning,
    SuperLikeProfile,
    CurrencyActionsReplenish,
  },
} = require("../../../../app/models");

const mongoose = require("mongoose");
const async = require("async");
const moment = require("moment");

class SuperLikeController {
  

  async superLikeReplenishItems(req, res, next) {
    try {
      let superLikeReplenishItems = await CurrencyActionsReplenish.find(
        {
          name: "Super Like",
        },
        { name: 1, value: 1, price: 1 }
      );

      if (superLikeReplenishItems) {
        return res.success(
          { superLikeReplenishItems },
          "Super like replenish list"
        );
      } else {
        return res.notFound({}, "Super like replenish list not found");
      }
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  async purchaseSuperLike(req, res, next) {
    let { id } = req.body;
    try {
      let wallet = await UserWallet.findOne({
        userId: req.user._id,
      });

      let superLike = await CurrencyActionsReplenish.findOne({
        _id: id,
        name: "Super Like",
      });

      if (wallet.currentBalance >= superLike.price) {
        let findUserActivity = await UserActivity.findOne({ userId: req._id });

        findUserActivity.superLikeCount =
          Number(findUserActivity.superLikeCount) + Number(superLike.value);
        let sav_ = await findUserActivity.save();
        if (sav_) {
          wallet.currentBalance = wallet.currentBalance - superLike.price;
          await wallet.save();
          let earnings = new UserEarning({
            userId: req._id,
            greeting: `You purchase ${superLike.value} ${superLike.name}`,
            amount: `-$${superLike.price}`,
            type: superLike._id,
            imageType: true,
          });
          await earnings.save();
          return res.success({}, "Super like purchase successfully");
        }
      } else {
        return res.warn({}, "Insufficiant wallet");
      }
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  async receviedSuperLikes(req, res, next) {
    try {
      let receviedSuperLikes = await SuperLikeProfile.find({ receivedId: req._id }).populate({ path: 'likedById', select: 'name image', model: User })
      if (receviedSuperLikes.length > 0) {
        return res.success({ receviedSuperLikes }, "Received super likes")
      } else {
        return res.notFound({}, "You have no received super likes yet")
      }
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
}

module.exports = new SuperLikeController();
