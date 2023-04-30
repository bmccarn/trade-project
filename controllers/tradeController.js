const model = require('../models/trade');
const TradeOffer = require('../models/tradeOffer');

//function to format the categories prior to adding to database
function capitalizeFirstLetterOfEachWord(str) {
    return str.replace(/\w\S*/g, function (word) {
      return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
    });
  }

exports.index = (req, res, next) => {
    model.find()
        .then(trades => {
            const categories = [...new Set(trades.map(trade => trade.category))];
            res.render('./trade/index', { trades, categories });
        })
        .catch(err => next(err));
};

exports.new = (req, res) => {
    res.render('./trade/new');
};

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

exports.show = (req, res, next) => {
    let id = req.params.id;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid trade ID');
        err.status = 400;
        return next(err);
    }
    model.findById(id)
        .then(trade => {
            if (trade) {
                res.render('./trade/show', { trade });
            } else {
                let err = new Error('Cannot find a trade with ID ' + id);
                err.status = 404;
                next(err);
            }
        })
        .catch(err => next(err));
};

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

exports.delete = async (req, res, next) => {
    let id = req.params.id;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid trade ID');
        err.status = 400;
        return next(err);
    }

    try {
        // Find trade offers where the item being deleted is either the offeredItem or requestedItem
        const tradeOffers = await TradeOffer.find({
            $or: [{ offeredItem: id }, { requestedItem: id }],
            status: 'Pending' // Only consider pending trade offers
        });

        // Delete each trade offer and set the status of the other person's item back to "Available"
        for (const offer of tradeOffers) {
            // Identify the other person's item
            const otherItemId = offer.offeredItem.equals(id) ? offer.requestedItem : offer.offeredItem;
            // Set the status of the other person's item back to "Available"
            await model.findByIdAndUpdate(otherItemId, { status: 'Available' });

            // Delete the trade offer
            await TradeOffer.findByIdAndDelete(offer._id);
        }

        // Delete the item from the trades collection
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


// Offer/Watchlist functions

exports.makeOffer = async (req, res, next) => {
    let requestedTradeId = req.params.id;
    let userId = req.session.user;

    try {
        // Find the requested trade
        const requestedTrade = await model.findById(requestedTradeId);

        // Check if the current user is the owner of the requested trade
        if (requestedTrade.owner.toString() === userId) {
            req.flash('error', 'You cannot make an offer to trade with yourself.');
            return res.redirect('/trades/' + requestedTradeId);
        }

        // Find all trades posted by the current user
        const userTrades = await model.find({ owner: userId, _id: { $ne: requestedTradeId } });

        // Render the makeOffer.ejs view with the requested trade and the user's trades
        res.render('./trade/makeOffer', { requestedTrade, userTrades });
    } catch (err) {
        next(err);
    }
};

exports.submitOffer = async (req, res, next) => {
    let requestedTradeId = req.params.id;
    let offeredTradeId = req.body.offeredTradeId; // Extract the offeredTradeId from the form data
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
