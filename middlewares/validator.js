const { body } = require('express-validator');
const { validationResult } = require('express-validator');

exports.validateId = (req, res, next) => {
    const { id } = req.params;

    // Check if the "id" parameter is a valid 24-bit hexadecimal string
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
        // If valid, call the next middleware function
        next();
    } else {
        // If invalid, call the default error handler with a status code of 400
        let err = new Error('Invalid story id');
        err.status = 400;
        next(err);
    }
};

exports.validateSignup = [body('firstName').notEmpty().trim().escape(),
body('lastName').notEmpty().trim().escape(),
body('email', 'Email must be a valid email address').isEmail().trim().escape().normalizeEmail(),
body('password', 'Password must be at least 8 characters and at most 64 characters').isLength({ min: 8, max: 64 })
];

exports.validateLogin = [body('email', 'Email must be a valid email address').isEmail().trim().escape().normalizeEmail(),
body('password', 'Password must be at least 8 characters and at most 64 characters').isLength({ min: 8, max: 64 })];

exports.validateResult = (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach(error => {
            req.flash('error', error.msg);
        });
        return res.redirect('back');
    } else {
        return next();
    }
};

exports.validateTrade = [body('itemName', 'Item name must be at least 2 characters').isLength({ min: 2 }).notEmpty().trim().escape(),
    body('category', 'Category must be at least 2 characters').isLength({ min: 2 }).notEmpty().trim().escape(),
    body('details', 'Details must be at least 10 characters').isLength({ min: 10 }).notEmpty().trim().escape()];