import Joi from "joi";
import { failure } from "../utilities/response.js";

const TaskSchema = Joi.object({
    title: Joi.string().min(3).required(),
    description: Joi.string().allow(""),
    priority: Joi.string().valid("low", "medium", "high").default("medium"),
    deadline: Joi.date().optional(),
    status: Joi.string().valid("pending", "in-progress", "completed").default("pending")
});

export const validateTask = (req, res, next) => {
    const { error } = TaskSchema.validate(req.body);
    if (error) return res.status(400).json(failure(error.message));
    next();
};
