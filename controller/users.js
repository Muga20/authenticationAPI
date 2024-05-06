const Users = require("../models/users");
require("dotenv").config();
const Roles = require("../models/roles");


const getUsers = async (req, res) => {
  try {
    const users = await Users.findAll({
      include: [
        // Include the Roles model to fetch the user roles
        {
          model: Roles,
          through: "UserRoles",
        },
      ],
    }); // Fetch all users from the database
    res.status(200).send(users);
    // Return all users as JSON response to the client side application making the request to this API endpoint (route) with the GET method .
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getUserById = async (req, res) => {
  try {
    const accessToken = req.user;

    console.log(accessToken)
    const user_id = accessToken.userId;

    const user = await Users.findByPk(user_id, {
      // Fetch the user by primary key (id)
      include: [
        // Include the Roles model to fetch the user roles
        {
          model: Roles,
          through: "UserRoles",
        },
      ],
    });

    if (user) {
      // Extract the role names from the user object
      const roleNames = user.roles.map((role) => role.role);

      res.json({ roleNames, user }); // Sending only the role names in the response and the user data
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
  getUsers,
  getUserById,
};
