function checkEmail(email) {
    try {
        const regexEmail = new RegExp(/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/, 'g');
        return regexEmail.test(email);
    } catch (err) {
        console.log(err);
        return false;
    }
}

module.exports = checkEmail;