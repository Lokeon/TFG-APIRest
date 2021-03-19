const Joi = require("@hapi/joi");

//Register User Validation
const registerUserValidation = (data) => {
  const schema = Joi.object({
    username: Joi.string().required(),
    email: Joi.string().min(6).required().email(),
    password: Joi.string().min(6).required(),
  });
  return schema.validate(data);
};

//Register Admin Validation
const registerAdminValidation = (data) => {
  const schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().min(6).required(),
  });
  return schema.validate(data);
};

//Login Validation
const loginValidation = (data) => {
  const schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().min(6).required(),
  });
  return schema.validate(data);
};

module.exports.registerUserValidation = registerUserValidation;
module.exports.registerAdminValidation = registerAdminValidation;
module.exports.loginValidation = loginValidation;
