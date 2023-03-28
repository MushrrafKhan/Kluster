const express = require("express");
const router = express.Router();
const SoundController = require("./SoundController");
const { verifyToken } = require("../../../util/auth");
const validations = require("./SoundValidations");
const { validate } = require("../../../util/validations.js");
//Notification
router.get("/notification", verifyToken,SoundController.listPage);
router.get("/notificationList", verifyToken,SoundController.list);
router.post("/datainsert", SoundController.Datainsert);
// router.get("/update-status",validate(validations.updateStatus, "query", {}, "/sound"),verifyToken,SoundController.updateStatus);
router.get("/notificationView/:id", validate(validations.requireId, "params", {}, "/sound"), verifyToken,SoundController.view);
// router.get("/delete/:id",validate(validations.requireId, "params", {}, "/sound"),verifyToken,SoundController.delete);
//Background 
router.get("/background", verifyToken,SoundController.backgroundListPage);
router.get("/backgroundList", verifyToken,SoundController.backgroundList);
router.get("/update-background-status",validate(validations.updateStatus, "query", {}, "/sound"),verifyToken,SoundController.updateBackgroundStatus);
router.get("/backgroundView/:id", validate(validations.requireId, "params", {}, "/sound"), verifyToken,SoundController.backgroundView);
// router.get("/backgroundDelete/:id",validate(validations.requireId, "params", {}, "/sound"),verifyToken,SoundController.backgroundDelete);
//puzzle
router.get("/puzzle", verifyToken,SoundController.puzzleListPage);
router.get("/puzzleList", verifyToken,SoundController.puzzleList);
router.post("/puzzleDataInsert", SoundController.puzzleDataInsert);
// router.get("/update-puzzle-status",validate(validations.updateStatus, "query", {}, "/sound"),verifyToken,SoundController.updatePuzzleStatus);
router.get("/puzzleView/:id", validate(validations.requireId, "params", {}, "/sound"), verifyToken,SoundController.puzzleView);
// router.get("/puzzleDelete/:id",validate(validations.requireId, "params", {}, "/sound"),verifyToken,SoundController.puzzleDelete); 
module.exports = router;
