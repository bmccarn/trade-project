const model = require('../models/user');
const Trade = require('../models/trade');
const TradeOffer = require('../models/tradeOffer');

// Render sign-up form
exports.new = (req, res) => res.render('./user/new');

// Create a new user account
exports.create = (req, res, next) => {
    let user = new model(req.body);
    user.save()
        .then(user => res.redirect('/users/login'))
        .catch(err => {
            if (err.name === 'ValidationError') {
                req.flash('error', err.message);
                return res.redirect('/users/new');
            }
            if (err.code === 11000) {
                req.flash('error', 'Account already exists, use different email');
                return res.redirect('/users/new');
            }
            next(err);
        });
};

// Render login form
exports.getUserLogin = (req, res) => res.render('./user/login');

// Authenticate user login
exports.login = (req, res, next) => {
    let email = req.body.email;
    let password = req.body.password;
    model.findOne({ email })
        .then(user => {
            if (!user) {
                req.flash('error', 'Wrong email address');
                return res.redirect('/users/login');
            }
            user.comparePassword(password)
                .then(result => {
                    if (result) {
                        req.session.user = user._id;
                        req.flash('success', 'Logged in successfully');
                        return res.redirect('/users/profile');
                    }
                    req.flash('error', 'Wrong password');
                    res.redirect('/users/login');
                });
        })
        .catch(err => next(err));
};

// Logout user
exports.logout = (req, res, next) => {
    req.session.destroy(err => {
        if (err)
            return next(err);
        else
            res.redirect('/');
    });

};

// Render user profile
exports.profile = async (req, res, next) => {
    let userId = req.session.user;
    try {
        // Find the user and populate the watchlist
        const user = await model.findById(userId).populate('watchlist');
        
        // Filter out items from the watchlist that are not available or are null
        user.watchlist = user.watchlist.filter(item => item && item.status === 'Available');
        
        // Save the updated watchlist
        await user.save();

        // Find all trades posted by the current user
        const allTrades = await Trade.find({ owner: userId });
        const availableTrades = allTrades.filter(trade => trade.status === 'Available');
        const pendingTrades = allTrades.filter(trade => trade.status === 'Pending');

        // Fetch sent trade offers, populate offeredItem and requestedItem, and filter valid offers
        const sentTradeOffers = await TradeOffer.find({ offererUser: userId })
            .populate('offeredItem')
            .populate('requestedItem');
        const filteredSentTradeOffers = sentTradeOffers.filter(offer =>
            offer.status === 'Pending' && offer.offeredItem && offer.requestedItem);

        // Fetch received trade offers, populate offeredItem and requestedItem, and filter valid offers
        const receivedTradeOffers = await TradeOffer.find()
            .populate('offeredItem')
            .populate({ path: 'requestedItem', match: { owner: userId } });
        const filteredReceivedTradeOffers = receivedTradeOffers.filter(offer =>
            offer.requestedItem && offer.status === 'Pending' && offer.offeredItem);

        // Fetch completed trade offers, populate offeredItem and requestedItem, and filter user's trades
        const completedTradeOffers = await TradeOffer.find({ status: 'Accepted' })
            .populate('offeredItem')
            .populate('requestedItem');
        const filteredCompletedTradeOffers = completedTradeOffers.filter(offer =>
            offer.offererUser.equals(userId) || (offer.requestedItem && offer.requestedItem.owner.equals(userId)));

        // Render the user profile page with the relevant data
        res.render('./user/profile', {
            user,
            availableTrades,
            pendingTrades,
            sentTradeOffers: filteredSentTradeOffers,
            filteredReceivedTradeOffers,
            completedTradeOffers: filteredCompletedTradeOffers,
            watchlist: user.watchlist
        });
    } catch (err) {
        next(err);
    }
};


















