const { body, validationResult } = require("express-validator");
const { Op } = require("sequelize");
const Users = require("../models/users");
const Roles = require("../models/roles");
const bcrypt = require("bcrypt");

require("dotenv").config();
const { issueAccessToken, issueRefreshToken } = require("../middleware/auth");

const login = async (req, res) => {
  try {
    // Validate emailOrUsername and password using express-validator
    await body("emailOrUsername").isLength({ min: 3 }).trim().escape().run(req);
    await body("password").isLength({ min: 6 }).run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // If there are validation errors, return a 400 status with the error details
      return res.status(400).json({ errors: errors.array() });
    }

    const { emailOrUsername, password } = req.body;

    // Check if the user exists in the database by searching for the provided emailOrUsername
    const user = await Users.findOne({
      where: {
        [Op.or]: [{ username: emailOrUsername }, { email: emailOrUsername }],
      },
      include: [{ model: Roles }],
    });

    if (!user) {
      // If the user is not found, return a 404 status with an error message
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.isActive) {
      // If the user is inactive, return a 403 status with an error message
      return res.status(403).json({ error: "Your account is inactive" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      // If the password is incorrect, return a 401 status with an error message
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // If the password is correct, proceed with user login

    // Create a data object containing all user properties except password and registrationToken
    const data = {
      id: user.id,
      roles: user.roles.map((role) => role.role),
    };

    // Issue the access token with the user data (excluding password and registrationToken)
    const accessToken = issueAccessToken(data);

    // Issue a new refresh token and update the user's refresh token in the database
    const refreshToken = issueRefreshToken(data.id);

    user.refreshToken = refreshToken;

    await user.save();

    // Set the user data in an HTTP-only cookie
    res.cookie("user", JSON.stringify(data), {
      httpOnly: true, // Set the HttpOnly attribute
    });

    // Return the access token in the response
    res.json({
      accessToken,
    });
  } catch (error) {
    // Handle any unexpected errors that occur during login
    console.error("Error in login:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const logout = async (req, res) => {
  res
    .clearCookie("user", {
      secure: true,
      sameSite: "none",

    })
    .status(200)
    .json({
      success: true,
      message: "succesfuly logged  out",
    });
};

module.exports = { login, logout };