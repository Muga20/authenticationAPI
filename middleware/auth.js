const jwt = require("jsonwebtoken"); // Import the JSON Web Token library
const dotenv = require("dotenv"); // Import the dotenv library for loading environment variables from .env file
dotenv.config(); // Load environment variables from .env file

// Constants for controlling authentication behavior
const MAX_ALLOWED_FAILED_ATTEMPTS = 3; // Maximum allowed failed attempts for authentication
const TOKEN_EXPIRATION_TIME = "1d"; // Set the token expiration time (e.g., 1 hour)
const REFRESH_TOKEN_EXPIRATION_TIME = "7d"; // Set the refresh token expiration time (e.g., 7 days)

// Access and refresh token secret keys loaded from environment variables
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

// An array to maintain a list of refresh tokens for blacklisting (optional)
let refreshTokens = [];

/**
 * Middleware function for token verification.
 * This function checks the authorization header for a valid access token, verifies its authenticity,
 * and attaches the decoded user data to the req object.
 * It also handles token expiration, token refreshing, and failed attempts.
 * If the token is valid, it calls the next middleware or route handler.
 * Otherwise, it responds with the appropriate error status.
 */
const verifyToken = async (req, res, next) => {
  const authorization = req.header("Authorization");

  if (!req.failedAttempts) {
    req.failedAttempts = 0;
  }

  if (!authorization) {
    return res.status(401).json({ error: "Authorization token required" });
  }

  const token = authorization.split(" ")[1];
  try {
    const decodedToken = jwt.verify(token, ACCESS_TOKEN_SECRET);
    req.user = decodedToken;

    // Extract user ID from the token
    const userId = decodedToken.userId;

    const nowInSeconds = Date.now() / 1000;
    if (decodedToken.exp < nowInSeconds) {
      const refreshToken = req.headers["x-refresh-token"];
      if (!refreshToken) {
        return res
            .status(401)
            .json({ error: "Token has expired. Please reauthenticate." });
      }

      try {
        const decodedRefreshToken = jwt.verify(
            refreshToken,
            REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(userId);

        if (!user) {
          return res.status(401).json({ error: "User not found" });
        }

        const newAccessToken = jwt.sign(
            { userId: user._id },
            ACCESS_TOKEN_SECRET,
            { expiresIn: TOKEN_EXPIRATION_TIME }
        );

        req.user = user;

        res.set("Authorization", `Bearer ${newAccessToken}`);

        next();
      } catch (error) {
        return res.status(401).json({
          error: "Invalid or expired refresh token. Please reauthenticate.",
        });
      }
    } else {
      req.failedAttempts = 0;
      next();
    }
  } catch (error) {
    console.log("Error:", error);
    req.failedAttempts++;

    try {
      if (req.failedAttempts >= MAX_ALLOWED_FAILED_ATTEMPTS) {
        const suspensionTimeInMilliseconds = 24 * 60 * 60 * 1000;
        const suspensionEndTime = Date.now() + suspensionTimeInMilliseconds;

        return res.status(403).json({
          error:
              "Too many failed attempts. Your account is suspended for a day.",
        });
      }

      res.status(401).json({ error: "Request is not authorized" });
    } catch (error) {
      console.error("Suspension Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};

/**
 * Function to issue a new access token with the provided user data (userId, email, registrationToken, and role) as the   payload.
 * The token is signed using the ACCESS_TOKEN_SECRET and its expiration is set based on TOKEN_EXPIRATION_TIME.
 * It also calls issueRefreshToken(userId) to generate a new refresh token and returns both tokens as an object.
 */


const issueAccessToken = (userId) => {
  // Sign the JWT with the user identifier
  return jwt.sign({ userId }, ACCESS_TOKEN_SECRET, {
    expiresIn: TOKEN_EXPIRATION_TIME,
  });
};


/**
 * Function to issue a new refresh token for the specified userId.
 * The token is signed using the REFRESH_TOKEN_SECRET and its expiration is set based on REFRESH_TOKEN_EXPIRATION_TIME.
 * The refresh token is stored in the refreshTokens array for later blacklisting (optional).
 */
const issueRefreshToken = (userId) => {

  const refreshToken = jwt.sign({ userId }, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRATION_TIME,
  });
  // Store the refresh token for blacklisting (optional)
  refreshTokens.push(refreshToken);
  return refreshToken;
};

/**
 * Function to revoke a refresh token by removing it from the refreshTokens array, effectively blacklisting it.
 * This function can be used when logging out or for additional security measures (optional).
 */
const revokeRefreshToken = (token) => {
  refreshTokens = refreshTokens.filter((t) => t !== token);
};

// Export all the functions as part of the module
module.exports = {
  verifyToken,
  issueAccessToken,
  issueRefreshToken,
  revokeRefreshToken,
};