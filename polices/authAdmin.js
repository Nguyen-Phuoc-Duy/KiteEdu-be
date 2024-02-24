const {
  handleAccessToken: { verify },
} = require("../helpers");
const checkEmail = require("../helpers/checkEmail");
const Users = require("../models/users");

async function authAdmin(req, res, next) {
  try {
    let auth = req.headers.authorization || `Bearer ${req.query.token}`;

    if (!auth || !auth.startsWith("Bearer ")) {
      return res.json({ errCode: 400, errMsg: "Invalid token" });
    }

    let token = auth.split(" ")[1];

    let verifyToken = verify(token);
    if (verifyToken?.errCode === 0) {
      let { info } = verifyToken;
      if (
        !info?.email ||
        (info?.email && info.email !== "ROOT" && !checkEmail(info.email))
      ) {
        return res.json({ errCode: 400, errMsg: "Token is wrong!" });
      }
      const user = await Users.findOne({
        where: {
          email: info.email,
        },
        raw: true,
      });
      if (!user) {
        return res.json({ errCode: 400, errMsg: "User not found!" });
      } else if (!["manager", "admin"].includes(user.role)) {
        return res.json({ errCode: 400, errMsg: "User forbidden!" });
      } else if (user.locked) {
        return res.json({ errCode: 401, errMsg: "User is locked!" });
      }
      req.user = user;
      return next();
    }

    if (verifyToken?.errCode === 1) {
      return res.json({ errCode: 400, errMsg: "Token expired!" });
    }

    return res.json({ errCode: 400, errMsg: "Forbidden!" });
  } catch (e) {
    console.log(e);
    return res.json({ errCode: 500, errMsg: "System Error!" });
  }
}

module.exports = authAdmin;
