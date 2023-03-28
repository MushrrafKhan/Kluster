const {
  models: { Characteristics },
} = require("../../models");
const multer = require("multer");
const { showDate, uploadImageAPI, uploadS3 } = require("../../../lib/util");
const fs = require("fs");
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);
class CharacteristicsController {
  async listPage(req, res) {
    return res.render("characteristics/list");
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
    const count = await Characteristics.countDocuments(query);
    response.draw = 0;
    if (reqData.draw) {
      response.draw = parseInt(reqData.draw) + 1;
    }
    response.recordsTotal = count;
    response.recordsFiltered = count;
    let skip = parseInt(reqData.start);
    let limit = parseInt(reqData.length);
    let users = await Characteristics.find(query)
      .sort(sortCond)
      .skip(skip)
      .limit(limit);
    console.log("====================");
    // console.log(users);
    if (users) {
      users = users.map((user) => {
        let actions = "";
        actions = `${actions}<a href="/characteristics/view/${user._id}" title="View" class="shadow-sm p-3 mb-5 xyz bg-body rounded-circle"><i class="ion-eye" title="edit" style="color:white;"></i></a>`;
        actions = `${actions}<a href="/characteristics/edit/${user._id}" title="edit" class="shadow-sm p-3 mb-5 xyz bg-body rounded-circle"><i class="ion-edit" title="edit" style="color:white;"></i></a>`;
        actions = `${actions}<a href="/characteristics/delete/${user._id}" title="Delete" class=" deleteCharacteristicItem shadow-sm p-3 mb-5 xyz bg-body rounded-circle"> <i class="ion-trash-a" style="color:white;"></i> </a>`
        return {
          0: (skip += 1),
          1: user.name,
          2: user.isSuspended
            ? `<a class="characteristicActiveStatus" href="/characteristics/update-status?id=${user._id}&status=false&" title="Suspended">
              <label class="switch">
              <input type="checkbox" >
              <span class="slider round "></span>
              </label> </a>`
            : `<a class="characteristicInactiveStatus" href="/characteristics/update-status?id=${user._id}&status=true&" title="Active"> 
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
    return res.render("characteristics/add");
  }
  async save(req, res) {
    const data = req.body;
    const user = new Characteristics();
    console.log("11111111111111111111111111");
    console.log("0099999", data);
    user.name = data.name;
    await user.save();
    console.log("2222222222222222222222222edasd2");
    req.flash("success", req.__("Characteristic has added"));
    res.redirect("/characteristics");
  }
  async view(req, res) {
    let user = await Characteristics.findOne({
      _id: req.params.id,
      isDeleted: false,
    }).lean();
    console.log(user);
    if (!user) {
      req.flash("error", req.__("Characteristics not exists"));
      return res.redirect("/characteristics");
    }
    return res.render("characteristics/view", {
      user,
      url: `${process.env.AWS_BASE_URL}`,
    });
  }
  async edit(req, res) {
    let _id = req.params.id;
    let userdata = await Characteristics.findOne({
      _id: _id,
      isDeleted: false,
    });
    if (!userdata) {
      req.flash("error", req.__("Characteristics is not exists"));
      return res.redirect("/characteristics");
    }
    return res.render("characteristics/edit", {
      userdata: userdata,
      _id,
    });
  }
  async updateData(req, res) {
    const data = req.body;
    const user = await Characteristics.findOne({
      _id: req.params.id,
      isDeleted: false,
    });
    if (!user) {
      req.flash("error", req.__("Characteristics User is not exists"));
      return res.redirect("/characteristics");
    }
    user.name = data.name;
    await user.save();
    req.flash("success", req.__("Characteristics has updated"));
    res.redirect("/characteristics");
  }
  async updateStatus(req, res) {
    const { id, status } = req.query;
    let user = await Characteristics.findOne({
      _id: id,
    });
    if (!user) {
      req.flash("error", req.__("Characteristics is not exists"));
      return res.redirect("/characteristics");
    }
    user.isSuspended = status;
    await user.save();
    req.flash("success", req.__("Characteristics is updated"));
    return res.redirect("/characteristics");
  }
  async delete(req, res) {
    const user = await Characteristics.findOne({
      _id: req.params.id,
      isDeleted: false,
    });
    console.log(user);
    if (!user) {
      req.flash("error", req.__("Characteristics is not exists"));
      return res.redirect("/characteristics");
    }
    user.isDeleted = true;
    await user.save();
    let name = user.name;
    let name1 = name.charAt(0).toUpperCase() + name.substring(1).toLowerCase();
    console.log(name1);
    req.flash("success", req.__(`${name1} is deleted`));
    return res.redirect("/characteristics");
  }
}
module.exports = new CharacteristicsController();
