console.log('--- STARTING SERVER ---');
const express = require('express');
console.log('Required express');
const cors = require('cors');
console.log('Required cors');
const mongoose = require('mongoose');
console.log('Required mongoose');
require('dotenv').config();
console.log('Required dotenv');

const analyzeRoute = require('./routes/analyzeRoute'); // <--- 1. Import Route
console.log('Required analyzeRoute');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
console.log('Added middleware');

// Database Connection
console.log('Connecting to MongoDB...', process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("🔥 MongoDB Connected Successfully!"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Routes
app.use('/api/analyze', analyzeRoute); // <--- 2. Use Route
console.log('Added routes');

app.get('/', (req, res) => {
    res.json({ message: "TrueView AI Backend is Running & Connected!" });
});

console.log('Listening on port', PORT);
app.listen(PORT, () => {
    console.log(`🚀 Server running on Port ${PORT}`);
});