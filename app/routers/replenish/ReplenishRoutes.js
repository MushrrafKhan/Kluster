const express = require("express");
const router = express.Router();
const ReplenishController = require("./ReplenishController");
const {verifyToken} = require('../../../util/auth');
const validations = require("./ReplenishValidations");
const { validate } = require("../../../util/validations.js");


// replenish
router.get("/currencyReplenish", verifyToken,ReplenishController.currencyReplenish);
router.get("/replenishEdit",verifyToken,ReplenishController.replenishEdit);
router.post("/updateReplenishEdit",verifyToken,ReplenishController.updateReplenishEdit);



// super like
router.get("/superLike", verifyToken,ReplenishController.superLike);
router.get("/superLikeEdit/:id",validate(validations.requireId, "params", {}, "/replenish"),verifyToken,ReplenishController.superLikeEdit);
router.post("/updateSuperLike/:id",validate(validations.requireId, "params", {}, "/replenish"),verifyToken,ReplenishController.updateSuperLike);






module.exports = router;