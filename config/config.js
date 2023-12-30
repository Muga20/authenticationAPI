// Import and configure the 'dotenv' package to load environment variables from a .env file
require('dotenv').config();

// Import the Sequelize class from the Sequelize library
const { Sequelize } = require('sequelize');

// Create a new Sequelize instance and configure it with database connection details
const db = new Sequelize(
  process.env.DB_NAME,        // Database name obtained from environment variables
  process.env.DB_USER,        // Database user obtained from environment variables
  process.env.DB_PASSWORD,    // Database user's password obtained from environment variables
  {
    host: process.env.DB_HOST,     // Database host obtained from environment variables
    dialect: process.env.DB_DIALECT // Database dialect (e.g., 'mysql', 'postgres') obtained from environment variables
  }
);

// Export the configured Sequelize instance so it can be used in other parts of the application
module.exports = db;
