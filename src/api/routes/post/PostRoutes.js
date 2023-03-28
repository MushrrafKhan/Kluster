const express = require('express');
const router = express.Router();
const PostController = require('./PostController');
const { validate } = require('../../util/validations');
const validations = require('./PostValidations');
const { verifyToken } = require('../../util/auth');



router.post('/createPost', verifyToken, PostController.createPost);
router.post('/likePost', verifyToken, PostController.likePost);



module.exports = router;
