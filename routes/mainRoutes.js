const express = require('express');
const controller = require('../controllers/mainController');

const router = express.Router();

//GET request to /: send the home page to the user

router.get('/', controller.index);

//GET request to /contact: send the contact page to the user

router.get('/contact', controller.contact);

//POST request to /contact: send the contact page to the user (used for contact form submission)

router.post('/contact', controller.contact);

//GET request to /about: send the about page to the user

router.get('/about', controller.about);

module.exports = router;