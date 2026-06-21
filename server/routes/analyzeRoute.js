const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');
const Product = require('../models/Product');

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

        console.log(`🤖 Analyzing URL with Gemini AI: ${url}`);

        const prompt = `You are a sophisticated E-commerce product analyzer. 
I have a product URL: ${url}
Please analyze this product. If you cannot browse the exact page, infer the typical sentiment, pros, cons, and alternatives based on the URL domain and path keywords (e.g., if it's a known product, you know the typical pros/cons and alternatives). 

Provide a structured JSON output with the following schema:
{
  "productName": "Name of the product based on URL",
  "platform": "Name of the platform (e.g., Amazon, Flipkart)",
  "trustScore": <A number from 1 to 100 indicating how trustworthy the product/reviews seem>,
  "summary": {
    "pros": ["Pro 1", "Pro 2", "Pro 3"],
    "cons": ["Con 1", "Con 2", "Con 3"],
    "verdict": "A brief 1-2 sentence verdict on whether to buy it or not"
  },
  "alternatives": [
    {
      "name": "Alternative Product 1",
      "url": "A realistic search URL or product URL",
      "score": <Alternative trust score 1-100>,
      "reason": "Why this is a good alternative"
    },
    {
      "name": "Alternative Product 2",
      "url": "A realistic search URL or product URL",
      "score": <Alternative trust score 1-100>,
      "reason": "Why this is a good alternative"
    }
  ],
  "totalReviews": <estimated total reviews number>,
  "fakeReviewsDetected": <estimated fake reviews number>
}
Only output the raw JSON, no markdown blocks.`;

        let response;
        let retries = 3;
        while (retries > 0) {
            try {
                response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                    }
                });
                break; // success
            } catch (err) {
                console.error(`Gemini API Error, retries left: ${retries - 1}`, err.message);
                retries--;
                if (retries === 0) throw err;
                await new Promise(res => setTimeout(res, 2000)); // wait 2s before retry
            }
        }

        const scrapedData = JSON.parse(response.text);

        const newAnalysis = {
            url: url,
            productName: scrapedData.productName || "Unknown Product",
            platform: scrapedData.platform || "Amazon",
            trustScore: scrapedData.trustScore || 50,
            summary: {
                pros: scrapedData.summary?.pros || ["No data"],
                cons: scrapedData.summary?.cons || ["No data"],
                verdict: scrapedData.summary?.verdict || "Error analyzing sentiment"
            },
            alternatives: scrapedData.alternatives || [],
            totalReviews: scrapedData.totalReviews || 0,
            fakeReviewsDetected: scrapedData.fakeReviewsDetected || 0
        };

        const newProduct = new Product(newAnalysis);
        await newProduct.save();

        console.log("✅ Gemini AI Analysis Saved to DB!");
        res.json({ message: "Analysis Complete", data: newProduct });

    } catch (error) {
        console.error("❌ Backend Error:", error.message);
        res.status(500).json({ error: "Failed to analyze product with AI.", details: error.message });
    }
});

module.exports = router;