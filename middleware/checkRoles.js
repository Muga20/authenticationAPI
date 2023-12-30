const isAdmin = (req, res, next) => {
  try {
    // Retrieve the user's access token from the request
    const accessToken = req.user;
    // Extract the user ID from the access token
    const roles = accessToken.userId.roles;

    // Check if the user has the "admin" role
    if (roles.includes("admin")) {
      next();
    } else {
      res.status(403).send({
        message: "Require Admin Role!",
      });
    }
  } catch (error) {
    // Handle token verification errors
    res.status(401).json({ error: "Invalid token" });
  }
};

const isVerified = (req, res, next) => {
  try {
    // Retrieve the user's access token from the request
    const accessToken = req.user;
    // Extract the user ID from the access token
    const roles = accessToken.userId.roles;

    // Check if the user is verified
    if (roles.includes("verified")) {
      next();
    } else {
      res.status(403).send({
        message: "User is not verified!",
      });
    }
  } catch (error) {
    // Handle token verification errors
    res.status(401).json({ error: "Invalid token" });
  }
};

const isArtist = (req, res, next) => {
  try {
    // Retrieve the user's access token from the request
    const accessToken = req.user;
    // Extract the user ID from the access token
    const roles = accessToken.userId.roles;

    // Check if the user is an artist
    if (roles.includes("artist")) {
      next();
    } else {
      res.status(403).send({
        message: "User is not an artist!",
      });
    }
  } catch (error) {
    // Handle token verification errors
    res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = { isAdmin, isVerified, isArtist };
