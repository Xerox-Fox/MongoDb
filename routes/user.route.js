require('dotenv').config(); // Load environment variables

const express = require('express');
const User = require('../models/user.model'); // Adjust path as needed
const router = express.Router();
const bcrypt = require('bcrypt'); // Import bcrypt for password comparison
const nodemailer = require('nodemailer'); // Import Nodemailer

// Setup Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use Gmail's service
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Use your App Password here
    },
});

// Signup Route
router.post('/signup', async (req, res) => {
    try {
        const { email, password, confirmPassword, contact } = req.body;

        // Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }
        
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            // Create a new user
            const user = new User({
                email,
                password,
                contact
            });

            // Save the user to the database
            const savedUser = await user.save();
            console.log(savedUser);
            res.json(savedUser);
        } else {
            res.status(400).json({
                message: 'Can\'t signup with the same email again'
            });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Signin Route
router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });

        if (user) {
            // Compare the provided password with the stored hashed password
            const isMatch = await bcrypt.compare(password, user.password);

            if (isMatch) {
                res.json(user);
            } else {
                res.status(401).json({ message: 'Invalid password' });
            }
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Send ID Route with Nodemailer
router.post('/send-id', async (req, res) => {
    try {
        const { email } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const mailOptions = {
            from: process.env.EMAIL_USER, // Sender address
            to: user.email, // List of receivers
            subject: 'User ID Information', // Subject line
            html: `<h1>Hello ${user.email}</h1><p>Your user ID is: ${user._id}</p>`, // HTML body
        };

        await transporter.sendMail(mailOptions);
        console.log("Message sent successfully");

        res.json({ message: 'Email sent successfully' });
        // Inside the /send-id route
        console.log('Sending email to:', user.email);
        console.log('User ID:', user._id);


    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
