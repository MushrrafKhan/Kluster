const {
  models: { Reward },
} = require("../../models");
class RewardController {
  async listPage(req, res) {
    return res.render("reward/list");
  }

  async list(req, res) {
    let reqData = req.query;
    let columnNo = parseInt(reqData.order[0].column);
    let sortOrder = reqData.order[0].dir === "desc" ? -1 : 1;
    let query = { isDeleted: false };
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
          title: sortOrder,
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
    const count = await Reward.countDocuments(query);
    response.draw = 0;
    if (reqData.draw) {
      response.draw = parseInt(reqData.draw) + 1;
    }
    response.recordsTotal = count;
    response.recordsFiltered = count;
    let skip = parseInt(reqData.start);
    let limit = parseInt(reqData.length);
    let rewards = await Reward.find(query)
      .sort(sortCond)
      .skip(skip)
      .limit(limit);
    if (rewards) {
      rewards = rewards.map((reward) => {
        let actions = "";
        actions = `${actions}<a href="/reward/view/${reward._id}" title="view" class="shadow-sm p-3 mb-5 xyz bg-body rounded-circle"><i class="fas fa-eye"></i></a>`;
        actions = `${actions}<a href="/reward/edit/${reward._id}" title="edit" class="shadow-sm p-3 mb-5 xyz bg-body rounded-circle"><i class="ion-edit" title="edit" style="color:white;"></i></a>`;

        return {
          0: (skip += 1),
          1: reward.title,
          2: reward.reward,
          // 3: reward.isSuspended
          //   ? `<a class="rewardActiveStatus" href="/reward/update-status?id=${reward._id}&status=false&" title="Suspended">
          //        <label class="switch">
          //        <input type="checkbox" >
          //        <span class="slider round "></span>
          //        </label> </a>`
          //   : `<a class="rewardInactiveStatus" href="/reward/update-status?id=${reward._id}&status=true&" title="Active"> 
          //        <label class="switch ">
          //        <input type="checkbox" checked>
          //        <span class="slider round "></span>
          //        </label></a>`,
          3: actions,
        };
      });
    }
    response.data = rewards;
    return res.send(response);
  }

  // async updateStatus(req, res) {
  //   const { id, status } = req.query;
  //   let reward = await Reward.findOne({
  //     _id: id,
  //     isDeleted: false,
  //   });
  //   if (!reward) {
  //     req.flash("error", req.__("Reward is not exists"));
  //     return res.redirect("/reward");
  //   }
  //   reward.isSuspended = status;
  //   await reward.save();
  //   req.flash("success", req.__("Reward status Updated"));
  //   return res.redirect("/reward");
  // }

  async view(req, res) {
    let reward = await Reward.findOne({
      _id: req.params.id,
      isDeleted: false,
    }).lean();
    if (!reward) {
      req.flash("error", req.__("Reward not exists"));
      return res.redirect("/reward");
    }
    return res.render("reward/view", {
      reward,
    });
  }

  async edit(req, res) {
    let _id = req.params.id;
    let reward = await Reward.findOne({ _id: _id, isDeleted: false });
    if (!reward) {
      req.flash("error", req.__("Reward not exists"));
      return res.redirect("/reward");
    }
    return res.render("reward/edit", {
      reward: reward,
    });
  }

  async updateData(req, res) {
    const data = req.body;
    const _id = req.params.id;
    const reward = await Reward.findOne({
      _id,
      isDeleted: false,
    });
    reward.reward = data.reward;
    await reward.save();
    req.flash("success", req.__("Reward updated successfully"));
    res.redirect("/reward");
  }

}
module.exports = new RewardController();