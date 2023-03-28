const express = require("express");
const router = express.Router();
const RewardController = require("./RewardController");
const { verifyToken } = require('../../../util/auth');
const validations = require("./RewardValidations");
const { validate } = require("../../../util/validations.js");
router.get("/", verifyToken, RewardController.listPage);
router.get("/list", verifyToken, RewardController.list);
router.get("/view/:id", validate(validations.requireId, "params", {}, "/reward"), verifyToken, RewardController.view);
router.get("/edit/:id", validate(validations.requireId, "params", {}, "/reward"), verifyToken, RewardController.edit);

router.post("/update/:id", validate(validations.requireId, "params", {}, "/reward"), verifyToken, RewardController.updateData);


// router.get("/update-status", validate(validations.updateStatus, "query", {}, "/reward"), verifyToken, RewardController.updateStatus);



module.exports = router;   