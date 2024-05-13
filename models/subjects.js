const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database.js");

const Subjects = sequelize.define("Subjects", {
  ID: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: DataTypes.STRING,
  status: {
    type: DataTypes.STRING,
    defaultValue: "active", //inactive
  },

});

module.exports = Subjects;
