const {
    models: { Romantiks },
  } = require("./../../models");
  const multer = require("multer");
  const { showDate, uploadImageAPI, uploadS3 } = require("../../../lib/util");
  const fs = require("fs");
  const { promisify } = require("util");
  const unlinkAsync = promisify(fs.unlink);
  class RomantiksController {
    async listPage(req, res) {
      return res.render("romantiks/list");
    }
    async list(req, res) {
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
        query.$or = [{ title: searchValue },];
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
      const count = await Romantiks.countDocuments(query);
      response.draw = 0;
      if (reqData.draw) {
        response.draw = parseInt(reqData.draw) + 1;
      }
      response.recordsTotal = count;
      response.recordsFiltered = count;
      let skip = parseInt(reqData.start);
      let limit = parseInt(reqData.length);
      let users = await Romantiks.find(query)
        .sort(sortCond)
        .skip(skip)
        .limit(limit);
      console.log("====================");
      console.log(users);
      if (users) {
        users = users.map((user) => {
          let actions = "";
            actions = `${actions}<a href="/romantiks/view/${user._id}" class="shadow-sm p-3 mb-5 xyz bg-body rounded-circle"><span class="text-gradient"><i class="ion-eye" title="view"></i></span></a>`;
            actions = `${actions}<a href="/romantiks/edit/${user._id}" class="shadow-sm p-3 mb-5 xyz bg-body rounded-circle"><span class="text-gradient"><i class="ion-edit" title="view"></i></span></a>`;
            actions = `${actions}<a href="/romantiks/delete/${user._id}" title="Delete" class=" deleteRomantiksItem shadow-sm p-3 mb-5 xyz bg-body rounded-circle"> <i class="ion-trash-a" style="color:white;"></i> </a>`
            return {
              0: (skip += 1),
              1: user.title,
              2:  user.isSuspended
                ? `<a class="romantiksActiveStatus" href="/romantiks/update-status?id=${user._id}&status=false&" title="Suspended">
                   <label class="switch">
                   <input type="checkbox" >
                   <span class="slider round "></span>
                   </label> </a>`
                : `<a class="romantiksInactiveStatus" href="/romantiks/update-status?id=${user._id}&status=true&" title="Active"> 
                   <label class="switch ">
                   <input type="checkbox" checked>
                   <span class="slider round "></span>
                   </label></a>`,
              3: actions,
          };
        });
      }
      response.data = users;
      return res.send(response);
    }
    async add(req, res) {
      return res.render("romantiks/add");
    }
    async save(req, res) {
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
          req.flash("error", req.__("Romantiks upload video"));
          res.redirect("/romantiks/add");
        } else {
          let videoSize = file.size; // file size in bytes
          let sizeInMb = videoSize / (1000 * 1000); // bytes convert into kb and after mb
          console.log("size",sizeInMb)
          if(sizeInMb<=4){
            let video1 = await uploadImageAPI(file,"romantiks");
          await unlinkAsync(file.path);
          console.log(">>>>>>>",video1);
          const data = req.body;
          const user = new Romantiks();
          user.title = data.title;
          user.video = video1.Key;
          await user.save();
          req.flash("success", req.__("Romantiks Video Uploaded successfully"));
          res.redirect("/romantiks");
          }else{
          req.flash("error", req.__("Romantiks Video limt is 4 mb"));
          res.redirect("/romantiks/add");
          }
          
        }
      });
    }
      async view(req,res) {
        let user = await Romantiks.findOne({
          _id: req.params.id,
          isDeleted: false,
        }).lean();
        console.log(">>>>>>>>>>",user);
        if (!user) {
          req.flash("error", req.__("Romantiks video not exists"));
          return res.redirect("/romantiks");
        }
        return res.render("romantiks/view", {
          user,
          url: `${process.env.AWS_BASE_URL}${user.video}`,
        });
      }
      async edit(req, res) {
        let _id = req.params.id;
        let userdata = await Romantiks.findOne({
            _id: _id,
        });
        if (!userdata) {
          req.flash("error", req.__("Romantiks video not exists"));
          return res.redirect("/romantiks");
        }
        return res.render('romantiks/edit', {
            userdata: userdata,
            _id,
            // url: `${process.env.AWS_BASE_URL}${userdata.video}`,
        });
    }
    async updateData(req, res, next) {
        try {
          // console.log('--------update--------------')
            const upload = multer({ dest: 'uploads/' }).single('video');
            upload(req, res, async err => {
                if (err) {
                    console.log(err);
                    return res.send({
                        message: 'Something went wrong!',
                    });
                }
                const file = req.file;
                console.log('--------', file);
                if (!file) {
                    console.log("file not found-----------")
                    const data = req.body;
                    const user = await Romantiks.findOne({
                        _id: req.params.id,
                    });
                    user.title = data.title;
                    await user.save();
                    req.flash('success', req.__('Romantiks successfully updated'));
                    res.redirect('/romantiks');
                } else {
                    console.log("file found-----------")
                    let video1 = await uploadImageAPI(file,"romantiks");
                    const data = req.body;
                    const user = await Romantiks.findOne({
                        _id: req.params.id,
                    });
                    user.title = data.title;
                    user.video = video1.Key;
                    await user.save();
                    req.flash('success', req.__('Romantiks successfully updated'));
                    res.redirect('/romantiks');
                }
            });
        } catch (err) {
            console.log(err);
            return next(err);
        }
    }
      async updateStatus(req, res) {
        const { id, status } = req.query;
        let user = await Romantiks.findOne({
          _id: id,
        });
        if (!user) {
          req.flash('error', req.__('Romantiks is not exists'));
          return res.redirect('/romantiks');
        }
        user.isSuspended = status;
        await user.save();
        req.flash('success', req.__('Romantiks is updated'));
        return res.redirect("/romantiks");
      }
      async delete(req, res) {
        const user = await Romantiks.findOne({
          _id: req.params.id,
          isDeleted: false,
        });
        console.log(user);
        if (!user) {
          req.flash('error', req.__('Romantiks not exists'));
          return res.redirect("/romantiks");
        }
        user.isDeleted = true;
        await user.save();
        req.flash('success', req.__('Romantiks deleted successfully'));
        return res.redirect("/romantiks");
      }
  }
  module.exports = new RomantiksController();
  