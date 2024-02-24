const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database.js");

const Users = sequelize.define("Users", {
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
  username: DataTypes.STRING,
  email: {
    type: DataTypes.STRING,
    unique: true,
  },
  phone: DataTypes.STRING,
  password: DataTypes.STRING,
  locked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
  },
  birth: {
    type: DataTypes.DATEONLY, // Ngày sinh của người dùng (chỉ ngày, không có giờ)
  },
  role: {
    type: DataTypes.ENUM("employee", "manager", "admin"),
    defaultValue: "employee",
  }, // 'employee' or 'manager' or 'admin'
});

module.exports = Users;
