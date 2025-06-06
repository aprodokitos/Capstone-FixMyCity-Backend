const Joi = require("joi");

const userSchema = Joi.object({
  user_name: Joi.string()
    .required()
    .pattern(/^[a-zA-Z\s]+$/)
    .messages({
      "string.empty": "Nama tidak boleh kosong",
      "string.pattern.base": "Nama hanya boleh berisi huruf dan spasi",
    }),
  user_birthday: Joi.date().required().messages({
    "date.base": "Tanggal lahir harus berupa tanggal",
    "any.required": "Tanggal lahir wajib diisi",
  }),
  user_email: Joi.string().email().required().messages({
    "string.email": "Format email tidak valid",
    "string.empty": "Email tidak boleh kosong",
  }),
  user_password: Joi.string()
    .required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/)
    .messages({
      "string.pattern.base":
        "Password harus minimal 8 karakter, mengandung huruf besar, huruf kecil, dan angka",
      "string.empty": "Password tidak boleh kosong",
    }),
});

function validateCreateUser(req, res, next) {
  const { user_name, user_birthday, user_email, user_password } = req.body;

  const { error } = userSchema.validate({
    user_name,
    user_birthday,
    user_email,
    user_password,
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

module.exports = validateCreateUser;
