const rateLimit = require('express-rate-limit');

exports.logInLimiter = rateLimit({
    windowMS: 60 * 1000, // 1 minute
    max: 5,
    handler: (req, res, next) => { 
        let err = new Error('Too many login attempts from this IP, please try again after 1 minute');
        err.status = 429;
        return next(err);
    }
});