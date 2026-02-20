const express = require('express');
const router = express.Router();
const axios = require('axios');
const Product = require('../models/Product');

// POST http://localhost:5001/api/analyze
router.post('/', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: "URL is required" });
        }

        // 1. Check if we already analyzed this exact URL (Cache)
        let existingProduct = await Product.findOne({ url });
        if (existingProduct) {
            console.log("📦 Found in Database!");
            return res.json({ message: "Found in Cache", data: existingProduct });
        }

        console.log(`🐍 Sending URL to Python Engine: ${url}`);

        // 2. Call the Python Microservice (Running on Port 6000)
        const pythonResponse = await axios.post('http://127.0.0.1:6000/scan', { url });
        const scrapedData = pythonResponse.data;

        // 3. Prepare the final data to save (Mixing scraped data with mock AI for now)
        const newAnalysis = {
            url: url,
            productName: scrapedData.productName || "Unknown Product",
            platform: scrapedData.platform || "Amazon",
            trustScore: Math.floor(Math.random() * (95 - 40 + 1)) + 40, // Random score between 40-95 for now
            summary: {
                pros: ["Verified Purchase Patterns", "Consistent Review Dates"],
                cons: ["Some generic 5-star reviews"],
                verdict: scrapedData.status === "Scraped Successfully" ? "Pending AI Verdict" : "Error"
            },
            totalReviews: 0,
            fakeReviewsDetected: 0
        };

        // 4. Save to MongoDB
        const newProduct = new Product(newAnalysis);
        await newProduct.save();

        console.log("✅ Analysis Saved to DB!");
        res.json({ message: "Analysis Complete", data: newProduct });

    } catch (error) {
        console.error("❌ Backend Error:", error.message);
        res.status(500).json({ error: "Failed to analyze product. Is Python running?", details: error.message });
    }
});

module.exports = router;