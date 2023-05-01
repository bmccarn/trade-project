const rateLimit = require('express-rate-limit');

// Limit the number of requests per IP address in a given time
exports.logInLimiter = rateLimit({
    windowMS: 60 * 1000, 
    max: 5,
    handler: (req, res, next) => { 
        let err = new Error('Too many login attempts from this IP, please try again after 1 minute');
        err.status = 429;
        return next(err);
    }
});