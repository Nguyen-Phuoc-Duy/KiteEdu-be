const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database.js');

const Lessons = sequelize.define('Lessons', {
    ID: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: DataTypes.STRING,
    content: DataTypes.TEXT,
    timeStart: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        // field: 'timestart',
        // get() {
        //     const value = this.getDataValue('timeStart');
        //     return value ? value.toISOString().slice(0, 16).replace('T', ' ') : null;
        // }
    },
    timeFinish: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        // field: 'timefinish',
        // get() {
        //     const value = this.getDataValue('timeFinish');
        //     return value ? value.toISOString().slice(0, 16).replace('T', ' ') : null;
        // }
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'started'
    }, // started / finished / cancelled
    userId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    classId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    roomId: {
        type: DataTypes.UUID,
        allowNull: false
    },
});

module.exports = Lessons;