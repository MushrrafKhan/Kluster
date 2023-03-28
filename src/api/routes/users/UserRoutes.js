const express = require('express')
const router = express.Router()
const UserController = require('./UserController')
const { validate } = require('../../util/validations')
const validations = require('./UserValidations')
const { verifyToken } = require('../../util/auth')

//---------------------------------------------------------------------Profile Setup Start-----------------------------------
router.post('/Profile-setup1', verifyToken, UserController.profileSetup1)  //progress = 5
router.post('/Profile-setup2', verifyToken, UserController.profileSetup2)   // progress = 6
router.post('/Dating-Preferences', verifyToken, UserController.datingPreferences)   // progress = 7
router.post('/questionary', verifyToken, UserController.questionary)   // progress = 8


// ------------------------------------------------settings-------------------------------------------------------------------
router.post('/changepassword', verifyToken, UserController.updatePassword)
router.post('/notification-setting', verifyToken, UserController.NotificationSetting)
router.post('/sound-setting', verifyToken, UserController.SoundSetting)
router.post('/backgroundMusic-setting', verifyToken, UserController.BackgroundMusicSetting)


// ------------------------------------------------profile----------------------------------------------------------------------
router.post('/editDatingPreferences', verifyToken, UserController.editDatingPreferences)
router.post('/editProfile', verifyToken, UserController.editProfile)
router.get('/profile', verifyToken, UserController.profileInfo)


// --------------------------------------------------Home screen -------------------------------------------------------------
router.get('/swipe-match', verifyToken, UserController.swipeMatch)
router.post('/userDetailSwipeMatch', verifyToken, UserController.userDetailSwipeMatch)


// ----------------------------------------------------------------------like---------------------------------------------
router.post('/likeProfile', verifyToken, UserController.likeProfile)
router.post('/likeList', verifyToken, UserController.likeList)


// ----------------------------------------------------------------love------------------------------------------------------
router.post('/loveProfile', verifyToken, UserController.loveProfile)
router.post('/loveList', verifyToken, UserController.loveList)


// -------------------------------------------------------hold-----------------------------------------------------------
router.post('/profileHold', verifyToken, UserController.profileHold)
router.post('/userDetailInList', verifyToken, UserController.userDetailInList)
router.post('/holdList', verifyToken, UserController.holdList)


// ---------------------------------------------------------lock----------------------------------------------------------
router.post('/lockRequest', verifyToken, UserController.lockRequest)
router.post('/findRequest', verifyToken, UserController.findRequest)
router.post('/acceptLockRequest', verifyToken, UserController.acceptLockRequest)
router.post('/declineLockRequest', verifyToken, UserController.declineLockRequest)
router.post('/lockList', verifyToken, UserController.lockList)


// ----------------------------------------------------super like------------------------------------------------------------
router.post('/superLikeProfile', verifyToken, UserController.superLikeProfile)


// ---------------------------------------------------refer & earn ----------------------------------------------------------
router.get('/refer-earn', verifyToken, UserController.referEarn)
router.get('/refer-link', verifyToken, UserController.referLink)


// ----------------------------------------------------------wallet -------------------------------------------------------
router.get('/requirementsToEarn', verifyToken, UserController.requirementsToEarn)
router.post('/myEarnings', verifyToken, UserController.myEarnings)
router.get('/availableItemsInWallet', verifyToken, UserController.availableItemsInWallet)
router.post('/purchaseItemsInWallet', verifyToken, UserController.purchaseItemsInWallet)


// --------------------------------------------------------------upgrade plan ----------------------------------------------
router.post('/upgradePlan', verifyToken, UserController.upgradePlan)


// ------------------------------------------------------static pages ------------------------------------------------------
router.get('/privacy_policy', UserController.privacy_policyPage)
router.get('/terms_conditions', UserController.termsAndconditionPage)
router.get('/about_us', UserController.Aboutus)
router.get('/html_page/:slug', UserController.html_page)
router.post('/pages', UserController.pages)


// --------------------------------------Chat Api--------------------------------------------------------------------
router.get('/chatList', verifyToken, UserController.chatList)
router.get('/chatBgColor', verifyToken, UserController.chatBgColor)
router.post('/setChatBgColor', verifyToken, UserController.setChatBgColor)
router.get('/romantiks', verifyToken, UserController.romantiks);
router.post('/send-message', verifyToken, UserController.sendMessage)
router.post('/chatImage' ,verifyToken, UserController.image)
router.post('/getLastRomantik' ,verifyToken, UserController.getLastRomantik)
// router.post('/setTextBgColor', verifyToken, UserController.setTextBgColor)


//-------------------------------------Zodiac Api-------------------------------------------------------------
router.get('/zodiacList', verifyToken, UserController.zodiacList)
router.post('/singleZodiac', verifyToken, UserController.singleZodiac)
router.post('/apiAstr', verifyToken, UserController.apiAstr)


//----------------------------------------GAME-----------------------------------------------------------------
router.get('/gameList', verifyToken, UserController.gameList)
router.post('/singleGame', verifyToken, UserController.singleGame)
router.post('/getLevel', verifyToken, UserController.getLevel)
router.post('/gameResult', verifyToken, UserController.gameResult)
router.post('/levelDetails', verifyToken, UserController.levelDetails)
router.get('/gameHint', verifyToken, UserController.gameHint)



//-------------------------------------------------------AUDIO & VIDEO ----------------------------------------------------
router.post('/make-call', UserController.MakeCall);
router.get('/accessToken-voice', verifyToken, UserController.AccessTokenVoice);
router.get('/accessToken-video', verifyToken, UserController.AccessTokenVideo);
router.get('/reject-video-call', verifyToken, UserController.RejectVideoCall);

//-------------------------------------------------------Notification----------------------------------------------------
router.get('/notificationList', verifyToken, UserController.notificationList)
router.get('/clearNotification', verifyToken, UserController.clearNotification)


//-------------------------------------------------------AGORA AUDIO----------------------------------------------------
router.post('/accessTokenAudio', verifyToken, UserController.AccessTokenAudio);
router.post('/ReceivedCall', verifyToken, UserController.ReceivedCall);
router.post('/AccptRjctCall', verifyToken, UserController.AccptRjctCall);


//-------------------------------------------------------Strip----------------------------------------------------
router.post('/planStripe', verifyToken, UserController.planStrip);



// -----------------------------------------------------------test api ----------------------------------------------------
router.get('/test', UserController.Test)






module.exports = router
