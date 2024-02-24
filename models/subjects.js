const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database.js");

const Subjects = sequelize.define("Subjects", {
  ID: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: DataTypes.STRING,
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("active", "inactive"),
    defaultValue: "active",
  },
  // isDeleted: {
  //     type: DataTypes.BOOLEAN,
  //     defaultValue: false
  // }
});

module.exports = Subjects;
