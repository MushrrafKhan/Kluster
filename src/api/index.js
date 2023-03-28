require('custom-env').env('api')
const express = require('express')
const cors = require('cors')
const cron = require('node-cron')
const app = express()
const bodyParser = require('body-parser')
require('express-async-errors')
const { Response } = require('../../lib/http-response')
const mongoose = require('mongoose')
const { Joi, validate } = require('./util/validations')
const { __, languages } = require('./i18n')
const {
  enums: { Platform },
} = require('../../app/models')
const flash = require('connect-flash')
var nodeMailer = require('nodemailer')
var FCM = require('fcm-node')
var serverKey = process.env.SERVER_KEY
var fcm = new FCM(serverKey)
let moment = require('moment')
//require('dotenv').config();
//console.log(require('dotenv').config());
console.log(process.env.MONGO_URI)
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
})
mongoose.set('debug', process.env.NODE_ENV === 'development')

global.ObjectId = mongoose.Types.ObjectId

app.use(cors())
app.use(require('compression')())
const path = require('path')
const engine = require('ejs-locals')
app.use(express.static(path.join(__dirname, 'static')))

app.set('views', path.join(__dirname, 'views'))
app.engine('ejs', engine)
app.set('view engine', 'ejs')
if (process.env.NODE_ENV === 'development') {
  const swaggerUi = require('swagger-ui-express')
  //const YAML = require('yamljs');
  //const swaggerDocument = YAML.load('./src/api/docs/swagger.yaml');
  const swaggerDocument = require('./docs/swagger.json')

  const path = require('path')
  app.use(express.static(path.join(__dirname, 'static')))
  app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      customfavIcon: '/fav32.png',
      customSiteTitle: 'klust3r',
      authorizeBtn: false,
      swaggerOptions: {
        filter: true,
        displayRequestDuration: true,
      },
    }),
  )
}

app.use((req, res, next) => {
  /*res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, Referer, User-Agent, X-Requested-With, Content-Type, Accept, Authorization, Accept-Language, Pragma, Cache-Control, Expires, If-Modified-Since, X-Delivery-Drop-Platform, X-Delivery-Drop-Version'
    );*/

  //res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE, PATCH');
  if (req.method === 'OPTIONS') {
    return res.status(204).send('OK')
  }
  next()
})

app.use((req, res, next) => {
  req.__ = __
  for (const method in Response) {
    if (Response.hasOwnProperty(method)) res[method] = Response[method]
  }
  next()
})

app.use(bodyParser.json({ limit: '100mb' }))
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }))
const headerValidations = Joi.object()
  .keys({
    'x-hrms-version': Joi.string()
      .regex(/^[\d]+\.[\d]+\.[\d]+$/, 'Semantic Version')
      .required(),
    'accept-language': Joi.string()
      .valid(...Object.keys(languages))
      .required(),
  })
  .required()

app.use((req, res, next) => {
  let x = req.url.split('/')
  if (x && x[1] == 'authpage') {
    //req.__ = 'en';
    res.locals.siteUrl = `${req.protocol}://${req.get('host')}`
    res.locals.siteTitle = process.env.SITE_TITLE
    res.locals.DM = __
    res.locals.s3Base = process.env.AWS_S3_BASE
    return next()
  } else {
    //validate(headerValidations, 'headers', {allowUnknown: true})(req, res, next);
    return next()
  }
})

app.use('/', require('./routes'))
app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  // console.error(err);

  if (res.headersSent) {
    return next(err)
  }

  if (err.message === 'EntityNotFound') {
    return res.notFound('', req.__('NOT_FOUND'))
  }

  return res.status(err.status || 500).send({
    success: false,
    data: [],
    message: req.__('GENERAL_ERROR'),
  })
})

app.use(function (req, res) {
  return res.status(404).send({
    success: false,
    data: [],
    message: req.__('NOT_FOUND_ERR'),
  })
})

/***
    update working today true on 24:00
*/

const port = process.env.PORT || 3000
let server
if (process.env.SERVER_MODE === 'https') {
  const https = require('https')
  const fs = require('fs')
  const privateKey = fs.readFileSync('./ssl_keys/privkey.pem', 'utf8')
  const certificate = fs.readFileSync('./ssl_keys/cert.pem', 'utf8')
  const ca = fs.readFileSync('./ssl_keys/chain.pem', 'utf8')
  var credentials = { key: privateKey, cert: certificate, ca: ca }
  server = https.createServer(credentials, app)
} else {
  const http = require('http')
  server = http.createServer(app)
}

server.listen(port, function () {
  // eslint-disable-next-line no-console
  console.info(`Server Started on port ${port}`)
})

const {
  models: { User, Chat, ChatColor, UserChatColor, UserActivity, Plans, UserPlan, Reward, UserWallet, UserEarning, Notification },
} = require('../../app/models')

const io = require('socket.io')(server, {
  allowEIO3: true,
})

io.on('connection', (socket) => {
  // console.log('------------socket is connected-------------', socket.id)

  io.to(socket.id).emit('message', '------------socket_is_connected_io.to--------------')
  socket.on('joinChat', async (data, callback) => {
    let userId = data.userId
    socket.join(userId)

    // console.log('----------io.sockets.adapter.rooms----------', io.sockets.adapter.rooms)
    // io.to(socket.id).emit('get_socket', { data: roomId });
  })
  socket.on('send_message', async (data, callback) => {
    try {
      // console.log('--------send_message------', data)
      let senderId = data.senderId
      let receiverId = data.receiverId
      let msg = data.msg
      let romantik = data.romantik
      let image = data.image

      let rewardRomantiks = await Reward.findOne({ slug: "SEND_1_ROMANTIKS", isSuspended: false, });
      let rewardMessage = await Reward.findOne({ slug: "SEND_10_MESSAGE", isSuspended: false, });
      let senderWallet = await UserWallet.findOne({ userId: senderId });


      let findPlan = await UserPlan.findOne({
        userId: ObjectId(senderId),
        isActive: true,
      }).populate({ path: "plansId", model: Plans });
      let time = findPlan.plansId.replenishTime;
      var minutes = time.split(" ");

      let chatColorSender = await UserChatColor.find({ userId: ObjectId(senderId) }).populate({ path: 'colorId', model: ChatColor, select: 'colorCode' })
      let chatColorReceiver = await UserChatColor.find({ userId: ObjectId(receiverId) }).populate({ path: 'colorId', model: ChatColor, select: 'colorCode' })
      let msgCount = await UserActivity.findOne({ userId: ObjectId(senderId) })
      // console.log('----chatColor----', chatColor)
      // console.log('----msg----', msgCount)
      if (romantik) {
        msgCount.romantikCount = Number(msgCount.romantikCount) - 1
        msgCount.sentRomantik = Number(msgCount.sentRomantik) + 1
        msgCount.romantikEndTime = moment().format()
        await msgCount.save();
        if (rewardRomantiks) {
          let userEarn = new UserEarning();
          userEarn.userId = senderId;
          userEarn.greeting = `Congratulations!! You have received $${rewardRomantiks.reward} for ${rewardRomantiks.title}`;
          userEarn.amount = `+$${rewardRomantiks.reward}`;
          userEarn.type = rewardRomantiks._id;
          await userEarn.save();
          if (senderWallet) {
            senderWallet.currentBalance += rewardRomantiks.reward;
            await senderWallet.save();

          }
        }
        // console.log('---msgCount->>--',msgCount)
        if (msgCount.romantikCount == "0") {
          var travelTime = moment(msgCount.romantikEndTime).add(Number(minutes[0]), "minutes").format();
          // console.log("----------minutes[0] when romantik count == 0 after romantikd ", minutes[0]);
          let date_ = new Date(travelTime);
          let months = date_.getMonth() + 1;
          let d = date_.getDate();
          let hours = date_.getHours();
          let mints = date_.getMinutes();
          let sec = date_.getSeconds();
          // console.log('--crontime----',sec,mints,hours,d,months)
          cron.schedule(
            `${sec} ${mints} ${hours} ${d} ${months} *`,
            async () => {
              let gifAfterSaved = await UserActivity.findOne({
                _id: msgCount._id,
              });
              console.log("---------------- cron hit -----------------");
              if (gifAfterSaved.romantikCount == "0") {
                gifAfterSaved.romantikCount = findPlan.plansId.romantiks;
                gifAfterSaved.sentRomantik = "0";
                gifAfterSaved.romantikEndTime = "0";
                await gifAfterSaved.save();
              }
            }
          );
        }
      }

      if (msg || image) {
        if (msgCount.messageCount == 'UNLMTD') {
          msgCount.sentMessage = Number(msgCount.sentMessage) + 1;
          let savedCount = await msgCount.save()
          let count = Number(savedCount.sentMessage) % 10
          if (count == 0) {
            if (rewardMessage) {
              let userEarn = new UserEarning();
              userEarn.userId = senderId;
              userEarn.greeting = `Congratulations!! You have received $${rewardMessage.reward} for ${rewardMessage.title}`;
              userEarn.amount = `+$${rewardMessage.reward}`;
              userEarn.type = rewardMessage._id;
              await userEarn.save();
              console.log("=-=-=-=-=-=-=-", userEarn)

              if (senderWallet) {
                senderWallet.currentBalance += rewardMessage.reward;
                await senderWallet.save();
                console.log("=-=-=-=-=-=-=-", senderWallet)

              }
            }
          }
        } else {
          // console.log('-----else ------')
          msgCount.messageCount = Number(msgCount.messageCount) - 1;
          msgCount.sentMessage = Number(msgCount.sentMessage) + 1;
          msgCount.messageEndTime = moment().format();
          let savedCount = await msgCount.save()
          // console.log('--------savedCount-------', savedCount)
          let count = Number(savedCount.sentMessage) % 10
          if (count == 0) {
            if (rewardMessage) {
              let userEarn = new UserEarning();
              userEarn.userId = senderId;
              userEarn.greeting = `Congratulations!! You have received $${rewardMessage.reward} for ${rewardMessage.title}`;
              userEarn.amount = `+$${rewardMessage.reward}`;
              userEarn.type = rewardMessage._id;
              await userEarn.save();
              console.log("=-=-=-=-=-=-=-", userEarn)
              if (senderWallet) {
                senderWallet.currentBalance += rewardMessage.reward;
                await senderWallet.save();
                console.log("=-=-=-=-=-=-=-", senderWallet)

              }
            }
          }

          if (savedCount.messageCount == "0") {
            var travelTime = moment(savedCount.messageEndTime).add(Number(minutes[0]), "minutes").format();
            // console.log("----------minutes[0] when like count == 0 after liked ", minutes[0]);
            let date_ = new Date(travelTime);
            let months = date_.getMonth() + 1;
            let d = date_.getDate();
            let hours = date_.getHours();
            let mints = date_.getMinutes();
            let sec = date_.getSeconds();

            cron.schedule(
              `${sec} ${mints} ${hours} ${d} ${months} *`,
              async () => {
                let msgAfterSaved = await UserActivity.findOne({
                  _id: savedCount._id,
                });
                console.log("---------------- cron hit -----------------");
                if (msgAfterSaved.messageCount == "0") {
                  msgAfterSaved.messageCount = findPlan.plansId.dm;
                  msgAfterSaved.messageEndTime = "0";
                  await msgAfterSaved.save();
                }
              }
            );
          }
        }

      }
      sendMessage(receiverId, senderId, msg, romantik, image, chatColorSender, chatColorReceiver).then((data) => {
        // console.log('---------------send_message_data->--------',data)
        socket.to(receiverId).emit('receive_message', { data })
        return callback({
          data: data,
        })
      })
    } catch (err) {
      console.log(err)
    }
  })
  socket.on('get_message', async (data, callback) => {
    try {
      // console.log('--------get_message_data--------------', data)
      let sender = ObjectId(data.sender)
      let receiver = ObjectId(data.receiver)
      let chatColorSender = await UserChatColor.find({ userId: ObjectId(sender) }).populate({ path: 'colorId', model: ChatColor, select: 'colorCode' })
      let chatColorReceiver = await UserChatColor.find({ userId: ObjectId(receiver) }).populate({ path: 'colorId', model: ChatColor, select: 'colorCode' })
      let romantikDetail = {}
      let sendRomantik = await UserActivity.findOne({ userId: ObjectId(sender) })
      let totalRomantik = await UserPlan.findOne({ userId: ObjectId(sender) }).populate({ path: 'plansId', model: Plans, select: 'romantiks' })
      romantikDetail.sendRomantik = sendRomantik.sentRomantik
      romantikDetail.phoneCalls = sendRomantik.phoneCalls
      romantikDetail.videoCalls = sendRomantik.videoCalls
      romantikDetail.totalRomantik = totalRomantik.plansId.romantiks
      // console.log('----------sendRomantik---------',sendRomantik)
      // console.log('----------totalRomantik---------',totalRomantik)
      // console.log('----------romantikDetail---------',romantikDetail)
      let CHATS = await Chat.aggregate([
        {
          $match: {
            $or: [
              { receiverId: receiver, senderId: sender },
              { receiverId: sender, senderId: receiver },
            ],
            ignore: {$ne: true }
        },
      },
        {
          $lookup: {
            from: 'users',
            localField: 'senderId',
            foreignField: '_id',
            as: 'Sender',
          },
        },
        {
          $unwind: {
            path: '$Sender',
          },
        },
        {
          $project: {
            isSuspended: 1,
            senderId: 1,
            receiverId: 1,
            msg: 1,
            romantik: 1,
            image: 1,
            created: 1,
            updated: 1,
            __v: 1,
            sendName: '$Sender.name',
            sendAvatar: '$Sender.image'
          },
        },
      ])

      /*let chats = []
      if (CHATS.length > 0) {
        CHATS.map(function (chat) {
          console.log('-------chat_msg-------', chat.msg)
          if (chat.participants.includes(sender.toString())) {
            chats.push(chat)
          } else {
          }
        })
      }*/
      // console.log('---------get_message_chat----------->', CHATS)
      // console.log('---------chatColorSender----------->', chatColorSender)
      // console.log('---------chatColorReceiver----------->', chatColorReceiver)
      return callback({ data: CHATS, chatColorSender, chatColorReceiver, romantikDetail })
      // console.log('---------get message CHATS---------',CHATS)
      // return CHATS;
    } catch (err) {
      console.log(err)
    }
  })
  socket.on('accept_call', async (data, callback) => {
    console.log('---------------accept_call-------------------')
    let userId = data.userId
    socket.to(userId).emit('accepted', { success: true })
    return callback({
      data: data,
    })
  })
})

var chat_screen = []

function getChatScreenUser(sender, receiver) {
  return chat_screen.find(
    (user) => user.sender === sender && user.receiver === receiver,
  )
}

let sendMessage = async (receiver, sender, msg, romantik, image, type) => {
  try {
    let read = false;
    if (getChatScreenUser(receiver, sender)) {
      // console.log('---------if-Notif----------')
      read = true;
    } else {
      // console.log('---------else-Notif----------')
      let user = await User.findOne({ _id: receiver }).lean();
      let user_ = await User.findOne({ _id: sender }).lean();

      let rewardMessage = await Reward.findOne({ slug: "SEND_10_MESSAGE", isSuspended: false, });
      let senderWallet = await UserWallet.findOne({ userId: sender });

      let token = user.deviceToken;
      
      if (!read) {
        let notification = new Notification({
          senderId: sender,
          receivedId: receiver,
          title: "Klust3r",
          description: "You received a new message from",
          type: "message"
        })
        await notification.save();
        let notificationCount = await Notification.find({ receivedId: receiver, read: false, isDeleted: false }).countDocuments()
        let MSG = {
          to: token,
          notification: {
            "sound": "default",
            "title": 'Klust3r',
            "type": "message",
            "notificationCount":`${notificationCount}`,
            "body": `You received a new message from ${sender.name}`
          },
        };
        if (user?.isNotification) {

          fcm.send(MSG, function (err, response) {
            if (err) {
              console.log("Something has gone wrong!" + err);
            } else {
              console.log("Successfully sent with response: ", response);
            }
          });
        }
      }


    }

    let chat = new Chat({
      senderId: sender,
      receiverId: receiver,
      msg: msg,
      romantik: romantik,
      image: image
    });

    await chat.save();



    let CHATS = await Chat.aggregate([
      {
        $match: {
          $or: [
            { receiverId: ObjectId(receiver), senderId: ObjectId(sender) },
            { receiverId: ObjectId(sender), senderId: ObjectId(receiver) },
          ],
          ignore :{ $ne: true},
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "senderId",
          foreignField: "_id",
          as: "Sender",
        },
      },
      {
        $unwind: {
          path: "$Sender",
        },
      },
      {
        $lookup: {
          from: 'useractivities',
          localField: 'senderId',
          foreignField: 'userId',
          as: 'sentRomantik',
        },
      },
      {
        $lookup: {
          from: 'userplans',
          localField: 'senderId',
          foreignField: 'userId',
          as: 'userplans',
        },
      },
      {
        $lookup: {
          from: 'plans',
          localField: 'userplans.plansId',
          foreignField: '_id',
          as: 'plans',
        },
      },
      {
        $unwind: {
          path: '$plans',
        },
      },
      {
        $unwind: {
          path: '$userplans',
        },
      },
      {
        $unwind: {
          path: '$sentRomantik',
        },
      },
      {
        $project: {
          isSuspended: 1,
          senderId: 1,
          receiverId: 1,
          msg: 1,
          romantik: 1,
          image: 1,
          created: 1,
          updated: 1,
          __v: 1,
          sendName: "$Sender.name",
          sendAvatar: "$Sender.image",
          // sentRomantik: '$sentRomantik.sentRomantik',
          // totalRomantik: '$plans.romantiks',
        },
      },
    ]);
    //  console.log("-------------all_chats----------", CHATS);

    return CHATS;
  } catch (err) {
    console.log(err);
  }
};


