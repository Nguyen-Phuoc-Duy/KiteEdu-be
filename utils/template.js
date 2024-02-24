
const resetPassword = ({email, password}) => {
    if (!email || !password) {
        return { errCode: 1, errMsg: 'Invalid parameters' };
    }

    let html = `
        <h2>Reset Password Success ❤</h2>
        <h3>Mật khẩu mới của bạn là:</h3>
        <h3>${password}</h3>`

    let body = {
        from: '"Noreply 👻" KiteEdu', // sender address
        to: email, // list of receivers
        subject: 'Cài lại mật khẩu ✔', // Subject line
        text: 'Chào bạn.', // plain text body
        html: html, // html body
    }

    return { errCode: 0, errMsg: 'Get template success', body };
}

const newAccount = ({email, name, password}) => {
    if (!email || !password) {
        return { errCode: 1, errMsg: 'Invalid parameters' };
    }

    let html = `
        <h2>Chào mừng ${'<b>' + name + '</b>' || 'bạn'} đến với KiteEdu ❤</h2>
        <h3>Thông tin tài khoản của bạn là:</h3>
        <h3>Email: <b>${email}</b></h3>
        <h3>Password: <b>${password}</b></h3>`

    let body = {
        from: '"Noreply 👻" KiteEdu', // sender address
        to: email, // list of receivers
        subject: 'Tài khoản mới ✔', // Subject line
        text: 'Chào bạn.', // plain text body
        html: html, // html body
    }

    return { errCode: 0, errMsg: 'Get template success', body };
}

let templateEmail = {
    resetPassword, 
    newAccount
}

module.exports = templateEmail;