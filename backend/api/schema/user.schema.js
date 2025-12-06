import Joi from "joi";
import { failure } from "../utilities/response.js";

const UserSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  username: Joi.string().required(),
  password: Joi.string().min(6).required(),
});

export const validateUser = (req, res, next) => {
  const { error } = UserSchema.validate(req.body);
  if (error) return res.status(400).json(failure(error.message));
  next();
};
