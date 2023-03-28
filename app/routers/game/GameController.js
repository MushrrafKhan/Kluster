const {
  models: { Game, Stage, Pattern, Level, GameHint, GameHintVideo },
} = require("../../models");
const multer = require('multer');
const multiparty = require('multiparty');
let _ = require('lodash')

const { showDate, uploadImageAPI, uploadS3, uploadImage } = require('../../../lib/util');
const fs = require('fs');
const {
  promisify
} = require('util');
const { pattern } = require("joi/lib/types/object");
const unlinkAsync = promisify(fs.unlink);
class GameController {

  //--------------------------------------------Game Begin---------------------------------------------------------------------------

  async listPage(req, res) {
    return res.render("game/list");

  }
  async list(req, res) {
    let reqData = req.query;
    let columnNo = parseInt(reqData.order[0].column);
    let sortOrder = reqData.order[0].dir === "desc" ? -1 : 1;
    let query = { isSuspended: false, isDeleted: false };
    if (reqData.search.value) {
      const searchValue = new RegExp(
        reqData.search.value
          .split(" ")
          .filter((val) => val)
          .map((value) => value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"))
          .join("|"),
        "i"
      );
      query.$or = [{ name: searchValue }, { colorCode: searchValue }];
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
    const count = await Game.countDocuments(query);
    response.draw = 0;
    if (reqData.draw) {
      response.draw = parseInt(reqData.draw) + 1;
    }
    response.recordsTotal = count;
    response.recordsFiltered = count;
    let skip = parseInt(reqData.start);
    let limit = parseInt(reqData.length);
    let games = await Game.find(query)
      .sort(sortCond)
      .skip(skip)
      .limit(limit);
    if (games) {
      games = games.map((game) => {
        let actions = "";
        actions = `${actions}<a href="/game/view/${game._id}" title="view" class="shadow-sm p-3 mb-5 xyz bg-body rounded-circle"><i class="fas fa-eye"></i></a>`;
        actions = `${actions}<a href="/game/edit/${game._id}" title="edit" class="shadow-sm p-3 mb-5 xyz bg-body rounded-circle"><i class="ion-edit" title="edit" style="color:white;"></i></a>`;

        return {
          0: (skip += 1),
          1: game.name,
          2: game.colorCode,
          3: actions,
        };
      });
    }
    response.data = games;
    return res.send(response);
  }

  async view(req, res) {
    let game = await Game.findOne({
      _id: req.params.id,
    }).lean();
    if (!game) {
      req.flash("error", req.__("Game not exists"));
      return res.redirect("/game");
    }
    return res.render("game/view", {
      game,
      url: `${process.env.AWS_BASE_URL}`,
    });
  }

  async edit(req, res) {
    let _id = req.params.id;
    let game = await Game.findOne({
      _id: _id,
    });
    if (!game) {
      req.flash("error", req.__("Game is not exists"));
      return res.redirect("/game");
    }
    return res.render("game/edit", {
      game: game,
      _id,
    });
  }

  async updateData(req, res) {

    try {

      let game = await Game.findOne({
        _id: req.params.id,
      });

      if (!game) {
        req.flash("error", req.__("Game is not exists"));
        return res.redirect("/game");
      }
      let data = req.body;
      game.colorCode = data.colorCode;


      await game.save();
      req.flash("success", req.__("Game is edited"));
      return res.redirect("/game");

    } catch (err) {
      console.log(err);
      return next(err);
    }
  }

  //--------------------------------------------Game End---------------------------------------------------------------------------

  //--------------------------------------------Stage Begin---------------------------------------------------------------------------
  async stagePage(req, res) {
    return res.render("game/stageList");

  }

  async stageList(req, res) {
    let reqData = req.query;
    let columnNo = parseInt(reqData.order[0].column);
    let sortOrder = reqData.order[0].dir === "desc" ? 1 : -1;
    let query = { isSuspended: false, isDeleted: false };
    if (reqData.search.value) {
      const searchValue = new RegExp(
        reqData.search.value
          .split(" ")
          .filter((val) => val)
          .map((value) => value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"))
          .join("|"),
        "i"
      );
      query.$or = [{ name: searchValue },];
    }
    let sortCond = { created: sortOrder };
    let response = {};
    switch (columnNo) {
      case 1:
        sortCond = {
          name: sortOrder,
        };
        break;
      default:
        sortCond = { created: sortOrder };
        break;
    }
    const count = await Stage.countDocuments(query);
    response.draw = 0;
    if (reqData.draw) {
      response.draw = parseInt(reqData.draw) + 1;
    }
    response.recordsTotal = count;
    response.recordsFiltered = count;
    let skip = parseInt(reqData.start);
    let limit = parseInt(reqData.length);
    let stages = await Stage.find(query)
      .sort(sortCond)
      .skip(skip)
      .limit(limit);
    if (stages) {
      stages = stages.map((stage) => {
        let actions = "";
        // actions = `${actions}<a href="/game/addLevel/${stage._id}" title="add level" class="shadow-sm p-3 mb-5 xyz bg-body rounded-circle"><i class="fas fa-plus"></i></a>`;
        actions = `${actions}<a href="/game/levelListPage/${stage._id}" title="Level List" class="shadow-sm p-3 mb-5 xyz bg-body rounded-circle"><i class="fas fa-list"></i></a>`;

        return {
          0: (skip += 1),
          1: stage.name,
          2: actions,
        };
      });
    }
    response.data = stages;
    return res.send(response);
  }

  //--------------------------------------------Stage End---------------------------------------------------------------------------

  //--------------------------------------------Level Begin---------------------------------------------------------------------------
  async levelListPage(req, res) {
    let _id = req.params.id;
    return res.render("game/levelList", {
      _id: _id
    });

  }

  async levelList(req, res) {
    let reqData = req.query;
    let columnNo = parseInt(reqData.order[0].column);
    let sortOrder = reqData.order[0].dir === "desc" ? 1 : -1;
    let query = { isSuspended: false, isDeleted: false, stageId: req.params.id };
    if (reqData.search.value) {
      // const searchValue = new RegExp(
      //   reqData.search.value
      //     .split(" ")
      //     .filter((val) => val)
      //     .map((value) => value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"))
      //     .join("|"),
      //   "i"
      // );
      const searchValue = reqData.search.value;
      console.log("========>>>>>>>>>>searchValue", Number(searchValue))
      // console.log("========>>>>>>>>>>searchValue", typeof searchValue)tr
      console.log('pppppppp-----',Number(searchValue))
      if (isNaN(Number(searchValue))) {
        query.$or = [{ levelNo: 0 },];
      } else {

        query.$or = [{ levelNo: searchValue },];
      }
    }
    let sortCond = { levelNo: sortOrder };
    let response = {};
    switch (columnNo) {
      case 1:
        sortCond = {
          levelNo: sortOrder,
        };
        break;
      default:
        sortCond = { created: sortOrder };
        break;
    }
    const count = await Level.countDocuments(query);
    response.draw = 0;
    if (reqData.draw) {
      response.draw = parseInt(reqData.draw) + 1;
    }
    response.recordsTotal = count;
    response.recordsFiltered = count;
    let skip = parseInt(reqData.start);
    let limit = parseInt(reqData.length);
    let levels = await Level.find(query)
      .sort(sortCond)
      .skip(skip)
      .limit(limit);
    if (levels) {
      levels = levels.map((level) => {
        let actions = "";

        actions = `${actions}<a href="/game/levelView/${level._id}" title="view" class="shadow-sm p-3 mb-5 xyz bg-body rounded-circle"><i class="fas fa-eye"></i></a>`;
        actions = `${actions}<a href="/game/editPattern/${level._id}" title="edit" class="shadow-sm p-3 mb-5 xyz bg-body rounded-circle"><i class="fas fa-edit"></i></a>`;


        return {
          0: (skip += 1),
          1:level.levelNo,
          2: level.verteces,
          3: actions,
        };
      });
    }
    response.data = levels;
    return res.send(response);
  }

  async addLevel(req, res) {
    let _id = req.params.id;
    let stage = await Stage.findOne({
      _id: _id,
    });
    if (!stage) {
      req.flash("error", req.__("Stage is not exists"));
      return res.redirect("/game/stagePage");
    }
    return res.render("game/addLevel", {
      _id,
    });
  }

  async levelView(req, res) {
    let _id = req.params.id;
    // let x
    // let y
    // let level = await Level.findOne({ _id: _id }).populate({ path: 'patternId', model: Pattern })
    let level = await Level.findOne({ _id: _id })
    // console.log("==--=-=-=-=-=-=", level.patternId.coordinates)
    // console.log("==--=-=-=-=-=-=", level)

    // level.patternId.coordinates.map(val => {
    //   if (x == undefined && y == undefined) {
    //     x = `${val.x} `
    //     y = `${val.y} `
    //   } else {
    //     x += `${val.x} `
    //     y += `${val.y} `
    //   }
    // })

    // return res.render("game/levelView", {
    //   level,
    //   x, y
    // });
    return res.render("game/levelView", {
      level
     
    });
  }

  async savePattern(req, res) {
    try {
      let _id = req.params.id;
      console.log("========id", _id)
      let { coordinate, verteces, coordinate1 } = req.body;

      let stage = await Stage.findOne({ _id: _id })
      let ln = coordinate.length;

      let result = coordinate.slice(0, ln - 1)
      console.log('---------coordiante-----', result)
      let ert = result.split(';')
      ert = ert.map(valo => JSON.parse(valo))
      console.log('---------ert-----', ert)

      console.log('----typeof---parse--', typeof ert)

      let pattern = new Pattern({
        stageId: _id,
        coordinates: ert

      })

      let savePattern = await pattern.save()

      console.log("===========---------", savePattern)
      let levelCount = await Level.countDocuments({ stageId: _id })
      let levelCount_ = await Level.countDocuments({})

      let lNo = levelCount + ((stage.stageNo - 1) * 55)

      // savePattern.coordinates.map(async val => {
      //   if (val) {
      //     levelCount += 1
      //     let level = new Level({
      //       stageId: _id,
      //       patternId: savePattern._id,
      //       startCoord: val,
      //       levelNo: levelCount
      //     })
      //     await level.save();
      //     console.log("---===--==", level)
      //   }
      // })
      if (levelCount == 55) {
        req.flash("error", req.__("Stage already have 55 levels "));

        return res.redirect("/game/stagePage");
      }

      let level = new Level({
        stageId: _id,
        patternId: savePattern._id,
        startCoord: savePattern.coordinates[0],
        levelNo: ++lNo
      })
      await level.save();
      console.log("---===--==", level)



      req.flash("success", req.__("level succesfully added"));

      return res.redirect("/game/stagePage");

    } catch (error) {
      console.log(error)
      res.next(error)
    }

  }

  async editPattern(req, res) {
    let _id = req.params.id;
    let level = await Level.findOne({
      _id: _id,
    });
    if (!level) {
      req.flash("error", req.__("Level is not exists"));
      return res.redirect("/game/stagePage");
    }
    return res.render("game/levelEdit", {
      _id,level,
    });
  }

  async editPatternSave(req, res, next) {
    let _id = req.params.id;
    // console.log("=======>>>>>>>>>>>>=id", _id)
    let { verteces } = req.body;
    // console.log("========coordinate", coordinate)

    // let level = await Level.findOne({ _id: _id })
    // let pattern = await Pattern.findOne({ _id: level.patternId })

    // console.log("========level", level)
    // console.log("========pattern", pattern)

    // let ln = coordinate.length;

    // let result = coordinate.slice(0, ln - 1)
    // console.log('---------coordiante-----', result)
    // let ert = result.split(';')
    // ert = ert.map(valo => JSON.parse(valo))
    // console.log('---------ert-----', ert)

    // console.log('----typeof---parse--', typeof ert)

    // pattern.coordinates = ert
    // let savePattern = await pattern.save();

    // level.startCoord = savePattern.coordinates[0];
    // let _saveLevel = await level.save();

    // console.log("========savePattern", savePattern)
    // console.log("========_saveLevel", _saveLevel)

    let level = await Level.findOne({ _id: _id })
    level.verteces=verteces
    await level.save()

    req.flash("success", req.__("Level updated successfully"));

    return res.redirect("/game/stagePage");


  }

  //--------------------------------------------Level End---------------------------------------------------------------------------

  //--------------------------------------------Game Hint Begin---------------------------------------------------------------------------

  async hintPage(req, res) {
    return res.render("game/hintPage");

  }

  async hintList(req, res) {
    let reqData = req.query;
    let columnNo = parseInt(reqData.order[0].column);
    let sortOrder = reqData.order[0].dir === "desc" ? -1 : 1;
    let query = {
      isDeleted: false,
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
      query.$or = [{ rule: searchValue }];
    }
    let sortCond = { created: sortOrder };
    let response = {};
    switch (columnNo) {
      case 1:
        sortCond = {
          rule: sortOrder,
        };
        break;
      case 2:
        sortCond = {
          status: sortOrder,
        };
        break;
      default:
        sortCond = { created: sortOrder };
        break;
    }
    const count = await GameHint.countDocuments(query);
    response.draw = 0;
    if (reqData.draw) {
      response.draw = parseInt(reqData.draw) + 1;
    }
    response.recordsTotal = count;
    response.recordsFiltered = count;
    let skip = parseInt(reqData.start);
    let limit = parseInt(reqData.length);
    let gameHints = await GameHint.find(query)
      .sort(sortCond)
      .skip(skip)
      .limit(limit);
    console.log("====================");
    console.log(gameHints);
    if (gameHints) {
      gameHints = gameHints.map((gameHint) => {
        let actions = "";
        actions = `${actions}<a href="/game/viewHint/${gameHint._id}" title="view" class="shadow-sm p-3 mb-5 xyz bg-body rounded-circle"><i class="fas fa-eye"></i></a>`;
        actions = `${actions}<a href="/game/editHint/${gameHint._id}" title="edit" class="shadow-sm p-3 mb-5 xyz bg-body rounded-circle"><i class="ion-edit" title="edit" style="color:white;"></i></a>`;
        actions = `${actions}<a href="/game/deleteHint/${gameHint._id}" title="Delete" class=" deleteHintItem shadow-sm p-3 mb-5 xyz bg-body rounded-circle"> <i class="ion-trash-a" style="color:white;"></i> </a>`
        return {
          0: (skip += 1),
          1: gameHint.rule.substr(0, 30),
          2: gameHint.isSuspended
            ? `<a class="hintActiveStatus" href="/game/hint-status?id=${gameHint._id}&status=false&" title="Suspended">
               <label class="switch">
               <input type="checkbox" >
               <span class="slider round "></span>
               </label> </a>`
            : `<a class="hintInactiveStatus" href="/game/hint-status?id=${gameHint._id}&status=true&" title="Active"> 
               <label class="switch ">
               <input type="checkbox" checked>
               <span class="slider round "></span>
               </label></a>`,
          3: actions,
        };
      });
    }
    response.data = gameHints;
    return res.send(response);
  }

  async addHint(req, res) {
    return res.render("game/addHint");
  }
  async saveHint(req, res) {
    const data = req.body;
    const gameHint = new GameHint();
    gameHint.rule = data.rule;
    await gameHint.save();
    req.flash("success", req.__("Game hint is added"));
    res.redirect("/game/hintPage");
  }

  async hintStatus(req, res) {
    const { id, status } = req.query;
    let gameHint = await GameHint.findOne({
      _id: id,
    });
    if (!gameHint) {
      req.flash("error", req.__("Game hint is not exists"));
      return res.redirect("/game/hintPage");
    }
    gameHint.isSuspended = status;
    await gameHint.save();
    req.flash("success", req.__("Game hint is updated"));
    return res.redirect("/game/hintPage");
  }

  async viewHint(req, res) {
    let gameHint = await GameHint.findOne({
      _id: req.params.id,
      isDeleted: false,
    }).lean();
    console.log(gameHint);
    if (!gameHint) {
      req.flash("error", req.__("Game hint not exists"));
      return res.redirect("/game/hintPage");
    }
    return res.render("game/viewHint", {
      gameHint,
    });
  }

  async editHint(req, res) {
    let _id = req.params.id;
    let gameHint = await GameHint.findOne({ _id: _id });
    if (!gameHint) {
      req.flash("error", req.__("Game hint not exists"));
      return res.redirect("/game/hintPage");
    }
    console.log(gameHint);
    return res.render("game/editHint", {
      gameHint: gameHint,
    });
  }

  async updateHint(req, res) {
    const data = req.body;
    const _id = req.params.id;
    const gameHint = await GameHint.findOne({
      _id,
    });
    gameHint.rule = data.rule;
    await gameHint.save();
    req.flash("success", req.__("Game hint updated successfully"));
    res.redirect("/game/hintPage");
  }

  async deleteHint(req, res) {
    const gameHint = await GameHint.findOne({
      _id: req.params.id,
      isDeleted: false,
    });
    console.log(gameHint);
    if (!gameHint) {
      req.flash("error", req.__("Game hint not exists"));
      return res.redirect("/game/hintPage");
    }
    gameHint.isDeleted = true;
    await gameHint.save();
    req.flash("success", req.__("Game hint deleted successfully"));
    return res.redirect("/game/hintPage");
  }

  //--------------------------------------------Game Hint End---------------------------------------------------------------------------

  //--------------------------------------------Game Hint video begin---------------------------------------------------------------------------

  async hintVideo(req, res) {
    let hintVideo = await GameHintVideo.find({}).lean();
    return res.render("game/hintVideo", {
      url: `${process.env.AWS_BASE_URL}${hintVideo[0].video}`,
      _id: hintVideo[0]._id
    });

  }

  async editHintVideo(req, res) {
    let _id = req.params.id
    console.log("-------------_id", _id)
    const upload = multer({ dest: "uploads/" }).single("video");
    upload(req, res, async (err) => {
      if (err) {
        console.log(err);
        return res.send({
          message: "Something went wrong!",
        });
      }
      const file = req.file;
      console.log("--------", file);
      if (!file) {
        req.flash("error", req.__("Upload hint video"));
        res.redirect("/game/hintVideo");
      } else {
        let video1 = await uploadImageAPI(file, "hintVideo");
        await unlinkAsync(file.path);
        console.log(">>>>>>>", video1);

        let hintVideo = await GameHintVideo.findOne({ _id: _id })
        hintVideo.video = video1.Key;
        await hintVideo.save();
        req.flash("success", req.__("Hint Video updated successfully"));
        res.redirect("/game/hintVideo");


      }
    });
  }

  //--------------------------------------------Game Hint video End---------------------------------------------------------------------------



  async test(req, res, next) {
    try {
      let arr = [
        {
          "name": "Stage 1"
        },
        {
          "name": "Stage 2"
        },
        {
          "name": "Stage 3"
        },
        {
          "name": "Stage 4"
        },
        {
          "name": "Stage 5"
        },
        {
          "name": "Stage 6"
        },
        {
          "name": "Stage 7"
        },
        {
          "name": "Stage 8"
        },
        {
          "name": "Stage 9"
        },
        {
          "name": "Stage 10"
        },
        {
          "name": "Stage 11"
        },
        {
          "name": "Stage 12"
        },
      ]

      arr.map(async val => {
        let stage = new Stage({
          name: val.name
        })
        await stage.save();
      })

    } catch (error) {
      console.log(error)
      res.next(error)

    }
  }



}
module.exports = new GameController();