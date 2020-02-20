const express = require('express');
const { body } = require('express-validator/check');

const router = express.Router();

const User = require('../models/user');
const isAuth = require('../middleware/is-auth');
const authController = require('../controllers/auth');

router.get('/status', isAuth, authController.getStatus);

router.patch('/status', isAuth, [
    body('status')
        .trim()
        .not()
        .isEmpty()
], authController.updateStatus)

router.put('/signup', [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .custom((value, { req }) => {
            return User.findOne({ email: value }).then(userDoc => {
                if (userDoc) {
                    return Promise.reject('Email already Exists!')
                }
            });
        })
        .normalizeEmail(),
    body('password')
        .trim()
        .isLength({ min:5 }),
    body('name')
        .trim()
        .not()
        .isEmpty()
], authController.signup
);

router.post('/login', authController.login)

module.exports = router;