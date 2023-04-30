const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tradeOfferSchema = new Schema({
    offeredItem: { type: Schema.Types.ObjectId, ref: 'Trade', required: true },
    requestedItem: { type: Schema.Types.ObjectId, ref: 'Trade', required: true },
    offererUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        default: 'Pending',
        enum: ['Pending', 'Accepted'],
        required: true
    },
},
    { timestamps: true });

module.exports = mongoose.model('TradeOffer', tradeOfferSchema);
