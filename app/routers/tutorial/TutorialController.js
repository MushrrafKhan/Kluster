const {
    models: { Tutorial },
  } = require("./../../models");
class TutorialController {
  async listPage(req, res) {
    return res.render("tutorial/list");
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
      query.$or = [{ tutorialName: searchValue }, { tutorialDescription: searchValue }];
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
    const count = await Tutorial.countDocuments(query);
    response.draw = 0;
    if (reqData.draw) {
      response.draw = parseInt(reqData.draw) + 1;
    }
    response.recordsTotal = count;
    response.recordsFiltered = count;
    let skip = parseInt(reqData.start);
    let limit = parseInt(reqData.length);
    let users = await Tutorial.find(query)
      .sort(sortCond)
      .skip(skip)
      .limit(limit);
    console.log("====================");
    console.log(users);
    if (users) {
      users = users.map((user) => {
        let actions = "";
        actions = `${actions}<a href="/tutorial/view/${user._id}" title="view" class="shadow-sm p-3 mb-5 xyz bg-body rounded-circle"><i class="fas fa-eye"></i></a>`;
        actions = `${actions}<a href="/tutorial/edit/${user._id}" title="edit" class="shadow-sm p-3 mb-5 xyz bg-body rounded-circle"><i class="ion-edit" title="edit" style="color:white;"></i></a>`;
        actions = `${actions}<a href="/tutorial/delete/${user._id}" title="Delete" class=" deleteTutorialItem shadow-sm p-3 mb-5 xyz bg-body rounded-circle"> <i class="ion-trash-a" style="color:white;"></i> </a>`
        return {
          0: (skip += 1),
          1: user.tutorialName,
          2: user.tutorialDescription.substr(0,30)+"....",
          3: user.isSuspended
            ? `<a class="tutorialActiveStatus" href="/tutorial/update-status?id=${user._id}&status=false&" title="Suspended">
               <label class="switch">
               <input type="checkbox" >
               <span class="slider round "></span>
               </label> </a>`
            : `<a class="tutorialInactiveStatus" href="/tutorial/update-status?id=${user._id}&status=true&" title="Active"> 
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
      async add(req, res) {
        return res.render("tutorial/add");
      }
      async save(req, res) {
        const data = req.body;
        const user = new Tutorial();
        user.tutorialName = data.tutorialName;
        user.tutorialDescription = data.tutorialDescription;
        await user.save();
        req.flash("success", req.__("Tutorial is added"));
        res.redirect("/tutorial");
      }
      async view(req, res) {
        let user = await Tutorial.findOne({
          _id: req.params.id,
          isDeleted: false,
        }).lean();
        console.log(user);
        if (!user) {
          req.flash("error", req.__("Tutorial not exists"));
          return res.redirect("/tutorial");
        }
        return res.render("tutorial/view", {
          user,
        });
      }
      async edit(req, res) {
        let _id = req.params.id;
        let userdata = await Tutorial.findOne({ _id: _id });
        if (!userdata) {
          req.flash("error", req.__("Tutorial not exists"));
          return res.redirect("/tutorial");
        }
        console.log(userdata);
        return res.render("tutorial/edit", {
          userdata: userdata,
        });
      }
      async updateData(req, res) {
        const data = req.body;
        const _id = req.params.id;
        const user = await Tutorial.findOne({
          _id,
          isDeleted: false,
        });
        user.tutorialName = data.tutorialName;
        user.tutorialDescription = data.tutorialDescription;
        await user.save();
        req.flash("success", req.__("Tutorial updated successfully"));
        res.redirect("/tutorial");
      }
      async updateStatus(req, res) {
        const { id, status } = req.query;
        let user = await Tutorial.findOne({
          _id: id,
        });
        if (!user) {
          req.flash('error', req.__('Tutorial is not exists'));
          return res.redirect('/tutorial');
        }
        user.isSuspended = status;
        await user.save();
        req.flash('success', req.__('Tutorial is updated'));
        return res.redirect("/tutorial");
      }
      async delete(req, res) {
        const user = await Tutorial.findOne({
          _id: req.params.id,
          isDeleted: false,
        });
        console.log(user);
        if (!user) {
          req.flash('error', req.__('Tutorial not exists'));
          return res.redirect("/tutorial");
        }
        user.isDeleted = true;
        await user.save();
        req.flash('success', req.__('Tutorial deleted successfully'));
        return res.redirect("/tutorial");
      }
  }
  module.exports=new TutorialController();