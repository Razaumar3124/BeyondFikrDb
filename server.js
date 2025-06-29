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
app.use("/db", userRoutes);  // This enables the user route

// Start server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
