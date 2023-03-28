const express = require("express");
const router = express.Router();
const EducationController = require("./EducationController");
const {verifyToken} = require('../../../util/auth');
const validations = require("./EducationValidations");
const { validate } = require("../../../util/validations.js");
router.get("/", verifyToken,EducationController.listPage);
router.get("/list", verifyToken,EducationController.list);
router.get("/add", verifyToken,EducationController.add);
router.post("/save", verifyToken,EducationController.save);
router.get("/view/:id", validate(validations.requireId, "params", {}, "/education"), verifyToken,EducationController.view);
router.get("/edit/:id",validate(validations.requireId, "params", {}, "/education"),verifyToken,EducationController.edit);
router.post("/update/:id",validate(validations.requireId, "params", {}, "/education"),verifyToken,EducationController.updateData);
router.get("/update-status",validate(validations.updateStatus, "query", {}, "/education"),verifyToken,EducationController.updateStatus);
router.get("/delete/:id",validate(validations.requireId, "params", {}, "/education"),verifyToken,EducationController.delete);
module.exports = router;