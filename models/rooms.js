const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database.js");

const Rooms = sequelize.define("Rooms", {
  ID: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: DataTypes.STRING,
  // status: {
  //   type: DataTypes.ENUM("empty", "full", "fix"),
  //   defaultValue: "empty",
  // },
  status: {
    type: DataTypes.STRING,
    defaultValue: "empty",
  }, // started / finished / cancelled
  // isDeleted: {
  //     type: DataTypes.BOOLEAN,
  //     defaultValue: false
  // }
});

module.exports = Rooms;
