const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tradeSchema = new Schema({
    itemName: { type: String, required: [true, 'Item name is required'] },
    category: { type: String, required: [true, 'Category is required'] },
    details: {
        type: String, required: [true, 'Details are required'],
        minlength: [10, 'Details must be at least 10 characters long']
    },
    status: { type: String, required: [true, 'Status is required'] },
},
    { timestamps: true });

    module.exports = mongoose.model('Trade', tradeSchema);