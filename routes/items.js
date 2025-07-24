const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // ✅ use bcryptjs if installed via `npm i bcryptjs`

const { User, Blog } = require("../model/model");

// GET /db → Return full MongoDB collections
router.get("/", async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const databaseData = {};

    for (const collection of collections) {
      const coll = mongoose.connection.db.collection(collection.name);
      const docs = await coll.find({}).toArray();
      databaseData[collection.name] = docs;
    }

    res.json(databaseData);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch database" });
  }
});

// POST /db/Users → Signup route with duplicate check and hashed password
router.post("/Users", async (req, res) => {
  try {
    const { email, contact, password, date, isAdmin } = req.body;

    // ✅ Validate input
    if (!email || !contact || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ Check for existing user
    const existingUser = await User.findOne({
      $or: [{ email }, { contact }]
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists with this email or contact number"
      });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create user
    const newUser = new User({
      email,
      contact,
      password: hashedPassword,
      date: date || Date.now(),
      isAdmin: isAdmin || false
    });

    await newUser.save();

    // ✅ Return only safe user fields (do not return password)
    const responseUser = {
      _id: newUser._id,
      email: newUser.email,
      contact: newUser.contact,
      date: newUser.date,
      isAdmin: newUser.isAdmin
    };

    res.status(201).json({ message: "User created successfully", user: responseUser });
  } catch (error) {
    res.status(500).json({ message: "User creation failed" });
  }
});

module.exports = router;
