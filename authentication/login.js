const { body, validationResult } = require("express-validator");
const { Op } = require("sequelize");
const Users = require("../models/users");
const Roles = require("../models/roles");
const bcrypt = require("bcrypt");

require("dotenv").config();
const { issueAccessToken, issueRefreshToken } = require("../middleware/auth");
const {validatePassword} = require("../utils/validation");

const login = async (req, res) => {
  try {

    const { emailOrUsername, password } = req.body;

    if (!validatePassword(password)) {
      return res.status(400).json({ error: 'Invalid Password' });
    }

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


    const accessToken = issueAccessToken( user.id,);
    const refreshToken = issueRefreshToken(  user.id );

    user.refreshToken = refreshToken;

    await user.save();

    res.cookie('user_session', accessToken, {
      maxAge: 7200000,
      httpOnly: true,
      secure: false,
    });

    res.json({
      success: true, message: 'logged in successfully'
    });

  } catch (error) {
    // Handle any unexpected errors that occur during login
    console.error("Error in login:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const logOut = async (req, res) => {
  res.cookie('user_session', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  })
      .status(200)
      .json({success: true, message: 'Logged out successfully'})
}

module.exports = { login, logOut };