const { body } = require('express-validator');
const { validationResult } = require('express-validator');

// Middleware to validate "id" parameter
exports.validateId = (req, res, next) => {
    const { id } = req.params;

    // Check if "id" is a valid 24-bit hexadecimal string
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
        next(); // Valid, proceed to next middleware
    } else {
        // Invalid, send error with status code 400
        let err = new Error('Invalid trade id');
        err.status = 400;
        next(err);
    }
};

// Validation rules for user signup
exports.validateSignup = [
    body('firstName', 'First name cannot be empty').notEmpty().trim().escape(),
    body('lastName', 'Last name cannot be empty').notEmpty().trim().escape(),
    body('email', 'Email must be a valid email address').isEmail().trim().escape().normalizeEmail(),
    body('password', 'Password must be 8-64 characters').isLength({ min: 8, max: 64 })
];

// Validation rules for user login
exports.validateLogin = [
    body('email', 'Email must be a valid email address').isEmail().trim().escape().normalizeEmail(),
    body('password', 'Password must be 8-64 characters').isLength({ min: 8, max: 64 })
];

// Middleware to handle validation result
exports.validateResult = (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach(error => req.flash('error', error.msg));
        return res.redirect('back');
    } else {
        return next();
    }
};

// Validation rules for trade creation
exports.validateTrade = [
    body('itemName', 'Item name must be at least 2 characters').isLength({ min: 2 }).notEmpty().trim().escape(),
    body('category', 'Category must be at least 2 characters').isLength({ min: 2 }).notEmpty().trim().escape(),
    body('details', 'Details must be at least 10 characters').isLength({ min: 10 }).notEmpty().trim().escape()
];
