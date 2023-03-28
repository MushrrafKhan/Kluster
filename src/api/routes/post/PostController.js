const {
  models: { User, Post, LikePost },
} = require('../../../../app/models')
const { signToken } = require('../../util/auth')
const moment = require('moment')
const fs = require('fs')
const multer = require('multer')
const multiparty = require('multiparty')
const mongoose = require('mongoose')
const async = require('async')

const {
  utcDateTime,
  generateOtp,
  logError,
  randomString,
  uploadS3,
  getS3SingnedUrl,
  uploadImage,
  createS3SingnedUrl,
  generateResetToken,
  sendSms,
  utcDate,
  uploadImageBase64,
  uploadImageAPI,
} = require('../../../../lib/util')

var _ = require('lodash')
const { findOneAndDelete } = require('../../../../app/models/models/User.model')

var FCM = require('fcm-node')
var serverKey = process.env.SERVER_KEY
var geoAPIKEY = process.env.GEO_API_KEY
var fcm = new FCM(serverKey)
const NodeGeocoder = require('node-geocoder')

const API_URL = process.env.API_URL

class PostController {
  async createPost(req, res, next) {
    try {
      let post = new Post()
      let form = new multiparty.Form()
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
      form.parse(req, async function (err, fields, files) {
        let fileupload = files.image[0]
        _.forOwn(fields, (field, key) => {
          post[key] = field[0]
        })
        try {
          let image = await uploadImage(fileupload, 'post')
          console.log(image)
          // await unlinkAsync(file.path);
          post['image'] = image.Key
          post['userId'] = req.user._id
          let savePost = await post.save()
          return res.success({ savePost }, 'Post created successfully')
        } catch (err) {
          return res.next(err)
        }
      })
    } catch (err) {
      console.log(err)
      return next(err)
    }
  }

  async likePost(req, res, next) {
    let { postId } = req.body
    try {
      let findPost = await Post.findOne({ _id: postId })
      if (findPost) {
        let postLike = await LikePost.findOne({
          postId: postId,
          userId: req.user._id,
        })
        if (postLike) {
          await postLike.remove()
          let postAfterLike = await Post.findOneAndUpdate(
            { _id: postId },
            { $inc: { likesCount: -1 } },
            { new: true },
          )
          return res.success({ postAfterLike }, 'disLiked')
        } else {
          let postLike = new LikePost()
          postLike.postId = postId
          postLike.userId = req.user._id
          await postLike.save()
          let postAfterLike = await Post.findOneAndUpdate(
            { _id: postId },
            { $inc: { likesCount: 1 } },
            { new: true },
          )

          return res.success({ postAfterLike }, 'liked success')
        }
      } else {
        return res.notFound({}, "Post Doesn't exist")
      }
    } catch (err) {
      console.log(err)
      return next(err)
    }
  }
}

module.exports = new PostController()
