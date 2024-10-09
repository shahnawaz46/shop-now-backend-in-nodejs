import { check, validationResult } from 'express-validator';
import moment from 'moment';

export const validateRequest = [
  check('firstName').notEmpty().withMessage('first name is required'),

  check('lastName').notEmpty().withMessage('last name is required'),

  check('email').isEmail().withMessage('email is required'),

  check('phoneNo')
    .isLength({ min: 10 })
    .withMessage('phone no must be 10 digit'),

  check('dob')
    .notEmpty()
    .withMessage('dob is required')
    .custom((value) => {
      const dob = moment(value);
      const age = moment().diff(dob, 'years');
      if (age < 10) {
        throw new Error(
          'You must be at least 10 years old to create an account'
        );
      }
      return true;
    }),

  check('password')
    .isLength({ min: 8 })
    .withMessage('password must be at least 8 character long'),
];

export const isRequestValid = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.array().length > 0) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
};
