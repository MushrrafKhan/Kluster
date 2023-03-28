const {
    models: { Question },
  } = require("./../../models");
class QuestionController {
  async listPage(req, res) {
    return res.render("question/list");
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
      query.$or = [{ question: searchValue }, ];
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
    const count = await Question.countDocuments(query);
    response.draw = 0;
    if (reqData.draw) {
      response.draw = parseInt(reqData.draw) + 1;
    }
    response.recordsTotal = count;
    response.recordsFiltered = count;
    let skip = parseInt(reqData.start);
    let limit = parseInt(reqData.length);
    let users = await Question.find(query)
      .sort(sortCond)
      .skip(skip)
      .limit(limit);
    console.log("====================");
    console.log(users);
    if (users) {
      users = users.map((user) => {
        let actions = "";
        actions = `${actions}<a href="/question/view/${user._id}" title="view" class="shadow-sm p-3 mb-5 xyz bg-body rounded-circle"><i class="fas fa-eye"></i></a>`;
        actions = `${actions}<a href="/question/edit/${user._id}" title="edit" class="shadow-sm p-3 mb-5 xyz bg-body rounded-circle"><i class="ion-edit" title="edit" style="color:white;"></i></a>`;
        // actions = `${actions}<a href="/question/delete/${user._id}" title="Delete" class=" deleteQuestionItem shadow-sm p-3 mb-5 xyz bg-body rounded-circle"> <i class="ion-trash-a" style="color:white;"></i> </a>`
        return {
          0: (skip += 1),
          1: user.question.substr(0,30),
          // 2: user.isSuspended
          //   ? `<a class="questionActiveStatus" href="/question/update-status?id=${user._id}&status=false&" title="Suspended">
          //      <label class="switch">
          //      <input type="checkbox" >
          //      <span class="slider round "></span>
          //      </label> </a>`
          //   : `<a class="questionInactiveStatus" href="/question/update-status?id=${user._id}&status=true&" title="Active"> 
          //      <label class="switch ">
          //      <input type="checkbox" checked>
          //      <span class="slider round "></span>
          //      </label></a>`,
          2: actions,                                                           
        };
      });
    }
    response.data = users;
    return res.send(response);
  }
      // async add(req, res) {
      //   return res.render("question/add");
      // }
      // async save(req, res) {
      //   const data = req.body;
      //   const user = new Question();
      //   user.question = data.question;
      //   user.yes[0] = data.yes_opt1;
      //   user.yes[1] = data.yes_opt2;
      //   user.no[0] = data.no_opt1;
      //   user.no[1] = data.no_opt2;
      //   user.default = data.default;
      //   await user.save();
      //   req.flash("success", req.__("Question is added"));
      //   res.redirect("/question");
      // }
      async view(req, res) {
        let user = await Question.findOne({
          _id: req.params.id,
          isDeleted: false,
        }).lean();
        console.log(user);
        if (!user) {
          req.flash("error", req.__("Question not exists"));
          return res.redirect("/question");
        }
        return res.render("question/view", {
          user,
        });
      }
      async edit(req, res) {
        let _id = req.params.id;
        let userdata = await Question.findOne({ _id: _id });
        if (!userdata) {
          req.flash("error", req.__("Question not exists"));
          return res.redirect("/question");
        }
        console.log(userdata);
        return res.render("question/edit", {
          userdata: userdata,
        });
      }
      async updateData(req, res) {
        const data = req.body;
        const _id = req.params.id;
        const user = await Question.findOne({
          _id,
          isDeleted: false,
        });
        user.question = data.question;
        user.yes[0] = data.yes_opt1;
        user.yes[1] = data.yes_opt2;
        user.no[0] = data.no_opt1;
        user.no[1] = data.no_opt2;
        user.default = data.default;
        await user.save();
        req.flash("success", req.__("Question updated successfully"));
        res.redirect("/question");
      }
      // async updateStatus(req, res) {
      //   const { id, status } = req.query;
      //   let user = await Question.findOne({
      //     _id: id,
      //   });
      //   if (!user) {
      //     req.flash('error', req.__('Question is not exists'));
      //     return res.redirect('/question');
      //   }
      //   user.isSuspended = status;
      //   await user.save();
      //   req.flash('success', req.__('Question is updated'));
      //   return res.redirect("/question");
      // }
      // async delete(req, res) {
      //   const user = await Question.findOne({
      //     _id: req.params.id,
      //     isDeleted: false,
      //   });
      //   console.log(user);
      //   if (!user) {
      //     req.flash('error', req.__('Quiz not exists'));
      //     return res.redirect("/quiz/listpage");
      //   }
      //   user.isDeleted = true;
      //   await user.save();
      //   req.flash('success', req.__('Quiz deleted successfully'));
      //   return res.redirect("/quiz/listPage");
      // }
  }
  module.exports=new QuestionController();