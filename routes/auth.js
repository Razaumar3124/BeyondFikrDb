const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const { User } = require("../model/model");
require("dotenv").config(); // Ensure env is loaded

// === FORGOT PASSWORD ===
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    // Always respond success (for security reasons)
    if (!user) {
      return res.status(200).json({ message: "If the email exists, a reset link will be sent." });
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = Date.now() + 3600000; // 1 hour

    user.resetToken = token;
    user.resetTokenExpiry = expiry;
    await user.save();

    // Frontend reset link
    const resetLink = `http://localhost:5173/reset?token=${token}`;

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email content
    await transporter.sendMail({
      to: email,
      from: "no-reply@yourapp.com",
      subject: "Password Reset Request",
      html: `
        <h3>Reset your password</h3>
        <p>Click the link below to reset your password. This link is valid for 1 hour:</p>
        <a href="${resetLink}">${resetLink}</a>
      `,
    });

    console.log(`✅ Password reset email sent to ${email}`);
    return res.status(200).json({ message: "Reset link sent to your email." });

  } catch (error) {
    console.error("❌ Forgot-password error:", error);
    return res.status(500).json({ message: "Something went wrong. Please try again later." });
  }
});

// === RESET PASSWORD ===
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      console.warn("⚠️ Token expired or invalid");
      return res.status(400).json({ message: "Token is invalid or expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    console.log(`✅ Password successfully reset for ${user.email}`);
    return res.status(200).json({ message: "Password reset successful" });

  } catch (error) {
    console.error("❌ Reset-password error:", error);
    return res.status(500).json({ message: "Something went wrong. Please try again later." });
  }
});

module.exports = router;
