const express = require('express')
const router = express.Router()
const ReplenishmentController = require('./ReplenishmentController')
const { validate } = require('../../util/validations')
//const validations = require('./AuthValidations');
const { verifyToken } = require('../../util/auth')

const {
  models: { Vendor },
} = require('../../../../app/models')

router.get('/replenishmentItems', verifyToken, ReplenishmentController.replenishmentItems)
router.post('/selectReplenish', verifyToken, ReplenishmentController.selectReplenish)
router.post('/purchaseReplenishItems', verifyToken, ReplenishmentController.purchaseReplenishItems)

module.exports = router
