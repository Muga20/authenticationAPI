const {
  getUsers,
  getUserById,
} = require("../controller/users");

const { isAdmin } = require("../middleware/checkRoles");
const { verifyToken } = require("../middleware/auth");

const express = require("express");
const UsersRouter = express.Router();

// Apply verifyToken middleware to all routes within this router
UsersRouter.use(verifyToken);
UsersRouter.get("/get_users", getUsers);
UsersRouter.get("/get_users", verifyToken, getUsers);
UsersRouter.get("/get_users_if_admin", verifyToken, isAdmin, getUsers);
UsersRouter.get("/get_single_user", getUserById);

module.exports = UsersRouter;
