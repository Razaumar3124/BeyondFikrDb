const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  contact: { type: String, required: true },
  password: { type: String, required: true },
  date: { type: Date, default: Date.now },
  isAdmin: { type: Boolean, default: false },
});

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema, "users");
const Blog = mongoose.model("Blog", blogSchema, "blogs");

module.exports = { User, Blog };