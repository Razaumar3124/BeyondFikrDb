const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const { User } = require("../model/model"); // adjust path if needed

// FORGOT PASSWORD
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ message: "If the email exists, a reset link will be sent." });
    }

    // Generate token and expiry
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = Date.now() + 3600000; // 1 hour

    user.resetToken = token;
    user.resetTokenExpiry = expiry;
    await user.save();

    const resetLink = `http://localhost:3000/reset-password?token=${token}`;

    // Check env variables
    console.log("EMAIL_USER:", process.env.EMAIL_USER);
    console.log("EMAIL_PASS present:", !!process.env.EMAIL_PASS);

    // Transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send reset email
    await transporter.sendMail({
      to: email,
      from: "no-reply@yourapp.com",
      subject: "Password Reset",
      html: `
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link will expire in 1 hour.</p>
      `,
    });

    console.log("✅ Reset email sent to:", email);
    res.status(200).json({ message: "Reset link sent to email." });

  } catch (error) {
    console.error("❌ Forgot password error:", error);
    res.status(500).json({ message: "Server error. Try again." });
  }
});

// RESET PASSWORD
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      console.log("⚠️ Invalid or expired token");
      return res.status(400).json({ message: "Token is invalid or expired" });
    }

    console.log("🔐 Hashing new password...");
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    console.log("✅ Password reset successful for:", user.email);
    res.status(200).json({ message: "Password reset successful" });

  } catch (error) {
    console.error("❌ Reset password error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;
