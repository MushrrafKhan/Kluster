const express = require('express');
const router = express.Router();
const AuthController = require('./AuthController');

const { validate } = require('../../util/validations');
const validations = require('./AuthValidations');
const { verifyToken } = require('../../util/auth');

const {
  models: { Users },
} = require('../../../../app/models');

router.get('/generate-token/:_id', AuthController.generateToken);
router.post('/log-in', AuthController.logIn);
router.get('/log-out', verifyToken, AuthController.logOut);
router.post('/signup', AuthController.signup)
router.post('/verify-otp', AuthController.verifyOtp)   //progress = 1
router.post('/resend-otp', AuthController.resendOtp)
router.post('/forgot-password', AuthController.forgotPassword)
router.post('/reset-password', AuthController.resetPassword)

// -----------------------------------------------------Plan-------------------------------------------------------
router.get('/allPlans', verifyToken, AuthController.allPlans)    // progress = 3
router.post('/singlePlanDetail', verifyToken, AuthController.singlePlanDetail)
router.post('/planDetailAccorMonths', verifyToken, AuthController.planDetailAccorMonths)
router.post('/purchasePlan', verifyToken, AuthController.purchasePlan)         //progess = 4
router.get('/plansListInProfile&Upgrade', verifyToken, AuthController.plansListInProfileUpgrade)

// -------------------------------------List ---------------------------------------------------------------
router.get('/education', AuthController.education);
router.get('/characteristics', verifyToken, AuthController.characteristics);
router.get('/questions', verifyToken, AuthController.questions);
router.get('/tutorials', verifyToken, AuthController.tutorials);   // progess = 2
router.get('/country', AuthController.country);


module.exports = router;
