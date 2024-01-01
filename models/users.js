const { DataTypes } = require("sequelize");
const db = require("../config/config");
const crypto = require("crypto");
const Roles = require("./roles");

const Users = db.define(
  "users",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    first_name: {
      type: DataTypes.STRING,
    },

    last_name: {
      type: DataTypes.STRING,
    },

    username: {
      type: DataTypes.STRING,
      unique: true,
    },

    email: {
      type: DataTypes.STRING,
      unique: true,
    },

    password: {
      type: DataTypes.STRING,
    },

    image: {
      type: DataTypes.STRING,
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    registrationToken: {
      type: DataTypes.STRING,
      unique: true,
    },

    refreshToken: {
      type: DataTypes.STRING, 
      unique: true,
    },
  },
  {
    freezeTableName: true,
    hooks: {
      beforeCreate: (user) => {
        user.registrationToken = crypto.randomBytes(32).toString("hex");
      },
    },
  }
);

Users.belongsToMany(Roles, { through: "UserRoles", foreignKey: "userId" });
Roles.belongsToMany(Users, { through: "UserRoles", foreignKey: "roleId" });

 db.sync();

module.exports = Users;
