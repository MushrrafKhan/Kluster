const {
  models: { Plans, CurrencyActionsReplenish },
} = require("../../models");
const multer = require('multer');
const multiparty = require('multiparty');
let _ = require('lodash')

const { showDate, uploadImageAPI, uploadS3, uploadImage } = require('../../../lib/util');
const fs = require('fs');
const {
  promisify
} = require('util');
const unlinkAsync = promisify(fs.unlink);
class PlansController {

  async currencyReplenish(req, res) {

    let plans = await Plans.find({ isSuspended: false });
    let teken = await CurrencyActionsReplenish.find({
      name: "Teken",
    })
    let koi = await CurrencyActionsReplenish.find({
      name: "Koi",
    })
    let kori = await CurrencyActionsReplenish.find({
      name: "Kori",
    })
    let saski = await CurrencyActionsReplenish.find({
      name: "Saski",
    })
    let romantik = await CurrencyActionsReplenish.find({
      name: "Romantik",
    })
    let messages = await CurrencyActionsReplenish.find({
      name: "Messages",
    })
    // console.log("-----------------teken",teken)
    return res.render("replenish/replenishView", {
      plans,
      teken, koi, saski, romantik, messages, kori,
    });

  }


  async replenishEdit(req, res) {
    let { price, name } = req.query

    // console.log("-----------------price,name", price, name)
    return res.render("replenish/replenishEdit", {
      price: price,
      name: name,
    });

  }

  async updateReplenishEdit(req, res) {
    let { name } = req.query
    let { price } = req.body

    let priceIn = Number(price)

    let teken = await CurrencyActionsReplenish.find({
      name: name,
    })

    // console.log("--------------teken", teken)
    // console.log("--------------price", typeof price)

    teken.map(async data => {
      data.price = priceIn
      let save_ = await data.save();

      console.log(">>>>>>>>>>>>>save_", save_);

    })

    res.redirect("/replenish/currencyReplenish")

  }

  async superLike(req, res) {

    let superLike = await CurrencyActionsReplenish.find({
      name: "Super Like",
    })

    // console.log("-----------------superLike", superLike)
    return res.render("replenish/superLikeView", {
      superLike,

    });

  }


  async superLikeEdit(req, res) {
    let _id = req.params.id;
    let superLike = await CurrencyActionsReplenish.findOne({
      _id: _id,
    });
    if (!superLike) {
      req.flash("error", req.__("Super Like is not exists"));
      return res.redirect("/superLike");
    }
    return res.render("replenish/superLikeEdit", {
      superLike: superLike,
      _id,
    });
  }

  async updateSuperLike(req, res) {
    let _id = req.params.id;
    let price = req.body.price;
    let superLike = await CurrencyActionsReplenish.findOne({
      _id: _id,
    });
    if (!superLike) {
      req.flash("error", req.__("Super Like is not exists"));
      return res.redirect("/replenish/superLike");
    }
    superLike.price = price
    await superLike.save();

    req.flash("success", req.__("Super Like Price Update SuccessFully"));

    return res.redirect("/replenish/superLike");

  }

}
module.exports = new PlansController();