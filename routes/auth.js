// routes/auth.js or add to items.js
const express = require("express");
const router = express.Router();
const { User } = require("../model/model");

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    // 1. Check if email is provided
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // 2. Check if user with this email exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User with this email does not exist" });
    }

    // 3. Simulate sending reset link (you can enhance this with real email logic later)
    console.log(`Reset link would be sent to: ${email}`);

    return res.status(200).json({ message: "Password reset link sent to your email" });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
