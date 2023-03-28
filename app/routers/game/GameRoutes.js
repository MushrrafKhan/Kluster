const express = require("express");
const router = express.Router();
const GameController = require("./GameController");
const { verifyToken } = require('../../../util/auth');
const validations = require("./GameValidations");
const { validate } = require("../../../util/validations.js");

// ----------------Game ------------------------------------------------------------------------------------------------
router.get("/", verifyToken, GameController.listPage);
router.get("/list", verifyToken, GameController.list);
router.get("/edit/:id", validate(validations.requireId, "params", {}, "/game"), verifyToken, GameController.edit);
router.get("/view/:id", validate(validations.requireId, "params", {}, "/game"), verifyToken, GameController.view);
router.post("/update/:id", validate(validations.requireId, "params", {}, "/game"), verifyToken, GameController.updateData);

// ----------------stage ------------------------------------------------------------------------------------------------------
router.get("/stagePage", verifyToken, GameController.stagePage);
router.get("/stageList", verifyToken, GameController.stageList);

// ------------level----------------------------------------------------------------------------------------------------------------------------
router.get("/addLevel/:id", validate(validations.requireId, "params", {}, "/game"), verifyToken, GameController.addLevel);
router.get("/levelListPage/:id", validate(validations.requireId, "params", {}, "/game"), verifyToken, GameController.levelListPage);
router.get("/levelList/:id", validate(validations.requireId, "params", {}, "/game"), verifyToken, GameController.levelList);
router.get("/levelView/:id", validate(validations.requireId, "params", {}, "/game"), verifyToken, GameController.levelView);


// ---------------------Pattern-----------------------------------------------------------------------------------------------------------------------
router.post("/savePattern/:id", validate(validations.requireId, "params", {}, "/game"), verifyToken, GameController.savePattern);
router.get("/editPattern/:id", validate(validations.requireId, "params", {}, "/game"), verifyToken, GameController.editPattern);
router.post("/editPatternSave/:id", validate(validations.requireId, "params", {}, "/game"), verifyToken, GameController.editPatternSave);


// ---------------------Game Hint--------------------------------------------------------------------------------------------------------
router.get("/hintPage", verifyToken, GameController.hintPage);
router.get("/hintList", verifyToken, GameController.hintList);
router.get("/addHint", verifyToken, GameController.addHint);
router.post("/saveHint", verifyToken, GameController.saveHint);
router.get("/viewHint/:id", validate(validations.requireId, "params", {}, "/game"), verifyToken, GameController.viewHint);
router.get("/hint-status", validate(validations.updateStatus, "query", {}, "/game"), verifyToken, GameController.hintStatus);
router.get("/editHint/:id", validate(validations.requireId, "params", {}, "/game"), verifyToken, GameController.editHint);
router.post("/updateHint/:id", validate(validations.requireId, "params", {}, "/game"), verifyToken, GameController.updateHint);
router.get("/deleteHint/:id", validate(validations.requireId, "params", {}, "/game"), verifyToken, GameController.deleteHint);

// ---------------------Game Hint video--------------------------------------------------------------------------------------------------------
router.get("/hintVideo", verifyToken, GameController.hintVideo);
router.post("/editHintVideo/:id", validate(validations.requireId, "params", {}, "/game"), verifyToken, GameController.editHintVideo);
// router.post("/editHintVideo",verifyToken, GameController.editHintVideo);






router.get("/test", GameController.test);



module.exports = router;