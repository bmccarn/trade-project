const express = require('express');
const controller = require('../controllers/tradeController');
const { isLoggedIn, isOwner } = require('../middlewares/auth'); 
const { validateId, validateTrade } = require('../middlewares/validator');

const router = express.Router();

// GET request to /trades: send all trades to the user
router.get('/', controller.index);

// GET /trades/new: send the form to the user
router.get('/new', isLoggedIn, controller.new); // Ensure user is logged in

// POST /trades: create a new trade
router.post('/', isLoggedIn, validateTrade, controller.create); // Ensure user is logged in

// GET /trades/:id: send details of trade identified by id
router.get('/:id', validateId, controller.show);

// GET /trades/:id/edit: send html form for editing an existing trade
router.get('/:id/edit', validateId, isLoggedIn, isOwner, controller.edit); // Ensure user is logged in and is owner

// PUT /trades/:id: update the trade identified by id
router.put('/:id', validateId, isLoggedIn, isOwner, validateTrade, controller.update); // Ensure user is logged in and is owner

// DELETE /trades/:id: delete the trade identified by id
router.delete('/:id', validateId, isLoggedIn, isOwner, controller.delete); // Ensure user is logged in and is owner

module.exports = router;
