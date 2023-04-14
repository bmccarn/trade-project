const Trade = require('../models/trade');

//check if user is a guest
exports.isGuest = (req, res, next) => {
    if (!req.session.user)
        return next();
    else {
        req.flash('error', 'You are already logged in');
        res.redirect('/users/profile');
    }
};

//check if user is authenticated
exports.isLoggedIn = (req, res, next) => {
    if (req.session.user)
        return next();
    else {
        req.flash('error', 'You must be logged in to access this page');
        res.redirect('/users/login');
    }
};

//check if user is author of the trade
exports.isAuthor = (req, res, next) => { 
    let id = req.params.id;
    Trade.findById(id)
        .then(trade => {
            if (trade) {
                if (trade.author == req.session.user)
                    return next();
                else {
                    let err = new Error('You are not authorized to access this resource');
                    err.status = 401;
                    return next(err);
                }
            }
        })
        .catch(err => next(err));
}