const express = require('express');
const controller = require('../controllers/tradeController');

const router = express.Router();

//GET request to /trades: send all trades to the user

router.get('/', controller.index);

//Get /trades/new: send the form to the user

router.get('/new', controller.new);

//POST /trades: create a new trade

router.post('/', controller.create);

//GET /trades/:id: send details of trade identified by id

router.get('/:id', controller.show);

//GET /storues/:id/edit: send html form for editing an existing trade

router.get('/:id/edit', controller.edit);

//PUT /trades/:id: update the trade identified by id

router.put('/:id', controller.update);

//DELETE /trades/:id: delete the trade identified by id

router.delete('/:id', controller.delete);

module.exports = router;