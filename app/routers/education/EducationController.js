const {
  models: { Education },
} = require("./../../models");
class EducationController {
  async listPage(req, res) {
    return res.render("education/list");
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
    const count = await Education.countDocuments(query);
    response.draw = 0;
    if (reqData.draw) {
      response.draw = parseInt(reqData.draw) + 1;
    }
    response.recordsTotal = count;
    response.recordsFiltered = count;
    let skip = parseInt(reqData.start);
    let limit = parseInt(reqData.length);
    let users = await Education.find(query)
      .sort(sortCond)
      .skip(skip)
      .limit(limit);
    console.log("====================");
    console.log(users);
    if (users) {
      users = users.map((user) => {
        let actions = "";
        actions = `${actions}<a href="/education/view/${user._id}" title="view" class="shadow-sm p-3 mb-5 xyz bg-body rounded-circle"><i class="fas fa-eye"></i></a>`;
        actions = `${actions}<a href="/education/edit/${user._id}" title="edit" class="shadow-sm p-3 mb-5 xyz bg-body rounded-circle"><i class="ion-edit" title="edit" style="color:white;"></i></a>`;
        actions = `${actions}<a href="/education/delete/${user._id}" title="Delete" class=" deleteEducationItem shadow-sm p-3 mb-5 xyz bg-body rounded-circle"> <i class="ion-trash-a" style="color:white;"></i> </a>`
        return {
          0: (skip += 1),
          1: user.name,
          2: user.isSuspended
            ? `<a class="educationActiveStatus" href="/education/update-status?id=${user._id}&status=false&" title="Suspended">
               <label class="switch">
               <input type="checkbox" >
               <span class="slider round "></span>
               </label> </a>`
            : `<a class="educationInactiveStatus" href="/education/update-status?id=${user._id}&status=true&" title="Active"> 
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
    return res.render("education/add");
  }
  async save(req, res) {
    const data = req.body;
    const user = new Education();
    user.name = data.name;
    await user.save();
    req.flash("success", req.__("Education is added"));
    res.redirect("/education");
  }
  async view(req, res) {
    let user = await Education.findOne({
      _id: req.params.id,
      isDeleted: false,
    }).lean();
    console.log(user);
    if (!user) {
      req.flash("error", req.__("Education not exists"));
      return res.redirect("/education");
    }
    return res.render("education/view", {
      user,
    });
  }
  async edit(req, res) {
    let _id = req.params.id;
    let userdata = await Education.findOne({ _id: _id });
    if (!userdata) {
      req.flash("error", req.__("Education not exists"));
      return res.redirect("/education");
    }
    console.log(userdata);
    return res.render("education/edit", {
      userdata: userdata,
    });
  }
  async updateData(req, res) {
    const data = req.body;
    const _id = req.params.id;
    const user = await Education.findOne({
      _id,
      isDeleted: false,
    });
    user.name = data.name;
    await user.save();
    req.flash("success", req.__("Education updated successfully"));
    res.redirect("/education");
  }
  async updateStatus(req, res) {
    const { id, status } = req.query;
    let user = await Education.findOne({
      _id: id,
    });
    if (!user) {
      req.flash("error", req.__("Education is not exists"));
      return res.redirect("/education");
    }
    user.isSuspended = status;
    await user.save();
    req.flash("success", req.__("Education is updated"));
    return res.redirect("/education");
  }
  async delete(req, res) {
    const user = await Education.findOne({
      _id: req.params.id,
      isDeleted: false,
    });
    console.log(user);
    if (!user) {
      req.flash("error", req.__("Education not exists"));
      return res.redirect("/education");
    }
    user.isDeleted = true;
    await user.save();
    req.flash("success", req.__("Education deleted successfully"));
    return res.redirect("/education");
  }
}
module.exports = new EducationController();
