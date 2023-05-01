const express = require('express');
const controller = require('../controllers/userController');
const { isGuest, isLoggedIn } = require('../middlewares/auth');
const { validateSignup, validateLogin, validateResult } = require('../middlewares/validator');
const { logInLimiter } = require('../middlewares/rateLimiters');

const router = express.Router();

// Render registration form
router.get('/new', isGuest, controller.new);

// Handle user registration
router.post('/', isGuest, validateSignup, validateResult, controller.create);

// Render login form
router.get('/login', isGuest, controller.getUserLogin);

// Authenticate user login
router.post('/login', logInLimiter, isGuest, validateLogin, validateResult, controller.login);

// Render user profile
router.get('/profile', isLoggedIn, controller.profile);

// Log out user
router.get('/logout', isLoggedIn, controller.logout);

module.exports = router;
