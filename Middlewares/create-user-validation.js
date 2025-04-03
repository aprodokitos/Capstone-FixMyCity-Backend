const Joi = require("joi");

const userSchema = Joi.object({
  user_name: Joi.string()
    .required()
    .pattern(/^[a-zA-Z\s]+$/),
  user_birthday: Joi.date().required(),
  user_email: Joi.string().email().required(),
  user_password: Joi.string()
    .required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/),
});

function validateCreateUser(req, res, next) {
  const { user_name, user_birthday, user_email, user_password } = req.body;

  console.log(req.body);
  const data = {
    user_name,
    user_birthday,
    user_email,
    user_password,
  };

  const { error } = userSchema.validate(data);

  if (error) {
    const details = error.details.map((detail) => detail.message).join(", ");
    return res
      .status(400)
      .json({ success: false, message: `Data user tidak valid: ${details}` });
  }

  next();
}

module.exports = validateCreateUser;
