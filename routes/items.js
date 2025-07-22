const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

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
    console.error("Error fetching database:", error);
    res.status(500).json({ message: "Failed to fetch database", error });
  }
});

// POST /db/Users → Create a new user (with duplicate check)
router.post("/Users", async (req, res) => {
  try {
    const { email, contact, password, date, isAdmin } = req.body;

    // Check for required fields
    if (!email || !contact || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check for existing user by email or contact
    const existingUser = await User.findOne({
      $or: [{ email }, { contact }]
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists with this email or contact number",
      });
    }

    // Create and save new user
    const newUser = new User({
      email,
      contact,
      password,
      date: date || Date.now(),
      isAdmin: isAdmin || false,
    });

    await newUser.save();
    res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "User creation failed", error });
  }
});

module.exports = router;
