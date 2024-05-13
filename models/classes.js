const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database.js');

const Classes = sequelize.define('Classes', {
    ID: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: DataTypes.STRING,
    status: {
        type: DataTypes.STRING,
        defaultValue: 'started'
    }, // started / finished / cancelled
    userId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    subjectId: {
        type: DataTypes.UUID,
        allowNull: false
    },

});

module.exports = Classes;