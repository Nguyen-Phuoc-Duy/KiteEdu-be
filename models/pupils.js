const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database.js");

const Pupils = sequelize.define("Pupils", {
  ID: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: DataTypes.STRING,
  status: {
    type: DataTypes.ENUM("active", "inactive"),
    defaultValue: "active",
  },
  gender: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  address: DataTypes.STRING,
  parent_name: DataTypes.STRING,
  email: {
    type: DataTypes.STRING,
    unique: true,
  },
  phone: DataTypes.STRING,
  parent_email: {
    type: DataTypes.STRING,
    unique: true,
  },
  parent_phone: DataTypes.STRING,
  birth: {
    type: DataTypes.DATEONLY, // Ngày sinh của người dùng (chỉ ngày, không có giờ)
  },
});

module.exports = Pupils;
