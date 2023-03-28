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
} = require('../../../../app/models')

const mongoose = require('mongoose')
const async = require('async')
const moment = require('moment')

class ReplenishmentController {
  async replenishmentItems(req, res, next) {
    try {
      let findPlan = await UserPlan.findOne({ userId: req._id, isActive: true })
      let plan = await Plans.findOne({ _id: findPlan.plansId })
      let query={ planId: findPlan.plansId }

      if (plan.type=='FREE'){
        query.$and=[{name:{$ne:'Saski'}},{name:{$ne:'Romantik'}}]
      }

        if (findPlan) {
          let replenishItems = await CurrencyActionsReplenish.find(
            query,
            { name: 1, value: 1, price: 1 },
            
          )
          return res.success({ replenishItems }, 'Replenis items fetch success')
        } else {
          return res.notFound(
            {},
            'You have no active plan please upgrade your plan',
          )
        }
    } catch (error) {
      console.log(error)
      return next(error)
    }
  }

  async selectReplenish(req, res, next) {
    let { replenishItemsId } = req.body
    try {
      let selectedItems = []
      var findPlan = await UserPlan.findOne({
        userId: req._id,
        isActive: true,
      }).populate({ path: 'plansId', model: Plans })

      if (replenishItemsId.length > 0) {
        async.mapSeries(
          replenishItemsId,
          async function (replenishItems) {
            let obj = {}

            let findItems = await CurrencyActionsReplenish.findOne({
              _id: replenishItems,
            })
            if (findItems) {
              obj.name = findItems.name
              obj.value = findItems.value
              obj.price = findItems.price
              obj._id = findItems._id
            }
            selectedItems.push(obj)
          },
          async function () {
            let total = 0
            for (let i = 0; i < selectedItems.length; i++) {
              total = total + selectedItems[i].price
            }

            return res.success(
              {
                selectedItems,
                total,
                planImage: findPlan ? findPlan.plansId.image : '',
                planName: findPlan ? findPlan.plansId.name : '',
              },
              'Your selected items',
            )
          },
        )
      } else {
        return res.warn({}, 'Please select items first')
      }
    } catch (error) {
      console.log(error)
      return next(error)
    }
  }

  async purchaseReplenishItems(req, res, next) {
    let { replenishItemsId, total } = req.body
    try {
      // let findUserActivity = await UserActivity.findOne({ userId: req._id })
      let userWallet = await UserWallet.findOne({ userId: req._id });
      let balance = userWallet.currentBalance

      if (balance < total) {
        return res.warn({}, 'You have insufficient wallet')
      }

      replenishItemsId.map(async (replenishItems) => {

        let findItemsDetails = await CurrencyActionsReplenish.findOne({
          _id: replenishItems,
        })

        let findUserActivity = await UserActivity.findOne({ userId: req._id })

        if (findItemsDetails && findItemsDetails.name == 'Teken') {  // teken like

          findUserActivity.likeCount = Number(findUserActivity.likeCount) + Number(findItemsDetails.value)
          findUserActivity.likeEndTime = '0'

          let earnings = new UserEarning({
            userId: req._id,
            greeting: `You purchase ${findItemsDetails.value} ${findItemsDetails.name}`,
            amount: `-$${findItemsDetails.price}`,
            type: findItemsDetails._id,
            imageType: true
          })
          await earnings.save()
        }
        else if (findItemsDetails && findItemsDetails.name == 'Koi') {  // koi love

          findUserActivity.loveCount = Number(findUserActivity.loveCount) + Number(findItemsDetails.value)
          findUserActivity.loveEndTime = '0'

          let earnings = new UserEarning({
            userId: req._id,
            greeting: `You purchase ${findItemsDetails.value} ${findItemsDetails.name}`,
            amount: `-$${findItemsDetails.price}`,
            type: findItemsDetails._id,
            imageType: true
          })
          await earnings.save()

        }
        else if (findItemsDetails && findItemsDetails.name == 'Kori') { // kori hold

          findUserActivity.holdCount = Number(findUserActivity.holdCount) + Number(findItemsDetails.value)
          findUserActivity.holdEndTime = '0'
          let earnings = new UserEarning({
            userId: req._id,
            greeting: `You purchase ${findItemsDetails.value} ${findItemsDetails.name}`,
            amount: `-${findItemsDetails.price}`,
            type: findItemsDetails._id,
            imageType: true
          })
          await earnings.save()
        }
        else if (findItemsDetails && findItemsDetails.name == 'Saski') { // saski lock

          let lockArray = findUserActivity.lockCount.split(" ")
          let lock_ = Number(lockArray[0]) + Number(findItemsDetails.value)

          findUserActivity.lockCount = `${lock_} HRS`
          findUserActivity.lockEndTime = '0'
          let earnings = new UserEarning({
            userId: req._id,
            greeting: `You purchase ${findItemsDetails.value} HRS ${findItemsDetails.name}`,
            amount: `-$${findItemsDetails.price}`,
            type: findItemsDetails._id,
            imageType: true
          })
          await earnings.save()
        }
        else if (findItemsDetails && findItemsDetails.name == 'Romantik') {

          findUserActivity.romantikCount = Number(findUserActivity.romantikCount) + Number(findItemsDetails.value)
          findUserActivity.sentRomantik = '0'
          findUserActivity.romantikEndTime = '0'
          let earnings = new UserEarning({
            userId: req._id,
            greeting: `You purchase ${findItemsDetails.value} ${findItemsDetails.name}`,
            amount: `-${findItemsDetails.price}`,
            type: findItemsDetails._id,
            imageType: true
          })
          await earnings.save()
        }
        else if (findItemsDetails && findItemsDetails.name == 'Messages') {

          findUserActivity.messageCount = Number(findUserActivity.messageCount) + Number(findItemsDetails.value)
          findUserActivity.messageEndTime = '0'
          let earnings = new UserEarning({
            userId: req._id,
            greeting: `You purchase ${findItemsDetails.value} ${findItemsDetails.name}`,
            amount: `-$${findItemsDetails.price}`,
            type: findItemsDetails._id,
            imageType: true
          })
          await earnings.save()
        }
        await findUserActivity.save()
      })

      userWallet.currentBalance -= total;
      await userWallet.save()



      return res.success({}, 'Replenishment successfully')
    } catch (error) {
      console.log(error)
      return next(error)
    }
  }
}

module.exports = new ReplenishmentController()
