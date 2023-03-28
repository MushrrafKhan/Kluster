const { Joi } = require("../../../util/validations");
const requireId = Joi.object().keys({
  id: Joi.objectId()
    .valid()
    .required(),
});
const updateStatus = Joi.object().keys({
  id: Joi.objectId()
    .valid()
    .required(),
  status: Joi.boolean().required(),
});
const replenishEdit = Joi.object().keys({
 
  price: Joi.number().required(),
  name: Joi.string().required(),
});
module.exports = {
  updateStatus,
  requireId,
  replenishEdit,
};