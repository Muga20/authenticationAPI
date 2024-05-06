const { body, validationResult } = require("express-validator");
const Users = require("../models/users");
const Roles = require("../models/roles");
const { Op } = require("sequelize");
const { issueAccessToken } = require("../middleware/auth");
const { validateEmail, validatePassword ,validateNames } = require('../utils/validation');
const path = require("path");
const bcrypt = require("bcrypt");
const baseUrl = process.env.BASE_URL;

require("dotenv").config();

const register = async (req, res) => {
  try {
    const { email, role, firstName, lastName, username, password } = req.body;

    // Validate inputs
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid Email' });
    }
    if (!validatePassword(password)) {
      return res.status(400).json({ error: 'Invalid Password' });
    }
    if (!validateNames(firstName) || !validateNames(lastName)) {
      return res.status(400).json({ error: 'Invalid Name' });
    }

    // Check if the email or username is already registered
    const isRegistered = await Users.findOne({
      where: {
        [Op.or]: [{ email }, { username }]
      }
    });

    if (isRegistered) {
      if (isRegistered.email === email) {
        return res.status(409).json({ error: "Email already registered" });
      } else {
        return res.status(409).json({ error: "Username already registered" });
      }
    }

    // Query the database for user roles
    let roles = [];
    if (role) {
      roles = await Roles.findAll({
        where: {
          role: Array.isArray(role) ? role : [role],
        },
      });
    }

    // Get the default role if no roles were provided
    let defaultRole;
    if (roles.length === 0) {
      defaultRole = await Roles.findOne({ where: { role_number: 1 } });
    }

    // Hash the user's password for storage
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user in the database
    const user = await Users.create({
      email,
      first_name: firstName,
      last_name: lastName,
      username,
      password: hashedPassword,
      image: `${baseUrl}/${path.join("Images", "blank-profile-picture-gab6c06e5a_1920.png")}`,
    });

    // Set the user's roles based on the retrieved roles or defaultRole
    const userRoles = roles.length > 0 ? roles : [defaultRole];
    if (userRoles.length > 0) {
      await user.setRoles(userRoles);
    }

    await user.save();

    // Send a success response
    res.json({ message: "User created successfully and registration link sent to email" });
  } catch (error) {
    // Handle any errors that occur during registration
    console.error("Error in register:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  register,
};
