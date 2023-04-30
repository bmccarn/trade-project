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

router.get('/:id/offer', isLoggedIn, validateId, controller.makeOffer);

// POST /trades/:tradeId/make-offer: create a new trade offer
router.post('/:id/make-offer', isLoggedIn, validateId, controller.makeOffer); // Ensure user is logged in

// POST /trades/:id/submit-offer: submit a new trade offer
router.post('/:id/submit-offer', isLoggedIn, validateId, controller.submitOffer); // Ensure user is logged in

// POST /trade-offers/:id/withdraw: withdraw an existing trade offer
router.post('/trade-offers/:id/withdraw', isLoggedIn, validateId, controller.withdrawOffer); // Ensure user is logged in

// POST /trade-offers/:id/accept: accept an existing trade offer
router.post('/trade-offers/:id/accept', isLoggedIn, validateId, controller.acceptOffer); // Ensure user is logged in

// POST /trade-offers/:id/reject: reject an existing trade offer
router.post('/trade-offers/:id/reject', isLoggedIn, validateId, controller.rejectOffer); // Ensure user is logged in

// Route to add an item to the watchlist
router.post('/:id/watch', isLoggedIn, validateId, controller.addToWatchlist);

// Route to remove an item from the watchlist
router.delete('/:id/watch', isLoggedIn, validateId, controller.removeFromWatchlist);

module.exports = router;
