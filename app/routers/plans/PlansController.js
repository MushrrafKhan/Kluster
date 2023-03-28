const {
  models: { Plans, CurrencyActionsReplenish },
} = require("./../../models");
const multer = require('multer');
const multiparty = require('multiparty');
let _ = require('lodash')

const { showDate, uploadImageAPI, uploadS3, uploadImage } = require('../../../lib/util');
const fs = require('fs');
const {
  promisify
} = require('util');
const unlinkAsync = promisify(fs.unlink);
class PlansController {
  // Monthly
  async listPage(req, res) {
    return res.render("plans/list");

  }
  async list(req, res) {
    let reqData = req.query;
    let columnNo = parseInt(reqData.order[0].column);
    let sortOrder = reqData.order[0].dir === "desc" ? -1 : 1;
    let query = {};
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
    const count = await Plans.countDocuments(query);
    response.draw = 0;
    if (reqData.draw) {
      response.draw = parseInt(reqData.draw) + 1;
    }
    response.recordsTotal = count;
    response.recordsFiltered = count;
    let skip = parseInt(reqData.start);
    let limit = parseInt(reqData.length);
    let users = await Plans.find(query)
      .sort(sortCond)
      .skip(skip)
      .limit(limit);
    if (users) {
      users = users.map((user) => {
        let actions = "";
        actions = `${actions}<a href="/plans/view/${user._id}" title="view" class="shadow-sm p-3 mb-5 xyz bg-body rounded-circle"><i class="fas fa-eye"></i></a>`;
        actions = `${actions}<a href="/plans/edit/${user._id}" title="edit" class="shadow-sm p-3 mb-5 xyz bg-body rounded-circle"><i class="ion-edit" title="edit" style="color:white;"></i></a>`;

        return {
          0: (skip += 1),
          1: user.name,
          // 2: user.isSuspended
          //   ? `<a class="plansActiveStatus" href="/plans/update-status?id=${user._id}&status=false&" title="Suspended">
          //        <label class="switch">
          //        <input type="checkbox" >
          //        <span class="slider round "></span>
          //        </label> </a>`
          //   : `<a class="plansInactiveStatus" href="/plans/update-status?id=${user._id}&status=true&" title="Active"> 
          //        <label class="switch ">
          //        <input type="checkbox" checked>
          //        <span class="slider round "></span>
          //        </label></a>`,
          2: user.description.substr(0,30),
          3: actions,
        };
      });
    }
    response.data = users;
    return res.send(response);
  }
  async save(req, res) {

    try {
      let plans = new Plans()
      let form = new multiparty.Form()
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
      form.parse(req, async function (err, fields, files) {
        let fileupload = files.image[0]
        _.forOwn(fields, (field, key) => {
          plans[key] = field[0]
        })
        try {
          let image = await uploadImage(fileupload, 'plans')
          console.log(image)
          // await unlinkAsync(file.path);
          plans['image'] = image.Key

          let savePlan = await plans.save()
          return res.success({ savePlan }, 'Post created successfully')
        } catch (err) {
          return res.next(err)
        }
      })
    } catch (err) {
      console.log(err)
      return next(err)
    }
  }

  async view(req, res) {
    let user = await Plans.findOne({
      _id: req.params.id,
    }).lean();
    if (!user) {
      req.flash("error", req.__("Plans not exists"));
      return res.redirect("/plans");
    }
    return res.render("plans/view", {
      user,
      url: `${process.env.AWS_BASE_URL}`,
    });
  }

  // async updateStatus(req, res) {
  //   const { id, status } = req.query;
  //   let user = await Plans.findOne({
  //     _id: id,
  //   });
  //   if (!user) {
  //     req.flash("error", req.__("Plans is not exists"));
  //     return res.redirect("/plans");
  //   }
  //   user.isSuspended = status;
  //   await user.save();
  //   req.flash("success", req.__("Plans is updated"));
  //   return res.redirect("/Plans");
  // }

  async edit(req, res) {
    let _id = req.params.id;
    let userdata = await Plans.findOne({
      _id: _id,
    });
    if (!userdata) {
      req.flash("error", req.__("Plans is not exists"));
      return res.redirect("/plans");
    }
    return res.render("plans/edit", {
      userdata: userdata,
      _id,
    });
  }

  async updateData(req, res) {

    try {
      //     let form = new multiparty.Form();
      //     const user = await Plans.findOne({
      //           _id: req.params.id,
      // });
      //     form.parse(req, async function(err, fields, files) {
      //       _.forOwn(fields, (field, key) => {
      //         user[key] = field[0];
      //       });
      //       console.log("--------files", files);
      //       let fileupload = files.image[0];
      //       if (files.image[0].originalFilename == "") {
      //       } else {
      //         let image = await uploadImage(fileupload, "plans");
      //         user["image"] = image.key;
      //       }

      //       await user.save();

      //       req.flash("success", req.__("Plan Sucessfully Updated"));
      //       return res.redirect("/plans");
      //     });

      let plan = await Plans.findOne({
        _id: req.params.id,
      });

      if (!plan) {
        req.flash("error", req.__("Plans is not exists"));
        return res.redirect("/plans");
      }
      let data = req.body;
      plan.name = data.name;
      plan.price = data.price;
      plan.price6 = data.price6;
      plan.price12 = data.price12;
      plan.description = data.description;
      plan.nickName = data.nickName;
      plan.type = data.type;

      await plan.save();
      req.flash("success", req.__("Plans is edited"));
      return res.redirect("/Plans");

    } catch (err) {
      console.log(err);
      return next(err);
    }
  }

  

}
module.exports = new PlansController();