const { DataTypes } = require("sequelize");
const db = require("../../config/config");

const UserRoles = db.define(
  "user_roles",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
  },
  {
    freezeTableName: true,
  }
);

 db.sync();

module.exports = UserRoles;
