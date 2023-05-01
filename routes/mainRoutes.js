const express = require('express');
const controller = require('../controllers/mainController');

const router = express.Router();

// Render home page
router.get('/', controller.index);

// Render contact page
router.get('/contact', controller.contact);

// Handle contact form submission
router.post('/contact', controller.contact);

// Render about page
router.get('/about', controller.about);

module.exports = router;
