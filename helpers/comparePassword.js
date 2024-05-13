const { compareSync } = require("bcrypt");

function comparePassword(password, hash) {
  try {
    return compareSync(password, hash);
  } catch (err) {
    console.log("errerr", err);
    return false;
  }
}

module.exports = comparePassword;
