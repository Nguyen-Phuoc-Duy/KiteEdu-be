const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database.js");

const ListPupils = sequelize.define("ListPupils", {
  ID: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  classId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  lessonId: {
    type: DataTypes.UUID,
    allowNull: false,
    defaultValue: ""
  },
  pupilId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "attended",
  }, // started / finished / cancelled
});

module.exports = ListPupils;
