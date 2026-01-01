import joi from "joi";

const commentSchema = joi.object({
  content: joi.string().trim().min(1).max(1000).required()
    .messages({
      "string.empty": "Comment content cannot be empty",
      "string.min": "Comment content must be at least 1 character",
      "string.max": "Comment content cannot exceed 1000 characters",
      "any.required": "Comment content is required"
    })
});

export const validateComment = (req, res, next) => {
  const { error } = commentSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

