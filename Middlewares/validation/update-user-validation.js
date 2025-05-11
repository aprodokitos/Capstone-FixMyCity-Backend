const Joi = require("joi");

const userUpdateSchema = Joi.object({
  user_name: Joi.string()
    .required()
    .pattern(/^[a-zA-Z\s]+$/)
    .messages({
      "string.empty": "Nama tidak boleh kosong",
      "string.pattern.base": "Nama hanya boleh berisi huruf dan spasi",
    }),
  user_birthday: Joi.date()
    .required()
    .messages({
      "date.base": "Tanggal lahir harus berupa tanggal",
      "any.required": "Tanggal lahir wajib diisi",
    }),
});

function validateUpdateUser(req, res, next) {
  const { user_name, user_birthday } = req.body;

  const { error } = userUpdateSchema.validate({
    user_name,
    user_birthday,
  });

  if (error) {
    const details = error.details.map((detail) => detail.message).join(", ");
    return res.status(400).json({
      success: false,
      message: `Data user tidak valid: ${details}`,
    });
  }
 
  next();
} 

module.exports = validateUpdateUser;
 