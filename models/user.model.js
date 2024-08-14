require('dotenv').config();
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

// Define the saltRounds for bcrypt hashing
const saltRounds = 10;

// Function to hash the password
async function hashPassword(password) {
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    throw new Error('Error hashing password');
  }
}

// Define the User schema
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  contact: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^(\d{7,15})$/.test(v);
      },
      message: "Please provide a valid contact number."
    }
  }
});

// Pre-save middleware to hash the password
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    try {
      this.password = await hashPassword(this.password);
      next();
    } catch (error) {
      console.error('Error hashing password:', error);
      next(error);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model('User', userSchema);
