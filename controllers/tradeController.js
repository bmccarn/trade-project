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

    trade.save()
        .then(trade => res.redirect('/trades'))
        .catch(err => {
            if (err.name === 'ValidationError') {
                err.status = 400;
            }
            next(err);
        });
};

exports.show = (req, res, next) => {
    let id = req.params.id;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid trade id');
        err.status = 400;
        return next(err);
    }
    model.findById(id)
        .then(trade => {
            if (trade) {
                res.render('./trade/show', { trade });
            } else {
                let err = new Error('Cannot find a trade with id ' + id);
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
        let err = new Error('Invalid trade id');
        err.status = 400;
        return next(err);
    }

    trade.category = capitalizeFirstLetterOfEachWord(trade.category);

    model.findByIdAndUpdate(id, trade, { useFindAndModify: false, runValidators: true })
        .then(trade => {
            if (trade) {
                res.redirect('/trades/' + id);
            } else {
                let err = new Error('Cannot find a trade with id ' + id);
                err.status = 404;
                next(err);
            }
        })
        .catch(err => {
            if (err.name === 'ValidationError') {
                err.status = 400;
            }
            next(err);
        });
};

exports.delete = (req, res, next) => {
    let id = req.params.id;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid trade id');
        err.status = 400
        return next(err);
    }

    model.findByIdAndDelete(id, { useFindAndModify: false })
        .then(trade => {
            if (trade) {
                res.redirect('/trades');
            } else {
                let err = new Error('Cannot find a trade with id ' + id);
                err.status = 404;
                next(err);
            }
        })
        .catch(err => next(err));
};