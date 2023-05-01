const model = require('../models/trade');
const TradeOffer = require('../models/tradeOffer');
const User = require('../models/user');

// Helper function to capitalize first letter of each word
function capitalizeFirstLetterOfEachWord(str) {
    return str.replace(/\w\S*/g, function (word) {
      return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
    });
  }

  // Render trades page with items grouped by category
  exports.index = async (req, res, next) => {
    try {
        const trades = await model.find();
        const filteredCategories = trades
            .filter(trade => trade.status === 'Available')
            .map(trade => trade.category);
        const uniqueCategories = [...new Set(filteredCategories)];
        const itemsByCategory = uniqueCategories.map(category => ({
            category,
            items: trades.filter(trade => trade.category === category && trade.status === 'Available'),
        }));
        res.render('./trade/index', { itemsByCategory });
    } catch (err) {
        next(err);
    }
};

// Render form to create new trade
exports.new = (req, res) => {
    res.render('./trade/new');
};

// Create new trade
exports.create = (req, res, next) => {
    let trade = new model(req.body);
    trade.category = capitalizeFirstLetterOfEachWord(trade.category);

    trade.owner = req.session.user;
    trade.save()
    .then(trade => {
        req.flash('success', 'Trade has been successfully created.'); 
        res.redirect('/trades');
    })
    .catch(err=>{
        if(err.name === 'ValidationError' ) {
            err.status = 400;
            req.flash('error', err.message);
            return res.redirect('back');
        }
        next(err);
    });
};

// Render trade details
exports.show = (req, res, next) => {
    let id = req.params.id;
    let userId = req.session.user; 
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid trade ID');
        err.status = 400;
        return next(err);
    }
    model.findById(id)
        .then(async trade => { 
            if (trade) {
                let user = null; 
                if (userId) { 
                    user = await User.findById(userId);
                }
                res.render('./trade/show', { trade, user }); 
            } else {
                let err = new Error('Cannot find a trade with ID ' + id);
                err.status = 404;
                next(err);
            }
        })
        .catch(err => next(err));
};

// Render form to edit trade
exports.edit = (req, res, next) => {
    let id = req.params.id;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid trade ID');
        err.status = 400;
        return next(err);
    }
    model.findById(id)
        .then(trade => {
            if (trade) {
                res.render('./trade/edit', { trade });
            } else {
                let err = new Error('Cannot find a trade with ID ' + id);
                err.status = 404;
                next(err);
            }
        })
        .catch(err => next(err));
};

// Update trade
exports.update = (req, res, next) => {
    let trade = req.body;
    let id = req.params.id;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid trade ID');
        err.status = 400;
        return next(err);
    }

    trade.category = capitalizeFirstLetterOfEachWord(trade.category);

    model.findByIdAndUpdate(id, trade, { useFindAndModify: false, runValidators: true })
        .then(trade => {
            if (trade) {
                req.flash('success', 'Trade has been successfully updated.');
                res.redirect('/trades/' + id);
            } else {
                let err = new Error('Cannot find a trade with ID ' + id);
                err.status = 404;
                next(err);
            }
        })
        .catch(err => {
            if (err.name === 'ValidationError') {
                err.status = 400;
                req.flash('error', err.message);
                return res.redirect('back');
            }
            next(err);
        });
};

// Delete trade and associated offers
exports.delete = async (req, res, next) => {
    let id = req.params.id;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid trade ID');
        err.status = 400;
        return next(err);
    }

    try {
        const tradeOffers = await TradeOffer.find({
            $or: [{ offeredItem: id }, { requestedItem: id }],
            status: 'Pending'
        });

        for (const offer of tradeOffers) {
            const otherItemId = offer.offeredItem.equals(id) ? offer.requestedItem : offer.offeredItem;
            await model.findByIdAndUpdate(otherItemId, { status: 'Available' });
            await TradeOffer.findByIdAndDelete(offer._id);
        }

        const trade = await model.findByIdAndDelete(id, { useFindAndModify: false });

        if (trade) {
            req.flash('success', 'Trade has been successfully deleted.');
            res.redirect('/trades');
        } else {
            let err = new Error('Cannot find a trade with ID ' + id);
            err.status = 404;
            next(err);
        }
    } catch (err) {
        next(err);
    }
};

// Render make offer form
exports.makeOffer = async (req, res, next) => {
    let requestedTradeId = req.params.id;
    let userId = req.session.user;

    try {
        const requestedTrade = await model.findById(requestedTradeId);
        if (requestedTrade.owner.toString() === userId) {
            req.flash('error', 'You cannot make an offer to trade with yourself.');
            return res.redirect('/trades/' + requestedTradeId);
        }

        const existingOffer = await TradeOffer.findOne({
            offeredItem: { $ne: requestedTradeId },
            requestedItem: requestedTradeId, 
            offererUser: userId 
        });

        if (existingOffer) {
            req.flash('error', 'You have already made an offer for this item.');
            return res.redirect('/trades/' + requestedTradeId);
        }

        const userTrades = await model.find({ owner: userId, _id: { $ne: requestedTradeId } });
        res.render('./trade/makeOffer', { requestedTrade, userTrades });
    } catch (err) {
        next(err);
    }
};

// Submit trade offer
exports.submitOffer = async (req, res, next) => {
    let requestedTradeId = req.params.id;
    let offeredTradeId = req.body.offeredTradeId; 
    let userId = req.session.user;

    try {
        // Find the requested trade and the offered trade
        const requestedTrade = await model.findById(requestedTradeId);
        const offeredTrade = await model.findById(offeredTradeId);

        // Check if the current user is the owner of the offered trade
        if (offeredTrade.owner.toString() !== userId) {
            req.flash('error', 'You are not the owner of the offered trade.');
            return res.redirect('/trades/' + requestedTradeId + '/offer');
        }

        // Check if the current user is the owner of the requested trade
        if (requestedTrade.owner.toString() === userId) {
            req.flash('error', 'You cannot make an offer to trade with yourself.');
            return res.redirect('/trades/' + requestedTradeId + '/offer');
        }

        // Update the status of both the requestedTrade and offeredTrade to "Pending"
        requestedTrade.status = "Pending";
        offeredTrade.status = "Pending";

        // Save the updated trades
        await requestedTrade.save();
        await offeredTrade.save();

        // Create a new trade offer and save it to the database
        const tradeOffer = new TradeOffer({
            offeredItem: offeredTradeId,
            requestedItem: requestedTradeId,
            offererUser: userId,
            status: 'Pending'
        });
        await tradeOffer.save();

        // Redirect the user to the trade detail page and display a success message
        req.flash('success', 'Trade offer has been successfully submitted.');
        res.redirect('/users/profile');
    } catch (err) {
        next(err);
    }
};

// Controller function to withdraw an existing trade offer
exports.withdrawOffer = async (req, res, next) => {
    const tradeOfferId = req.params.id;
    const userId = req.session.user;
    try {
        // Find the trade offer and populate offeredItem and requestedItem
        const tradeOffer = await TradeOffer.findById(tradeOfferId)
            .populate('offeredItem')
            .populate('requestedItem');

        // Validate that the current user is the offerer
        if (tradeOffer.offererUser.toString() !== userId) {
            req.flash('error', 'You are not authorized to withdraw this offer.');
            return res.redirect('/trades');
        }

        // Update the status of the offeredItem and requestedItem to "Available"
        tradeOffer.offeredItem.status = 'Available';
        tradeOffer.requestedItem.status = 'Available';
        await tradeOffer.offeredItem.save();
        await tradeOffer.requestedItem.save();

        // Delete the trade offer
        await TradeOffer.findByIdAndDelete(tradeOfferId);

        // Redirect the user to the profile page with success message
        req.flash('success', 'Trade offer has been successfully withdrawn.');
        res.redirect('/users/profile');
    } catch (err) {
        next(err);
    }
};

// Controller function to accept an existing trade offer
exports.acceptOffer = async (req, res, next) => {
    const tradeOfferId = req.params.id;
    const userId = req.session.user;
    try {
        // Find the trade offer and populate offeredItem and requestedItem
        const tradeOffer = await TradeOffer.findById(tradeOfferId)
            .populate('offeredItem')
            .populate('requestedItem');

        // Validate that the current user is the owner of the requested item
        if (tradeOffer.requestedItem.owner.toString() !== userId) {
            req.flash('error', 'You are not authorized to accept this offer.');
            return res.redirect('/trades');
        }

        // Update the status of the offeredItem and requestedItem to "Traded"
        tradeOffer.offeredItem.status = 'Traded';
        tradeOffer.requestedItem.status = 'Traded';
        await tradeOffer.offeredItem.save();
        await tradeOffer.requestedItem.save();

        // Update the status of the tradeOffer to "Accepted" and save it
        tradeOffer.status = 'Accepted';
        await tradeOffer.save();

        // Redirect the user to the profile page with success message
        req.flash('success', 'Trade offer has been successfully accepted.');
        res.redirect('/users/profile');
    } catch (err) {
        next(err);
    }
};


// Controller function to reject an existing trade offer
exports.rejectOffer = async (req, res, next) => {
    const tradeOfferId = req.params.id;
    const userId = req.session.user;
    try {
        // Find the trade offer and populate offeredItem and requestedItem
        const tradeOffer = await TradeOffer.findById(tradeOfferId)
            .populate('offeredItem')
            .populate('requestedItem');

        // Validate that the current user is the owner of the requested item
        if (tradeOffer.requestedItem.owner.toString() !== userId) {
            req.flash('error', 'You are not authorized to reject this offer.');
            return res.redirect('/trades');
        }

        // Update the status of the offeredItem and requestedItem to "Available"
        tradeOffer.offeredItem.status = 'Available';
        tradeOffer.requestedItem.status = 'Available';
        await tradeOffer.offeredItem.save();
        await tradeOffer.requestedItem.save();

        // Delete the trade offer
        await TradeOffer.findByIdAndDelete(tradeOfferId);

        // Redirect the user to the profile page with success message
        req.flash('success', 'Trade offer has been successfully rejected.');
        res.redirect('/users/profile');
    } catch (err) {
        next(err);
    }
};

// Controller function to add an item to the user's watchlist
exports.addToWatchlist = async (req, res, next) => {
    const tradeId = req.params.id; 
    const userId = req.session.user;

    try {
        // Find the trade item
        const trade = await model.findById(tradeId);

        // Validate that the current user is not the owner of the trade item
        if (trade.owner.toString() === userId) {
            req.flash('error', 'You cannot add your own item to the watchlist.');
            return res.redirect('/trades/' + tradeId);
        }

        // Find the current user and update their watchlist
        const user = await User.findById(userId);
        if (!user.watchlist.includes(tradeId)) {
            user.watchlist.push(tradeId);
            await user.save();
            req.flash('success', 'Trade item has been successfully added to your watchlist.');
        } else {
            req.flash('info', 'Trade item is already in your watchlist.');
        }

        res.redirect('/trades/' + tradeId);
    } catch (err) {
        next(err);
    }
};

// Controller function to remove an item from the user's watchlist
exports.removeFromWatchlist = async (req, res, next) => {
    const tradeId = req.params.id; 
    const userId = req.session.user; 

    try {
        // Find the current user and update their watchlist
        const user = await User.findById(userId);
        user.watchlist = user.watchlist.filter(item => !item.equals(tradeId));
        await user.save();

        req.flash('success', 'Trade item has been successfully removed from your watchlist.');
        res.redirect('/trades/' + tradeId);
    } catch (err) {
        next(err);
    }
};
