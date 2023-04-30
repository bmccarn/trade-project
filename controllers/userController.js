const model = require('../models/user');
const Trade = require('../models/trade');
const TradeOffer = require('../models/tradeOffer');

exports.new = (req, res) => {  
        return res.render('./user/new');
};

exports.create = (req, res, next) => {
  
        let user = new model(req.body);//create a new trade document
        user.save()//insert the document to the database
            .then(user => res.redirect('/users/login'))
            .catch(err => {
                if (err.name === 'ValidationError') {
                    req.flash('error', err.message);
                    return res.redirect('/users/new');
                }

                if (err.code === 11000) {
                    req.flash('error', 'Account already exists, please try a different email address');
                    return res.redirect('/users/new');
                }

                next(err);
            });

};

exports.getUserLogin = (req, res, next) => {
    
        res.render('./user/login');
    
}

exports.login = (req, res, next) => {
        let email = req.body.email;
        let password = req.body.password;
        model.findOne({ email: email })
            .then(user => {
                if (!user) {
                    console.log('Wrong email address');
                    req.flash('error', 'Wrong email address');
                    res.redirect('/users/login');
                } else {
                    user.comparePassword(password)
                        .then(result => {
                            if (result) {
                                req.session.user = user._id;
                                req.flash('success', 'You have successfully logged in');
                                res.redirect('/users/profile');
                            } else {
                                req.flash('error', 'wrong password');
                                res.redirect('/users/login');
                            }
                        });
                }
            })
            .catch(err => next(err)); 
};

exports.profile = async (req, res, next) => {
    let userId = req.session.user;
    try {
        const user = await model.findById(userId);
        const allTrades = await Trade.find({ owner: userId });
        const availableTrades = allTrades.filter(trade => trade.status === 'Available');
        const pendingTrades = allTrades.filter(trade => trade.status === 'Pending');
        
        // Fetch sent trade offers and populate offeredItem and requestedItem fields
        const sentTradeOffers = await TradeOffer.find({ offererUser: userId })
            .populate('offeredItem')
            .populate('requestedItem');
        
        // Filter out any accepted entries or null items in sentTradeOffers and only include "Pending" offers
        const filteredSentTradeOffers = sentTradeOffers.filter(offer =>
            offer.status === 'Pending' && offer.offeredItem && offer.requestedItem
        );
        
        // Fetch received trade offers and include owner information for requestedItem
        const receivedTradeOffers = await TradeOffer.find()
            .populate('offeredItem')
            .populate({
                path: 'requestedItem',
                match: { owner: userId }
            }).exec();

        // Filter out any null entries or null items in receivedTradeOffers and only include "Pending" offers
        const filteredReceivedTradeOffers = receivedTradeOffers.filter(offer =>
            offer.requestedItem && offer.status === 'Pending' && offer.offeredItem
        );

        // Fetch completed trade offers (both sent and received) and populate offeredItem and requestedItem fields
        const completedTradeOffers = await TradeOffer.find({ status: 'Accepted' })
            .populate('offeredItem')
            .populate('requestedItem')
            .exec();

        // Filter to keep only trade offers where the current user is involved (either as offererUser or requestedItem owner)
        const filteredCompletedTradeOffers = completedTradeOffers.filter(offer =>
            offer.offererUser.equals(userId) || (offer.requestedItem && offer.requestedItem.owner.equals(userId))
        );


        res.render('./user/profile', {
            user, 
            availableTrades, 
            pendingTrades, 
            sentTradeOffers: filteredSentTradeOffers, // Use the filtered array for sent trade offers
            filteredReceivedTradeOffers,
            completedTradeOffers: filteredCompletedTradeOffers // Use the filtered array when rendering the view
        });
    } catch (err) {
        next(err);
    }
};













exports.logout = (req, res, next) => {
    req.session.destroy(err => {
        if (err)
            return next(err);
        else
            res.redirect('/');
    });

};



