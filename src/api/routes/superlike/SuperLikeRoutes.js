const express = require('express')
const router = express.Router()
const SuperLikeController = require('./SuperLikeController')
const { validate } = require('../../util/validations')
//const validations = require('./AuthValidations');
const { verifyToken } = require('../../util/auth')

const {
  models: { Vendor },
} = require('../../../../app/models')

router.get('/superLikeReplenishItems', verifyToken, SuperLikeController.superLikeReplenishItems)
router.post('/purchaseSuperLike', verifyToken, SuperLikeController.purchaseSuperLike)
router.get('/receviedSuperLikes', verifyToken, SuperLikeController.receviedSuperLikes)


module.exports = router
