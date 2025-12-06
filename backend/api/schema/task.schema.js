import Joi from "joi";
import { failure } from "../utilities/response.js";


const TaskSchema = Joi.object({
  title: Joi.string().min(3).required(),
  description: Joi.string().allow(""),
  priority: Joi.string().valid("low", "medium", "high").default("medium"),
  deadline: Joi.date().optional().allow(null),
  status: Joi.string().valid("pending", "in-progress", "completed").default("pending"),
  urgentBeforeMinutes: Joi.number().optional().min(0), // <-- add this
  timeSpent: Joi.number().optional().min(0),

});

export const validateTask = (req, res, next) => {
  const { error ,value} = TaskSchema.validate(req.body);
  if (error) return res.status(400).json(failure(error.message));
  if (!req.body.description) {
    req.body.description = "";
  } ;
  if (value.deadline){
    const deadlineDate = new Date(value.deadline);
    const now = new Date();
    if (deadlineDate < now) {
      return res.status(400).json(failure("Deadline must be a future date"));
    }
  }
  req.body = value;
  next();
};

