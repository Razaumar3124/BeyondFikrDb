const mongoose = require("mongoose");

// User Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // Prevent duplicate emails
  },
  contact: {
    type: String,
    required: true,
    unique: true, // Prevent duplicate contact numbers
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  // ✅ Fields for password reset
  resetToken: {
    type: String,
    default: null,
  },
  resetTokenExpiry: {
    type: Date,
    default: null,
  },
});

// Blog Schema
const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create Models
const User = mongoose.model("User", userSchema, "users");
const Blog = mongoose.model("Blog", blogSchema, "blogs");

// Export Models
module.exports = { User, Blog };
