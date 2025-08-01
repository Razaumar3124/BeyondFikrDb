const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const { User } = require("../model/model");
require("dotenv").config();

// === FORGOT PASSWORD ===
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    // Respond always with 200 for security reasons
    if (!user) {
      return res.status(200).json({ message: "If the email exists, a reset link will be sent." });
    }

    // Generate reset token and expiry (1 hour)
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = Date.now() + 3600000;

    user.resetToken = token;
    user.resetTokenExpiry = expiry;
    await user.save();

    // Frontend reset password link
    const resetLink = `https://www.beyondfikr.com/reset?token=${token}`;

    // Configure mail transport
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Email template
    const mailOptions = {
      to: email,
      from: `"BeyondFikr Support" info@beyondfikr.com>`,
      subject: "Password Reset Request",
      html: `
        <h3>Password Reset</h3>
        <p>We received a request to reset your password. Click the link below to choose a new one:</p>
        <a href="${resetLink}" target="_blank">${resetLink}</a>
        <p>This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: "Reset link sent to your email." });

  } catch (error) {
    return res.status(500).json({ message: "Something went wrong. Please try again later." });
  }
});


// === RESET PASSWORD ===
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: "Token and new password are required." });
  }

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Token is invalid or expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    return res.status(200).json({ message: "Password reset successful" });

  } catch (error) {
    return res.status(500).json({ message: "Something went wrong. Please try again later." });
  }
});


module.exports = router;
