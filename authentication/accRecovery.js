const { body, validationResult } = require("express-validator");
const Users = require("../models/user/users");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config(); // Load environment variables

// Extract environment variables
const host = process.env.HOST;
const port = process.env.PORT;
const secure = process.env.SECURE === "true";
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

// Define a function to handle the "forgot password" request
const forgotPassword = async (req, res) => {
  // Validate the email input
  await body("email").isEmail().normalizeEmail().run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;

  try {
    // Find a user with the provided email address
    const user = await Users.findOne({ where: { email: email } });
    if (!user) {
      // If the user does not exist, return an error response
      return res.status(401).json({
        success: false,
        message: "Email Does Not Exist",
      });
    } else {
      // Generate a JWT token for password reset
      const token = jwt.sign(
        { userId: user.id },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "10m",
        }
      );

      // Create a nodemailer transporter for sending emails
      const transporter = nodemailer.createTransport({
        host: host,
        port: port,
        secure: secure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      // Send an email with a link for password reset
      await transporter.sendMail({
        from: smtpUser,
        to: email,
        subject: "Reset Password",
        html: `<p>You requested to reset your password. Click on the following link to proceed: 
               <a href="http://localhost:3000/reset-password/${user.id}/${token}">Reset Password</a>. This link will expire in 10 minutes.</p>`,
      });

      // Respond with a success message
      res.status(200).json({ message: "Recovery email sent" });
    }
  } catch (error) {
    // Handle server errors
    res.status(500).json({ message: error.message });
  }
};

// Define a function to handle the "reset password" request
const resetPassword = async (req, res) => {
  // Validate the new password and confirmPassword inputs
  await body("newPassword").isLength({ min: 6 }).run(req);
  await body("confirmPassword").isLength({ min: 6 }).run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }


  // getting information from the frontend form when a client enter the password
  const { newPassword, confirmPassword } = req.body;
  const { token } = req.params;
// verifying the two password match
  if (newPassword === confirmPassword) {
    try {
      // Verify the JWT token
      const decryptedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      const userId = decryptedToken.userId;

      // Encrypt the new password and update the user's password in the database
      const encryptPassword = await bcrypt.hash(newPassword, 10);
// updating the password based on the id this means the currently logged in user
      const updatedUser = await Users.update(
        { password: encryptPassword },
        { where: { id: userId } }
      );

      // Respond with a success message and the updated user
      res.status(200).json({
        success: true,
        user: updatedUser,
      });
    } catch (error) {
      // Handle token verification errors
      res
        .status(402)
        .json({ success: false, message: "Invalid or expired token" });
    }
  } else {
    // this is when  passwords do not match, return an error
    return res.status(401).json({
      success: false,
      message: "Password Does Not Match",
    });
  }
};

// Export the functions for the  routes
module.exports = {
  forgotPassword,
  resetPassword,
};