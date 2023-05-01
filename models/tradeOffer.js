const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for a trade offer
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
    { timestamps: true }); // Automatically track creation and update timestamps

// Export the trade offer model based on the schema
module.exports = mongoose.model('TradeOffer', tradeOfferSchema);
