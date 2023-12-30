const { login, logout } = require("../authentication/login");
const { register } = require("../authentication/register");
const {
  getRoles,
  deleteRole,
  create_users_roles,
} = require("../authentication/roles");
const { verifyToken } = require("../middleware/auth");
const { createRole } = require("../authentication/roles");
const { isAdmin } = require("../middleware/checkRoles");
const {
  forgotPassword,
  resetPassword,
} = require("../authentication/accRecovery");


const express = require("express");
const AuthRouter = express.Router();

AuthRouter.post("/register", register);
AuthRouter.post("/login", login);
AuthRouter.post("/logout", logout);
AuthRouter.post("/create-role", createRole);
AuthRouter.post("/forgot_password", forgotPassword);
AuthRouter.post("/reset_password/:token", resetPassword);
AuthRouter.get("/get-roles", verifyToken, isAdmin, getRoles);
AuthRouter.delete("/delete_roles/:id", verifyToken, isAdmin, deleteRole);
AuthRouter.post("/create_users_roles", create_users_roles);



module.exports = AuthRouter;