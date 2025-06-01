const Joi = require('joi');

// Password complexity pattern (at least one uppercase, one lowercase, one digit, one special char)
const passwordComplexity = Joi.string()
  .min(8)
  .max(128)
  .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'))
  .messages({
    'string.pattern.base': 'Password must contain uppercase, lowercase, number, and special character',
  });

// User Registration Validation Schema
const registerValidator = Joi.object({
  name: Joi.string()
    .min(3)
    .max(50)
    .required()
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 3 characters',
      'string.max': 'Name cannot exceed 50 characters',
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Must be a valid email',
      'string.empty': 'Email is required',
    }),
  password: passwordComplexity.required().messages({
    'string.empty': 'Password is required',
  }),
  role: Joi.string()
    .valid('student', 'instructor', 'admin')
    .optional()
    .messages({
      'any.only': 'Role must be one of student, instructor, or admin',
    }),
});

// User Login Validation Schema
const loginValidator = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Must be a valid email',
      'string.empty': 'Email is required',
    }),
  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Password is required',
    }),
});

// Course Creation / Update Validation Schema
const courseValidator = Joi.object({
  title: Joi.string()
    .min(5)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Title is required',
      'string.min': 'Title must be at least 5 characters',
      'string.max': 'Title cannot exceed 100 characters',
    }),
  description: Joi.string()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 1000 characters',
    }),
  instructor: Joi.string()
    .hex()
    .length(24)
    .required()
    .messages({
      'string.length': 'Instructor ID must be a valid 24 character hex string',
      'string.hex': 'Instructor ID must be a valid hex string',
      'string.empty': 'Instructor ID is required',
    }),
  tags: Joi.array()
    .items(Joi.string().max(30))
    .optional(),
  published: Joi.boolean().optional(),
});

// Assessment Validation Schema
const assessmentValidator = Joi.object({
  courseId: Joi.string()
    .hex()
    .length(24)
    .required()
    .messages({
      'string.length': 'Course ID must be a valid 24 character hex string',
      'string.hex': 'Course ID must be a valid hex string',
      'string.empty': 'Course ID is required',
    }),
  title: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Title is required',
      'string.min': 'Title must be at least 3 characters',
      'string.max': 'Title cannot exceed 100 characters',
    }),
  questions: Joi.array()
    .items(
      Joi.object({
        question: Joi.string().required().messages({
          'string.empty': 'Question text is required',
        }),
        options: Joi.array().items(Joi.string().required()).min(2).required().messages({
          'array.min': 'At least two options are required',
        }),
        answer: Joi.string().required().messages({
          'string.empty': 'Answer is required',
        }),
        points: Joi.number().min(1).required().messages({
          'number.min': 'Points must be at least 1',
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one question is required',
    }),
  dueDate: Joi.date().optional(),
});

// Progress Update Validation Schema
const progressValidator = Joi.object({
  userId: Joi.string()
    .hex()
    .length(24)
    .required()
    .messages({
      'string.length': 'User ID must be a valid 24 character hex string',
      'string.hex': 'User ID must be a valid hex string',
      'string.empty': 'User ID is required',
    }),
  courseId: Joi.string()
    .hex()
    .length(24)
    .required()
    .messages({
      'string.length': 'Course ID must be a valid 24 character hex string',
      'string.hex': 'Course ID must be a valid hex string',
      'string.empty': 'Course ID is required',
    }),
  completedLessons: Joi.array()
    .items(Joi.string())
    .optional(),
  progressPercent: Joi.number()
    .min(0)
    .max(100)
    .required()
    .messages({
      'number.min': 'Progress percent must be at least 0',
      'number.max': 'Progress percent cannot exceed 100',
    }),
});

// Middleware factory to use Joi validation easily in Express routes
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return res.status(400).json({ errors });
  }
  next();
};

module.exports = {
  registerValidator,
  loginValidator,
  courseValidator,
  assessmentValidator,
  progressValidator,
  validate,
};
