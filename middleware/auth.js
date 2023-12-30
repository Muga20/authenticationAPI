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
const verifyToken = (req, res, next) => {
  // const { authorization } = req.headers;

  const authorization = req.header("Authorization");

  // Add a failedAttempts property to the request object
  if (!req.failedAttempts) {
    req.failedAttempts = 0;
  }

  if (!authorization) {
    return res.status(401).json({ error: "Authorization token required" });
  }

  const token = authorization.split(" ")[1];
  try {
    // Verify the access token using the ACCESS_TOKEN_SECRET
    const user = jwt.verify(token, ACCESS_TOKEN_SECRET);

    // Attach the decoded user data to the req object
    req.user = user;

    // Check if the token has expired
    const nowInSeconds = Date.now() / 1000;
    if (user.exp < nowInSeconds) {
      // Check if there is a refresh token in the request
      const refreshToken = req.headers["x-refresh-token"];
      if (!refreshToken) {
        return res
          .status(401)
          .json({ error: "Token has expired. Please reauthenticate." });
      }

      // Attempt to refresh the access token using the refresh token
      try {
        // Verify the refresh token using the REFRESH_TOKEN_SECRET to get the userId
        const { userId } = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

        // Generate a new access token with the updated user data and set it in the req.user
        const accessToken = issueAccessToken(userId).accessToken;
        req.user = jwt.verify(accessToken, ACCESS_TOKEN_SECRET); // Update the user data in the request
        next();
      } catch (error) {
        return res
          .status(401)
          .json({
            error: "Invalid or expired refresh token. Please reauthenticate.",
          });
      }
    } else {
      // Reset the failedAttempts counter if token verification is successful
      req.failedAttempts = 0;
      next();
    }
  } catch (error) {
    console.log("Error:", error);
    req.failedAttempts++;

    try {
      // Check if the user has reached the maximum allowed failed attempts
      if (req.failedAttempts >= MAX_ALLOWED_FAILED_ATTEMPTS) {
        // Suspend the user's account for a day (24 hours)
        const suspensionTimeInMilliseconds = 24 * 60 * 60 * 1000;
        const suspensionEndTime = Date.now() + suspensionTimeInMilliseconds;

        return res.status(403).json({
          error:
            "Too many failed attempts. Your account is suspended for a day.",
        });
      }

      res.status(401).json({ error: "Request is not authorized" });
    } catch (error) {
      // Handle any errors that occur during suspension processing
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
const issueAccessToken = (userId, email, registrationToken, role) => {
  const accessToken = jwt.sign(
    { userId, email, registrationToken, role },
    ACCESS_TOKEN_SECRET,
    {
      expiresIn: TOKEN_EXPIRATION_TIME,
    }
  );

  // Generate a new refresh token for the provided userId and return both tokens
  const refreshToken = issueRefreshToken(userId);
  return { accessToken, refreshToken };
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
