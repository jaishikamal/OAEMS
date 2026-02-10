const Joi = require("joi");

class UserValidator {
  validateCreateUser(data) {
    const schema = Joi.object({
      firstName: Joi.string().required().min(2).max(50),
      lastName: Joi.string().required().min(2).max(50),
      email: Joi.string().required().email(),
      username: Joi.string().required().min(3).max(50),
      password: Joi.string()
        .required()
        .min(8)
        .pattern(/[A-Z]/) // At least one uppercase
        .pattern(/[a-z]/) // At least one lowercase
        .pattern(/[0-9]/) // At least one digit
        .messages({
          "string.pattern.base":
            "Password must contain uppercase, lowercase, and numbers",
        }),
      phone: Joi.string().optional(),
      defaultBranchId: Joi.string().optional().uuid(),
    });

    return schema.validate(data);
  }

  validateUpdateUser(data) {
    const schema = Joi.object({
      firstName: Joi.string().optional().min(2).max(50),
      lastName: Joi.string().optional().min(2).max(50),
      email: Joi.string().optional().email(),
      phone: Joi.string().optional(),
      defaultBranchId: Joi.string().optional().uuid(),
      status: Joi.string()
        .optional()
        .valid("active", "suspended", "terminated", "inactive"),
    });

    return schema.validate(data);
  }

  validateAssignRole(data) {
    const schema = Joi.object({
      roleId: Joi.string().required().uuid(),
    });

    return schema.validate(data);
  }

  validateAssignBranch(data) {
    const schema = Joi.object({
      branchId: Joi.string().required().uuid(),
      accessLevel: Joi.string()
        .optional()
        .valid("full", "limited", "read_only"),
    });

    return schema.validate(data);
  }

  validateChangePassword(data) {
    const schema = Joi.object({
      oldPassword: Joi.string().required(),
      newPassword: Joi.string()
        .required()
        .min(8)
        .pattern(/[A-Z]/)
        .pattern(/[a-z]/)
        .pattern(/[0-9]/),
      confirmPassword: Joi.string().required().valid(Joi.ref("newPassword")),
    });

    return schema.validate(data);
  }
}

module.exports = UserValidator;
