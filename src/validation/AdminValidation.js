import { check, validationResult } from 'express-validator';

export const validateRequest = [
  check('firstName').notEmpty().withMessage('firstName is required'),

  check('lastName').notEmpty().withMessage('lastName is required'),

  check('email').isEmail().withMessage('email is required'),

  check('phoneNo')
    .notEmpty()
    .withMessage('phoneNo is required')
    .isLength({ min: 10 })
    .withMessage('phoneNo must be 10 digit')
    .isMobilePhone()
    .withMessage('Valid phoneNo is required.'),

  check('password')
    .notEmpty()
    .withMessage('password is required')
    .isLength({ min: 8 })
    .withMessage('password must be at least 8 character long'),

  check('confirm_password')
    .notEmpty()
    .withMessage('confirm_password is required')
    .isLength({ min: 8 })
    .withMessage('confirm_password must be at least 8 character long'),

  check('location').notEmpty().withMessage('location is required'),
  check('role')
    .notEmpty()
    .withMessage('role is required')
    .equals('admin')
    .withMessage('Invalid role provided. Valid role is admin'),
];

export const isRequestValid = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.array().length > 0) {
    return res.status(400).json({ msg: errors.array()[0].msg });
  }
  next();
};
