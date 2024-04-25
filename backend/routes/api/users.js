const express = require('express');
const bcrypt = require('bcryptjs');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

const validateSignup = [
  check('email')
    .exists({ checkFalsy: true })
    .isEmail()
    .withMessage("Invalid email")
    .not()
    .isEmpty()
    .withMessage("Email is required"),

  check(['firstName', 'lastName'])
    .exists({ checkFalsy: true })
    .isLength({ min: 2 })
    .withMessage((_value, meta) => `Please provide a ${meta.path === 'firstName' ? 'first name' : 'last name'} with at least 2 characters.`)

    .not()
    .isEmpty()
    .withMessage((_value, meta) => `${meta.path === 'firstName' ? 'First Name' : 'Last Name'} is required`),

  check('username')
    .not()
    .isEmail()
    .withMessage('Username cannot be an email.')
    .exists({ checkFalsy: true })
    .isLength({ min: 4 })
    .withMessage('Please provide a username with at least 4 characters.')
    .not()
    .isEmpty()
    .withMessage("Username is required"),

  check('password')
    .exists({ checkFalsy: true })
    .isLength({ min: 6 })
    .withMessage('Password must be 6 characters or more.')
    .not()
    .isEmpty()
    .withMessage("Password is required"),

  handleValidationErrors
];

//sign-up
router.post(
    '/',
    validateSignup,
    async (req, res) => {
  try {
      const { firstName, lastName, email, password, username } = req.body;
      const hashedPassword = bcrypt.hashSync(password);

      const user = await User.create({ firstName, lastName, email, username, hashedPassword });

      const safeUser = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
      };

      console.log(user, safeUser)
      await setTokenCookie(res, safeUser);

      return res.json({
        user: safeUser
      });
    } catch (error) {
      if (!error.errors || !Array.isArray(error.errors)) {
          throw error;
      }

      const errors = error.errors.map(error => error.message);

      if (errors.includes('email must be unique')) {
          return res
              .status(500)
              .json({
                  "message": "User already exists",
                  "errors": {
                      "email": "User with that email already exists"
                  }
              });
      }

      if (errors.includes('username must be unique')) {
          return res
              .status(500)
              .json({
                  "message": "User already exists",
                  "errors": {
                      "username": "User with that username already exists"
                  }
              });
      }

      throw error;
    }
  }
);


module.exports = router;
