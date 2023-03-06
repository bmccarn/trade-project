const model = require('../models/trade');

exports.index = (req, res) => {
    // res.send('send all trades');
    let trades = model.find();
    res.render('./trade/index', { trades });
}

exports.new = (req, res) => {
    //res.send('send the form');
    res.render('./trade/new');
}

exports.create = (req, res) => {
    //res.send('create a new trade');
    let trade = req.body;
    model.save(trade);
    res.redirect('/trades');
}

exports.show = (req, res, next) => {
    //res.send('send trade with id ' + req.params.id);
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
    //res.send('send the edit form for ' + req.params.id);
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
 //   res.send('update trade with id ' + req.params.id);
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
    //res.send('delete trade with id ' + req.params.id);
    let id = req.params.id;
    if (model.deleteById(id)) {
        res.redirect('/trades');
    } else {
        let err = new Error('Cannot find a trade with id ' + id);
        err.status = 404;
        next(err);
    }
}