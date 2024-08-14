require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

// Initialize the Express app
const app = express();

// Set the port
const port = process.env.PORT || 8080;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/pdb")
.then(() => console.log('Database connected'))
.catch(err => console.log('Database connection error:', err));

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routes
app.use('/api/users', require('./routes/user.route'));

// Start the server
app.listen(port, () => {
    console.log(`Started Server`);
    console.log(`Server running on port ${port}`);
});
