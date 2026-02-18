const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    url: { type: String, required: true },
    productName: { type: String },
    platform: { type: String },
    trustScore: { type: Number }, 
    analysisDate: { type: Date, default: Date.now },
    
    
    summary: {
        pros: [String],
        cons: [String],
        verdict: String 
    },

   
    totalReviews: Number,
    fakeReviewsDetected: Number
});

module.exports = mongoose.model('Product', ProductSchema);