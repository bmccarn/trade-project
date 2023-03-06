const model = require('../models/trade');

exports.index = (req, res) => {
    let trades = model.find();
    res.render('./trade/index', { trades });
}

exports.new = (req, res) => {
    res.render('./trade/new');
}

exports.create = (req, res) => {
    let trade = req.body;
    model.save(trade);
    res.redirect('/trades');
}

exports.show = (req, res, next) => {
    let id = req.params.id;
    let trade = model.findById(id);
    if (trade) {
        res.render('./trade/show', { trade });
    } else {
        let err = new Error('Cannot find a trade with id ' + id);
        err.status = 404;
        next(err);
    }
}

exports.edit = (req, res, next) => {
    let id = req.params.id;
    let trade = model.findById(id);
    if (trade) {
        res.render('./trade/edit', { trade });
    } else {
        let err = new Error('Cannot find a trade with id ' + id);
        err.status = 404;
        next(err);
    }
}

exports.update = (req, res, next) => {
    let trade = req.body;
    let id = req.params.id;
   
    if (model.updateById(id, trade)) {
        res.redirect('/trades/' + id);
    } else {
        let err = new Error('Cannot find a trade with id ' + id);
        err.status = 404;
        next(err);
    }
    
    
}

exports.delete = (req, res, next) => {
    let id = req.params.id;
    if (model.deleteById(id)) {
        res.redirect('/trades');
    } else {
        let err = new Error('Cannot find a trade with id ' + id);
        err.status = 404;
        next(err);
    }
}