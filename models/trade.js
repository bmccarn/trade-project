const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for a trade
const tradeSchema = new Schema({
    itemName: { type: String, required: [true, 'Item name is required'] },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: [true, 'Category is required'] },
    details: {
        type: String, required: [true, 'Details are required'],
        minlength: [10, 'Details must be at least 10 characters long']
    },
    status: {
        type: String,
        default: 'Available',
        enum: ['Available', 'Pending', 'Traded'],
        required: true
    },
    image: { type: String, default: '/images/camera_placeholder.png' },
},
    { timestamps: true }); // Automatically track creation and update timestamps

// Export the trade model based on the schema
module.exports = mongoose.model('Trade', tradeSchema);
