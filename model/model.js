const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: String,
  mobile: String,
  password: String,
  isAdmin: Boolean,
  date: {
    type: Date,
    default: Date.now,
  },
});

const blogSchema = new mongoose.Schema({
  blogname: String,
});

const User = mongoose.model("User", userSchema);
const Blog = mongoose.model("Blog", blogSchema);

module.exports = { User, Blog };
