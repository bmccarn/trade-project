const express = require('express');
const controller = require('../controllers/tradeController');
const { isLoggedIn, isOwner } = require('../middlewares/auth'); 
const { validateId, validateTrade } = require('../middlewares/validator');

const router = express.Router();

// Get all trades
router.get('/', controller.index);

// Render form to create a new trade (only for logged-in users)
router.get('/new', isLoggedIn, controller.new);

// Create a new trade (only for logged-in users)
router.post('/', isLoggedIn, validateTrade, controller.create);

// Get trade details by ID
router.get('/:id', validateId, controller.show);

// Render form to edit trade (only for trade owner)
router.get('/:id/edit', validateId, isLoggedIn, isOwner, controller.edit);

// Update trade by ID (only for trade owner)
router.put('/:id', validateId, isLoggedIn, isOwner, validateTrade, controller.update);

// Delete trade by ID (only for trade owner)
router.delete('/:id', validateId, isLoggedIn, isOwner, controller.delete);

// Render form to make a trade offer (only for logged-in users)
router.get('/:id/offer', isLoggedIn, validateId, controller.makeOffer);

// Create a trade offer (only for logged-in users)
router.post('/:id/make-offer', isLoggedIn, validateId, controller.makeOffer);

// Submit a trade offer (only for logged-in users)
router.post('/:id/submit-offer', isLoggedIn, validateId, controller.submitOffer);

// Withdraw a trade offer (only for offerer)
router.post('/trade-offers/:id/withdraw', isLoggedIn, validateId, controller.withdrawOffer);

// Accept a trade offer (only for recipient)
router.post('/trade-offers/:id/accept', isLoggedIn, validateId, controller.acceptOffer);

// Reject a trade offer (only for recipient)
router.post('/trade-offers/:id/reject', isLoggedIn, validateId, controller.rejectOffer);

// Add an item to watchlist (only for logged-in users)
router.post('/:id/watch', isLoggedIn, validateId, controller.addToWatchlist);

// Remove an item from watchlist (only for logged-in users)
router.delete('/:id/watch', isLoggedIn, validateId, controller.removeFromWatchlist);

module.exports = router;
