const model = require('../models/trade');

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

exports.delete = (req, res, next) => {
    let id = req.params.id;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid trade ID');
        err.status = 400
        return next(err);
    }

    model.findByIdAndDelete(id, { useFindAndModify: false })
        .then(trade => {
            if (trade) {
                req.flash('success', 'Trade has been successfully deleted.');
                res.redirect('/trades');
            } else {
                let err = new Error('Cannot find a trade with ID ' + id);
                err.status = 404;
                next(err);
            }
        })
        .catch(err => next(err));
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

        // Update the status of both the requestedTrade and offeredTrade to "pending"
        requestedTrade.status = "Pending";
        offeredTrade.status = "Pending";

        // Save the updated trades
        await requestedTrade.save();
        await offeredTrade.save();

        // Redirect the user to the trade detail page and display a success message
        req.flash('success', 'Trade offer has been successfully submitted.');
        res.redirect('/trades/' + requestedTradeId);
    } catch (err) {
        next(err);
    }
};
