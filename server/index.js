const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const analyzeRoute = require('./routes/analyzeRoute'); // <--- 1. Import Route

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("🔥 MongoDB Connected Successfully!"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Routes
app.use('/api/analyze', analyzeRoute); // <--- 2. Use Route

app.get('/', (req, res) => {
    res.json({ message: "TrueView AI Backend is Running & Connected!" });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on Port ${PORT}`);
});