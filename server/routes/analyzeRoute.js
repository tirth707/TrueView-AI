const express = require('express');
const router = express.Router();
const Product = require('../models/Product'); // Import your DB Model

// POST http://localhost:5001/api/analyze
router.post('/', async (req, res) => {
    try {
        const { url } = req.body;

        // 1. Check: Have we analyzed this URL before?
        let existingProduct = await Product.findOne({ url });
        if (existingProduct) {
            return res.json({ message: "Found in Cache", data: existingProduct });
        }

        // 2. Mock Analysis (Placeholder for your AI Logic)
        // Later, we will put the Python/AI script here.
        const mockData = {
            url: url,
            productName: "Sony WH-1000XM5 Wireless Headphones",
            platform: url.includes("amazon") ? "Amazon" : "Flipkart",
            trustScore: 88,
            summary: {
                pros: ["Amazing Noise Cancellation", "Lightweight", "Good Battery"],
                cons: ["Expensive", "No Water Resistance"],
                verdict: "Safe Buy"
            },
            totalReviews: 1500,
            fakeReviewsDetected: 120
        };

        // 3. Save to MongoDB
        const newProduct = new Product(mockData);
        await newProduct.save();

        res.json({ message: "Analysis Complete", data: newProduct });

    } catch (error) {
        res.status(500).json({ error: "Server Error", details: error.message });
    }
});

module.exports = router;