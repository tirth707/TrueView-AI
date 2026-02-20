const express = require('express');
const router = express.Router();
const axios = require('axios');
const Product = require('../models/Product');

router.post('/', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: "URL is required" });
        }

        let existingProduct = await Product.findOne({ url });
        if (existingProduct) {
            console.log("📦 Found in Database Cache!");
            return res.json({ message: "Found in Cache", data: existingProduct });
        }

        console.log(`🐍 Sending URL to Python Engine: ${url}`);

        const pythonResponse = await axios.post('http://127.0.0.1:6000/scan', { url });
        const scrapedData = pythonResponse.data;

        // Map the real AI data from Python to our MongoDB schema
        const newAnalysis = {
            url: url,
            productName: scrapedData.productName || "Unknown Product",
            platform: scrapedData.platform || "Amazon",
            trustScore: scrapedData.trustScore || 50,
            summary: {
                pros: scrapedData.pros || ["No data"],
                cons: scrapedData.cons || ["No data"],
                verdict: scrapedData.verdict || "Error analyzing sentiment"
            },
            totalReviews: 0,
            fakeReviewsDetected: 0
        };

        const newProduct = new Product(newAnalysis);
        await newProduct.save();

        console.log("✅ Real AI Analysis Saved to DB!");
        res.json({ message: "Analysis Complete", data: newProduct });

    } catch (error) {
        console.error("❌ Backend Error:", error.message);
        res.status(500).json({ error: "Failed to analyze product. Is Python running?", details: error.message });
    }
});

module.exports = router;