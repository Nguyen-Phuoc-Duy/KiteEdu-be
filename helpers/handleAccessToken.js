const jwt = require('jsonwebtoken');


function generateAccessToken(data, expiresIn = '1 days') {
    return jwt.sign(data, process.env.JWT_TOKEN, { expiresIn });
}

function verifyAccessToken(token){
    try{
        const decoded = jwt.verify(token, process.env.JWT_TOKEN);
        return {
            errCode: 0,
            info: decoded
        };
    }catch(err) {
        if(err.name === 'TokenExpiredError'){
            return {
                errCode: 1,
                errMsg: 'Token Expired!',
            }
        }
        return {
            errCode: 2,
            errMsg: 'Verify Failed!',
            info: err.message
        };
    }
}

module.exports = {
    generate: generateAccessToken,
    verify: verifyAccessToken
}