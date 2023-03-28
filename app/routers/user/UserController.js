const {
  models: { User, Education, UserPlan, Plans, UserCharacteristics, Characteristics, UserDatingPreferences, Post, UserQusetionaryReport, Question },
} = require("./../../models");
const multer = require("multer");
const { showDate, uploadImageLocal, uploadImage } = require("../../../lib/util");
const fs = require("fs");
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);
class UserController {
  async listPage(req, res) {
    return res.render("user/list");
  }
  async list(req, res) {
    let reqData = req.query;
    let columnNo = parseInt(reqData.order[0].column);
    let sortOrder = reqData.order[0].dir === "desc" ? -1 : 1;
    let query = {
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
      query.$or = [{ name: searchValue }, { description: searchValue }];
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
    const count = await User.countDocuments(query);
    response.draw = 0;
    if (reqData.draw) {
      response.draw = parseInt(reqData.draw) + 1;
    }
    response.recordsTotal = count;
    response.recordsFiltered = count;
    let skip = parseInt(reqData.start);
    let limit = parseInt(reqData.length);
    let users = await User.find(query)
      .sort(sortCond)
      .skip(skip)
      .limit(limit);
    // console.log("====================");
    // console.log(users);
    if (users) {
      users = users.map((user) => {
        let actions = "";
        actions = `${actions}<a href="/user/view/${user._id}" title="view" class="shadow-sm p-3 mb-5 xyz bg-body rounded-circle"><i class="fas fa-eye"></i></a>`;
        return {
          0: (skip += 1),
          1: user.email,
          2: user.phoneNumber,
          3: user.isSuspended
            ? `<a class="userActiveStatus" href="/user/update-status?id=${user._id}&status=false&" title="Suspended">
               <label class="switch">
               <input type="checkbox" >
               <span class="slider round "></span>
               </label> </a>`
            : `<a class="userInactiveStatus" href="/user/update-status?id=${user._id}&status=true&" title="Active"> 
               <label class="switch ">
               <input type="checkbox" checked>
               <span class="slider round "></span>
               </label></a>`,
          4: actions,
        };
      });
    }
    response.data = users;
    return res.send(response);
  }
  // async Datainsert(req, res, next) {
  //   try {
  //     const upload = multer({
  //       dest: "/uploads",
  //     }).single("image");
  //     upload(req, res, async (err) => {
  //       if (err) {
  //         res.send("Please select image.");
  //       }
  //       let file = req.file;
  //       let data = req.body;
  //       let image = await uploadImage(file, "User");
  //       unlinkAsync(file.path);
  //       let restuarantuser = new User();
  //       restuarantuser.name = data.name;
  //       restuarantuser.image = image.key;
  //       restuarantuser.address = data.address;
  //       restuarantuser.description = data.description;
  //       restuarantuser.save();
  //       return res.send({
  //         message: "data insert successfullys",
  //       });
  //     });
  //   } catch (err) {
  //     console.log("error", err);
  //     return next(err);
  //   }
  // }
  async view(req, res) {
    try {
      let user = await User.findOne({
        _id: req.params.id,
      })
        .populate({ path: 'levelOfEducationId', model: Education })
        .lean();
      let userPlan = await UserPlan.findOne({
        userId: req.params.id,
        isActive: true,
      }).populate({ path: 'plansId', model: Plans })
        .lean();
      let characteristics = await UserCharacteristics.find({
        userId: req.params.id,

      }).populate({ path: 'characteristicsId', model: Characteristics })
        .lean();
      let interestedIn = await UserDatingPreferences.findOne({
        userId: req.params.id,
      })
        .lean();
      let media = await Post.findOne({
        userId: req.params.id,
      })
        .lean();
      let questionary = await UserQusetionaryReport.find({
        userId: req.params.id,

      }).populate({ path: 'questionId', model: Question })
        .lean();
      // console.log(user);
      // console.log(userPlan);
      // console.log(">>>>>>>>>>>>>characteristics",characteristics);
      // console.log(interestedIn);
      // console.log(media);
      // console.log("--------------------",questionary);

      if (!user) {
        req.flash("error", req.__("User not exists"));
        return res.redirect("/user");
      }
      return res.render("user/view", {
        user,
        userPlan,
        characteristics,
        interestedIn,
        media,
        questionary,
        url: `${process.env.AWS_BASE_URL}`,
      });
    } catch (err) {
      console.log(err)
      res.next(err)
    }

  }
  async updateStatus(req, res) {
    const { id, status } = req.query;
    let user = await User.findOne({
      _id: id,
    });
    if (!user) {
      req.flash('error', req.__('User is not exists'));
      return res.redirect('/user');
    }
    user.isSuspended = status;
    await user.save();
    req.flash('success', req.__('User is updated'));
    return res.redirect("/user");
  }
  async delete(req, res) {
    const user = await User.findOne({
      _id: req.params.id,
      isDeleted: false,
    });
    console.log(user);
    if (!user) {
      req.flash('error', req.__('User is not exists'));
      return res.redirect('/user');
    }
    user.isDeleted = true;
    await user.save();
    let name = user.name;
    let name1 = name.charAt(0).toUpperCase() + name.substring(1).toLowerCase();
    console.log(name1);
    req.flash('success', req.__(`${name1} is deleted`));
    return res.redirect("/user");
  }
}
module.exports = new UserController();
