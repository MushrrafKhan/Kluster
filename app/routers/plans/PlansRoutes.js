const express = require("express");
const router = express.Router();
const PlansController = require("./PlansController");
const {verifyToken} = require('../../../util/auth');
const validations = require("./PlansValidations");
const { validate } = require("../../../util/validations.js");
router.get("/", verifyToken,PlansController.listPage);
router.get("/list", verifyToken,PlansController.list);

router.get("/view/:id", validate(validations.requireId, "params", {}, "/plans"), verifyToken,PlansController.view);
// router.get("/update-status",validate(validations.updateStatus, "query", {}, "/plans"),verifyToken,PlansController.updateStatus);
router.get("/edit/:id",validate(validations.requireId, "params", {}, "/plans"),verifyToken,PlansController.edit);
router.post("/update/:id",validate(validations.requireId, "params", {}, "/plans"),verifyToken,PlansController.updateData);





router.post("/save",PlansController.save);
module.exports = router;