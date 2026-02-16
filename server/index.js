const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: "TrueView AI Backend is Running!" });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on Port ${PORT}`);
});