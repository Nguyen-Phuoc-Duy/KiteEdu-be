// const { DataTypes } = require('sequelize');
// const sequelize = require('../utils/database.js');

// const Orders = sequelize.define('Orders', {
//     ID: {
//         type: DataTypes.UUID,
//         defaultValue: DataTypes.UUIDV4,
//         primaryKey: true
//     },
//     name: DataTypes.STRING,
//     status: {
//         type: DataTypes.STRING,
//         defaultValue: 'started'
//     }, // started / finished / cancelled
//     tableId: {
//         type: DataTypes.UUID,
//         allowNull: false
//     },
//     createdBy: {
//         type: DataTypes.UUID,
//         allowNull: false
//     }, // ID User
//     checkoutBy: {
//         type: DataTypes.UUID,
//         allowNull: true
//     }
// });

// module.exports = Orders;