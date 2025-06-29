const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

router.get("/", async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const databaseData = {};

    for (const collection of collections) {
      const coll = mongoose.connection.db.collection(collection.name);
      const docs = await coll.find({}).toArray();
      databaseData[collection.name] = docs;
    }
    console.log(databaseData);
    res.json(databaseData);
  } catch (error) {
    console.error("Error fetching database:", error);
    res.status(500).json({ message: "Failed to fetch database", error });
  }
});

module.exports = router;
