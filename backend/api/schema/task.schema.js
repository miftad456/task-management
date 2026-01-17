import Joi from "joi";
import { failure } from "../utilities/response.js";


const TaskSchema = Joi.object({
  title: Joi.string().min(3).required(),
  description: Joi.string().allow("").default(""),
  priority: Joi.string().valid("low", "medium", "high").default("medium"),
  deadline: Joi.date().optional().allow(null, ""),
  status: Joi.string().valid("pending", "in-progress", "submitted", "completed").default("pending"),
  urgentBeforeMinutes: Joi.number().optional().min(0).allow(null),
  timeSpent: Joi.number().optional().min(0).default(0),
});

export const validateTask = (req, res, next) => {
  const { error, value } = TaskSchema.validate(req.body);
  if (error) return res.status(400).json(failure(error.message));

  if (value.deadline) {
    const deadlineDate = new Date(value.deadline);
    const now = new Date();
    // Only check if it's a valid date and not in the past
    if (!isNaN(deadlineDate.getTime()) && deadlineDate < now.setHours(0, 0, 0, 0)) {
      return res.status(400).json(failure("Deadline must be today or a future date"));
    }
  }

  // If deadline is empty string, set to null
  if (value.deadline === "") {
    value.deadline = null;
  }

  req.body = value;
  next();
};

