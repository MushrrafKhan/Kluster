const {
  models: { Sound },
} = require("./../../models");
const multer = require("multer");
const {
  showDate,
  uploadImageLocal,
  uploadImage,
} = require("../../../lib/util");
const fs = require("fs");
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);
class SoundController {
  // notification
  async listPage(req, res) {
    return res.render("sound/notificationList");
  }
  async list(req, res) {
    let reqData = req.query;
    let columnNo = parseInt(reqData.order[0].column);
    let sortOrder = reqData.order[0].dir === "desc" ? -1 : 1;
    let query = {
      isDeleted: false,
      soundType: "notification",
    };
    if (reqData.search.value) {
      const searchValue = new RegExp(
        reqData.search.value
          .split(" ")
          .filter((val) => val)
          .map((value) => value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"))
          .join("|"),
        "i"
      );
      query.$or = [{ title: searchValue }, ];
    }
    let sortCond = { created: sortOrder };
    let response = {};
    switch (columnNo) {
      case 1:
        sortCond = {
          name: sortOrder,
        };
        break;
      case 5:
        sortCond = {
          status: sortOrder,
        };
        break;
      default:
        sortCond = { created: sortOrder };
        break;
    }
    const count = await Sound.countDocuments(query);
    response.draw = 0;
    if (reqData.draw) {
      response.draw = parseInt(reqData.draw) + 1;
    }
    response.recordsTotal = count;
    response.recordsFiltered = count;
    let skip = parseInt(reqData.start);
    let limit = parseInt(reqData.length);
    let sounds = await Sound.find(query)
      .sort(sortCond)
      .skip(skip)
      .limit(limit);
    if (sounds) {
      sounds = sounds.map((sound) => {
        let actions = "";
        actions = `${actions}<a href="/sound/notificationView/${sound._id}" title="view" class="shadow-sm p-3 mb-5 xyz bg-body rounded-circle"><i class="fas fa-eye"></i></a>`;
        console.log(">>>>>>>>>>>>actions",actions);
        return {
          0: (skip += 1),
          1: sound.title,
          2: sound.soundType,
          3: actions,
        };
      });
    }
    response.data = sounds;
    return res.send(response);
  }
  async Datainsert(req, res, next) {
    try {
      const upload = multer({
        dest: "/uploads",
      }).single("audio");
      upload(req, res, async (err) => {
        if (err) {
          res.send("Please select audio.");
        }
        let file = req.file;
        console.log("==========file",file)
        let data = req.body;
        let audio = await uploadImage(file, "Sound");
        console.log("==========audio",audio)

        unlinkAsync(file.path);
        let user = new Sound();
        user.title = data.title;
        user.audio = audio.Key;
        user.soundType = data.soundType;
        user.save();
        return res.send({
          message: "Sound Insert Successfully",
        });
      });
    } catch (err) {
      console.log("error", err);
      0;
      return next(err);
    }
  }
  async updateStatus(req, res) {
    const {id, status} = req.query;
    let user = await Sound.findOne({
        _id: id,
    });
    if(status==false){
    let notification_count =await Sound.find({
      isSuspended: false,
      isDeleted:false,
      soundType:"notification",
    }).countDocuments();
    if(notification_count>=1){
        req.flash('error', req.__('One sound Active At A time'));
        return res.redirect('/sound/notification');
    }
}
    if (!user) {
        req.flash('error', req.__('sound is not exists'));
        return res.redirect('/sound/notification');
    }
    user.isSuspended = status;
    await user.save();
    req.flash('success', req.__('sound status is updated'));
    return res.redirect('/sound/notification');
}
  async view(req,res) {
    let user = await Sound.findOne({
      _id: req.params.id,
      isDeleted: false,
    }).lean();
    if (!user) {
      req.flash("error", req.__("Notification audio not exists"));
      return res.redirect("/sound/notification");
    }
    return res.render("sound/notificationView", {
      user,
      url: `${process.env.AWS_BASE_URL}${user.audio}`,
    });
  }
  async delete(req, res) {
    const user = await Sound.findOne({
      _id: req.params.id,
      isDeleted: false,
    });
    if (!user) {
      req.flash('error', req.__('Notification audio not exists'));
      return res.redirect("/sound/notification");
    }
    user.isDeleted = true;
    await user.save();
    req.flash('success', req.__('Notification audio deleted successfully'));
    return res.redirect("/sound/notification");
  }
  // background
  async backgroundListPage(req, res) {
    return res.render("sound/backgroundList");
  }
  async backgroundList(req, res) {
    let reqData = req.query;
    let columnNo = parseInt(reqData.order[0].column);
    let sortOrder = reqData.order[0].dir === "desc" ? -1 : 1;
    let query = {
      isDeleted: false,
      soundType: "background",
    };
    if (reqData.search.value) {
      const searchValue = new RegExp(
        reqData.search.value
          .split(" ")
          .filter((val) => val)
          .map((value) => value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"))
          .join("|"),
        "i"
      );
      query.$or = [{ title: searchValue }, ];
    }
    let sortCond = { created: sortOrder };
    let response = {};
    switch (columnNo) {
      case 1:
        sortCond = {
          name: sortOrder,
        };
        break;
      case 5:
        sortCond = {
          status: sortOrder,
        };
        break;
      default:
        sortCond = { created: sortOrder };
        break;
    }
    const count = await Sound.countDocuments(query);
    response.draw = 0;
    if (reqData.draw) {
      response.draw = parseInt(reqData.draw) + 1;
    }
    response.recordsTotal = count;
    response.recordsFiltered = count;
    let skip = parseInt(reqData.start);
    let limit = parseInt(reqData.length);
    let sounds = await Sound.find(query)
      .sort(sortCond)
      .skip(skip)
      .limit(limit);
    if (sounds) {
      sounds = sounds.map((sound) => {
        let actions = "";
        actions = `${actions}<a href="/sound/backgroundView/${sound._id}" title="view" class="shadow-sm p-3 mb-5 xyz bg-body rounded-circle"><i class="fas fa-eye"></i></a>`;
        console.log(">>>>>>>>>>>>actions",actions);
        return {
          0: (skip += 1),
          1: sound.title,
          2: sound.soundType,
          3: sound.isSuspended
            ? `<a class="soundActiveStatus" href="/sound/update-background-status?id=${sound._id}&status=false&" title="Suspended">
            <label class="switch">
            <input type="checkbox" >
            <span class="slider round "></span>
            </label> </a>`
            : `<a class="soundInactiveStatus" href="/sound/update-background-status?id=${sound._id}&status=true&" title="Active"> 
            <label class="switch ">
            <input type="checkbox" checked>
            <span class="slider round "></span>
            </label></a>`,
          4: actions,
        };
      });
    }
    response.data = sounds;
    return res.send(response);
  }
  async updateBackgroundStatus(req, res) {
    const {id, status} = req.query;
    let user = await Sound.findOne({
        _id: id,
    });
    console.log(status)

    if(status==false){

    let background_count =await Sound.find({
      isSuspended: false,
      isDeleted:false,
      soundType:"background",
    }).countDocuments();

    console.log(background_count)
    if(background_count>=1){
        console.log("hdhdhdhdh")
        req.flash('error', req.__('One sound Active At A Time'));
        return res.redirect('/sound/background');
    }
}

    if (!user) {
        req.flash('error', req.__('sound is not exists'));
        return res.redirect('/sound/background');
    }

    user.isSuspended = status;
    await user.save();

    req.flash('success', req.__('sound status is updated'));
    return res.redirect('/sound/background');
}
  async backgroundView(req,res) {
    let user = await Sound.findOne({
      _id: req.params.id,
      isDeleted: false,
    }).lean();
    if (!user) {
      req.flash("error", req.__("Background audio not exists"));
      return res.redirect("/sound/background");
    }
    return res.render("sound/backgroundView", {
      user,
      url: `${process.env.AWS_BASE_URL}${user.audio}`,
    });
  }
  async backgroundDelete(req, res) {
    const user = await Sound.findOne({
      _id: req.params.id,
      isDeleted: false,
    });
    console.log(user);
    if (!user) {
      req.flash('error', req.__('Background audio not exists'));
      return res.redirect("/sound/background");
    }
    user.isDeleted = true;
    await user.save();
    req.flash('success', req.__('Background audio deleted successfully'));
    return res.redirect("/sound/background");
  }
  //Puzzle
  async puzzleListPage(req, res) {
    return res.render("sound/puzzleList");
  }
  async puzzleList(req, res) {
    let reqData = req.query;
    let columnNo = parseInt(reqData.order[0].column);
    let sortOrder = reqData.order[0].dir === "desc" ? -1 : 1;
    let query = {
      isDeleted: false,
      soundType: "puzzle",
    };
    if (reqData.search.value) {
      const searchValue = new RegExp(
        reqData.search.value
          .split(" ")
          .filter((val) => val)
          .map((value) => value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"))
          .join("|"),
        "i"
      );
      query.$or = [{ title: searchValue }, ];
    }
    let sortCond = { created: sortOrder };
    let response = {};
    switch (columnNo) {
      case 1:
        sortCond = {
          name: sortOrder,
        };
        break;
      case 5:
        sortCond = {
          status: sortOrder,
        };
        break;
      default:
        sortCond = { created: sortOrder };
        break;
    }
    const count = await Sound.countDocuments(query);
    response.draw = 0;
    if (reqData.draw) {
      response.draw = parseInt(reqData.draw) + 1;
    }
    response.recordsTotal = count;
    response.recordsFiltered = count;
    let skip = parseInt(reqData.start);
    let limit = parseInt(reqData.length);
    let sounds = await Sound.find(query)
      .sort(sortCond)
      .skip(skip)
      .limit(limit);

    console.log(sounds);
    if (sounds) {
      sounds = sounds.map((sound) => {
        let actions = "";
        actions = `${actions}<a href="/sound/puzzleView/${sound._id}" title="view" class="shadow-sm p-3 mb-5 xyz bg-body rounded-circle"><i class="fas fa-eye"></i></a>`;
        return {
          0: (skip += 1),
          1: sound.title,
          2: sound.soundType,
          3: sound.puzzleType,
          4: actions,
        };
      });
    }
    response.data = sounds;
    return res.send(response);
  }
  async puzzleDataInsert(req, res, next) {
    try {
      const upload = multer({
        dest: "/uploads",
      }).single("audio");
      upload(req, res, async (err) => {
        if (err) {
          res.send("Please select audio.");
        }
        let file = req.file;
        let data = req.body;
        let audio = await uploadImage(file, "Sound");
        unlinkAsync(file.path);
        let user = new Sound();
        user.title = data.title;
        user.audio = audio.key;
        user.soundType = data.soundType;
        user.puzzleType = data.puzzleType;
        user.save();
        return res.send({
          message: "Sound Insert Successfully",
        });
      });
    } catch (err) {
      console.log("error", err);
      0;
      return next(err);
    }
  }
  async updatePuzzleStatus(req, res) {
    const {id, status} = req.query;
    let user = await Sound.findOne({
        _id: id,
    });
    console.log(status)

    if(status==false){
    const puzzletype = user.puzzleType;
    // console.log(">>><<<<<",puzzletype);
    let puzzle_count =await Sound.find({
      isSuspended: false,
      isDeleted:false,
      soundType:"puzzle",
      puzzleType:puzzletype,
    }).countDocuments();

    console.log(puzzle_count)
    if(puzzle_count>0){
        console.log("hdhdhdhdh")
        req.flash('error', req.__('Only one correct and incorrect sound will be active'));
        return res.redirect('/sound/puzzle');
    }
}

    if (!user) {
        req.flash('error', req.__('sound is not exists'));
        return res.redirect('/sound/puzzle');
    }

    user.isSuspended = status;
    await user.save();

    req.flash('success', req.__('sound status is updated'));
    return res.redirect('/sound/puzzle');
}
  async puzzleView(req,res) {
    let user = await Sound.findOne({
      _id: req.params.id,
      isDeleted: false,
    }).lean();

    if (!user) {
      req.flash("error", req.__("Puzzle audio not exists"));
      return res.redirect("/sound/puzzle");
    }
    return res.render("sound/puzzleView", {
      user,
      url: `${process.env.AWS_BASE_URL}${user.audio}`,
    });
  }
  async puzzleDelete(req, res) {
    const user = await Sound.findOne({
      _id: req.params.id,
      isDeleted: false,
    });
    console.log(user);
    if (!user) {
      req.flash('error', req.__('Puzzle audio not exists'));
      return res.redirect("/sound/puzzle");
    }
    user.isDeleted = true;
    await user.save();
    req.flash('success', req.__('Puzzle audio deleted successfully'));
    return res.redirect("/sound/puzzle");
  }
}
module.exports = new SoundController();
