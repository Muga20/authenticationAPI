const { DataTypes } = require("sequelize");
const db = require("../config/config");

const Roles = db.define(
  "roles",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    role: {
      type: DataTypes.STRING,
    },

    role_number: {
      type: DataTypes.INTEGER,
    },
  },
  {
    freezeTableName: true,
  }
);

db.sync();

module.exports = Roles;
