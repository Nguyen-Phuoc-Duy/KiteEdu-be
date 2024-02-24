const handleAccessToken = require('./handleAccessToken');
const hashPassword = require('./hashPassword');
const comparePassword = require('./comparePassword');
const checkEmail = require('./checkEmail');

const heplers = {
    handleAccessToken,
    hashPassword,
    comparePassword,
    checkEmail
}

module.exports = heplers