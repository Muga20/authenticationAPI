const Roles = require("../models/roles");
const { body, validationResult } = require("express-validator");
const Users = require("../models/users");
const { validateNames } = require('../utils/validation');

// Define a function to retrieve all roles
const getRoles = async (req, res) => {
  try {
    // Query the database to retrieve all roles
    const roles = await Roles.findAll();

    // Respond with a JSON object containing the retrieved roles
    res.json({ roles });
  } catch (error) {
    // Handle server errors by responding with a 500 status and an error message
    res.status(500).json({ error: error.message });
  }
};

// Define a function to create a new role
const createRole = async (req, res) => {
  const { RoleName, RoleNumber } = req.body;

  // Validation checks for RoleName
  if (!validateNames(RoleName)) {
    return res.status(400).json({ error: 'Invalid Role Name' });
  }

  try {
    // Check if a role with the same name already exists
    const existingRole = await Roles.findOne({ where: { role: RoleName } });
    if (existingRole) {
      return res.status(400).json({ error: 'Role Name already exists' });
    }

    // Create a new role in the database
    const role = await Roles.create({
      role: RoleName,
      role_number: RoleNumber,
    });

    // Respond with a JSON object containing the created role
    res.json({ data: role });

  } catch (error) {
    // Handle errors during role creation
    console.error("Error creating role:", error);
    // Provide a more informative error response
    res.status(500).json({ error: "An error occurred while creating the role." });
  }
};

const deleteRole = async (req, res) => {
  try {
    const roleId = req.params.id; // Assuming you have a route parameter for roleId
    // Check if the role exists
    const role = await Roles.findByPk(roleId);

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    // Delete the role from the database
    await role.destroy();

    res.json({ message: "Role deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const create_users_roles = async (req, res) => {
  try {
    const { username, roleId } = req.body;

    // Find the user by username in the "users" table
    const user = await Users.findOne({ where: { username: username } });

    if (!user) {
      // If the user does not exist, return a 404 status with an error message
      return res.status(400).json({success: false, message: "User not found check the username again"});
   }

    // Find the role by roleId in the "roles" table
    const role = await Roles.findByPk(roleId);

    if (!role) {
      // If the role does not exist, return a 404 status with an error message
      return res.status(404).json({success: false, message: "Role not found" });
    }

    // Create a new user-role association using the many-to-many relationship
    await user.addRole(role);

    // Return a success response
    res.status(201).json({ message: "User role created successfully" });
  } catch (error) {
    // Handle server errors by responding with a 500 status and an error message
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getRoles,
  createRole,
  deleteRole,
  create_users_roles,
};
