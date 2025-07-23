const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
const userRoutes = require("./routes/items");
const authRoutes = require("./routes/auth"); // 👈 Add this line

app.use("/db", userRoutes);                 // Existing route
app.use("/api/auth", authRoutes);           // 👈 Mount new auth route

// Start server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
