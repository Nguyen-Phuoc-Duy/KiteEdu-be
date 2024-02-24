const { hashSync, genSaltSync } = require('bcrypt');

function hashPassword(password) {
    try{
        const salt = genSaltSync(10);
        const hash = hashSync(password, salt);
        return hash
    }catch(err){
        console.log('hashPassword', err);
        return false;
    }
}

module.exports = hashPassword;