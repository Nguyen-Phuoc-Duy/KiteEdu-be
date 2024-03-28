const Users = require("../models/users");
const {
  checkEmail,
  handleAccessToken,
  hashPassword,
  comparePassword,
} = require("../helpers");
const {
  handleAccessToken: { verify },
} = require("../helpers");
const { Op, where } = require("sequelize");
const sendMail = require("../helpers/sendEmail");

const UsersController = {
  loginWithToken: async (req, res) => {
    try {
      let { token } = req.params;
      if (!token) return res.json({ errCode: 500, errMsg: "Invalid token!" });
      let verifyToken = verify(token);
      if (verifyToken?.errCode === 0) {
        let { info } = verifyToken;
        if (
          !info?.email ||
          (info?.email && info.email !== "ROOT" && !checkEmail(info.email))
        ) {
          return res.json({ errCode: 401, errMsg: "Token is wrong!" });
        }
        const user = await Users.findOne({
          where: {
            email: info.email,
          },
          raw: true,
        });
        if (!user) {
          return res.json({ errCode: 401, errMsg: "User not found!" });
        } else if (user.locked) {
          return res.json({ errCode: 401, errMsg: "User is locked!" });
        }
        return res.json({ errCode: 200, errMsg: "Login Success!", data: user });
      }
      return res.json({ errCode: 500, errMsg: "Login failed!" });
    } catch (e) {
      console.log(e);
      return res.json({ errCode: 500, errMsg: "Login failed!" });
    }
  },
  register: async (req, res) => {
    try {
      let {
          email,
          password,
          name,
          username,
          address,
          phone,
          birth,
          gender,
          subjectId,
        } = req.body,
        { user } = req;

      console.log(req.body);

      if (
        !email &&
        !password &&
        !name &&
        !username &&
        !address &&
        !phone &&
        !birth &&
        !gender &&
        !subjectId
      )
        return res.json({ errCode: 500, errMsg: "Invalid params!" });

      if (!["manager", "admin"].includes(user.role))
        return res.json({ errCode: 401, errMsg: "Forbidden!" });

      if (checkEmail(email)) {
        let passwordHash = hashPassword(password);
        if (!passwordHash)
          return res.json({ errCode: 500, errMsg: "System Error!" });
        let userCreated = await Users.create(
          {
            name,
            email,
            password: passwordHash,
            username,
            address,
            phone,
            birth,
            gender,
            subjectId: subjectId ? subjectId : '',
            role: subjectId ? 'employee' : 'manager'
          },
          { returning: true }
        );

        let resultSendMail = await sendMail("newAccount", {
          email,
          name,
          password,
          username,
          address,
          phone,
          birth,
          gender,
          subjectId,
        });

        if (resultSendMail.errCode != 0) {
          console.log(resultSendMail);
        }

        userCreated = userCreated.dataValues;
        delete userCreated.password;
        res.json({
          errCode: 200,
          errMsg: "Register Account Success!",
          data: userCreated,
        });
      } else {
        return res.json({ errCode: 500, errMsg: "Email wrong format!" });
      }
    } catch (err) {
      console.log(err);
      return res.json({ errCode: 500, errMsg: "Register Account failed!" });
    }
  },
  login: async (req, res) => {
    try {
      let { email, password } = req.body;
      if (!email && !password)
        return res.json({ errCode: 500, errMsg: "Invalid params!" });
      if (email === "ROOT" || checkEmail(email)) {
        let user = await Users.findOne({ where: { email } });
        if (!user || !comparePassword(password, user.password)) {
          return res.json({
            errCode: 401,
            errMsg: "Invalid email or password!",
          });
        } else if (user.locked) {
          return res.json({ errCode: 401, errMsg: "User is locked!" });
        } else {
          const accessToken = handleAccessToken.generate({
            email,
            role: user.role,
            address: user.address,
            birth: user.birth,
            gender: user.gender,
            locked: user.locked,
            name: user.name,
            phone: user.phone,
            status: user.status,
            username: user.username,
            subjectId: user.subjectId,
            id: user.ID,
          });
          user = user.dataValues;
          user.token = accessToken;
          delete user.password;
          return res.json({
            errCode: 200,
            errMsg: "Login Success!",
            data: user,
          });
        }
      } else {
        return res.json({ errCode: 500, errMsg: "Email wrong format!" });
      }
    } catch (err) {
      console.log(err);
      return res.json({ errCode: 500, errMsg: "Login failed!" });
    }
  },
  updateProfile: async (req, res) => {
    try {
      let { user } = req,
        {
          ID,
          name,
          username,
          gender,
          birth,
          phone,
          address,
          email,
          password,
          currentPWD,
        } = req.body;

      console.log(req.body);

      if (!ID || (!name && !password)) {
        return res.json({ errCode: 500, errMsg: "Invalid params!" });
      }

      if (checkEmail(email)) {
        let opts = {};

      if (name) {
        opts.name = name;
      }
      if (username) {
        opts.username = username;
      }
      if (gender) {
        opts.gender = gender;
      }
      if (birth) {
        opts.birth = birth;
      }
      if (phone) {
        opts.phone = phone;
      }
      if (address) {
        opts.address = address;
      }
      if (email) {
        opts.email = email;
      }
      if (Object.keys(opts).length > 0) {
        let userUpdated = await Users.update(opts, { where: { ID } });
        if (userUpdated[0]) {
          return res.json({
            errCode: 200,
            errMsg: "Update success!",
          });
        }
      }

      return res.json({
        errCode: 401,
        errMsg: "Update failed!",
      });
      } else {
        return res.json({ errCode: 500, errMsg: "Email wrong format!" });
      }

      // let opts = {};

      // if (name) {
      //   opts.name = name;
      // }
      // if (username) {
      //   opts.username = username;
      // }
      // if (gender) {
      //   opts.gender = gender;
      // }
      // if (birth) {
      //   opts.birth = birth;
      // }
      // if (phone) {
      //   opts.phone = phone;
      // }
      // if (address) {
      //   opts.address = address;
      // }
      // if (email) {
      //   opts.email = email;
      // }
    //   if (password) {
    //     if (!comparePassword(currentPWD, user.password)) {
    //       return res.json({
    //         errCode: 401,
    //         errMsg: "Invalid current password!",
    //       });
    //     }
    //     let passwordHash = hashPassword(password);
    //     if (!passwordHash)
    //       return res.json({ errCode: 500, errMsg: "System Error!" });
    //     opts.password = passwordHash;
    //   }

      // if (Object.keys(opts).length > 0) {
      //   let userUpdated = await Users.update(opts, { where: { ID } });
      //   if (userUpdated[0]) {
      //     return res.json({
      //       errCode: 200,
      //       errMsg: "Update success!",
      //     });
      //   }
      // }

      // return res.json({
      //   errCode: 401,
      //   errMsg: "Update failed!",
      // });
    } catch (err) {
      console.log(err);
      return res.json({ errCode: 500, errMsg: "System Error!" });
    }
  },
  updateRole: async (req, res) => {
    try {
      let { ID, role } = req.body; // Lấy ra ID và vai trò mới từ req.body
      // console.log("req.body", req.body); // Dòng này làm gì?
      if (!ID) return res.json({ errCode: 401, errMsg: "User not found!" }); // Kiểm tra xem ID có tồn tại không, nếu không trả về lỗi

      if (role === "admin")
        return res.json({ errCode: 401, errMsg: "Forbidden!" }); // Nếu vai trò mới là 'admin', trả về lỗi

      if (!["employee", "manager"].includes(role)) {
        // Kiểm tra xem vai trò mới có thuộc các giá trị hợp lệ không
        return res.json({ errCode: 401, errMsg: "Invalid role!" }); // Nếu không, trả về lỗi
      }

      let checkAdminROOT = await Users.findOne({ where: { ID }, raw: true }); // Tìm kiếm người dùng theo ID

      if (checkAdminROOT.email === "ROOT" || checkAdminROOT.role === "admin")
        return res.json({ errCode: 401, errMsg: "Forbidden!" }); // Nếu người dùng là 'ROOT' hoặc đã có vai trò là 'admin', trả về lỗi

      let updated = await Users.update({ role }, { where: { ID } }); // Cập nhật vai trò mới của người dùng

      if (updated[0]) {
        return res.json({
          errCode: 200,
          errMsg:
            `Update success, now user: ${checkAdminROOT.name} is: ` + role, // Trả về thông báo thành công với tên và vai trò mới của người dùng
        });
      } else {
        return res.json({ errCode: 401, errMsg: "Update failed!" }); // Nếu cập nhật thất bại, trả về lỗi
      }
    } catch (err) {
      return res.json({ errCode: 500, errMsg: "System Error!" }); // Nếu có lỗi xảy ra trong quá trình xử lý, trả về lỗi hệ thống
    }
  },

  updateUserSubject: async (req, res) => {
    try {
      let { ID, role, subjectId } = req.body; // Lấy ra ID và vai trò mới từ req.body
      // console.log("req.body", req.body); // Dòng này làm gì?
      if (!ID) return res.json({ errCode: 401, errMsg: "User not found!" }); // Kiểm tra xem ID có tồn tại không, nếu không trả về lỗi

      // if (role === "admin")
      //   return res.json({ errCode: 401, errMsg: "Forbidden!" }); // Nếu vai trò mới là 'admin', trả về lỗi

      // if (!["employee", "manager"].includes(role)) {
      //   // Kiểm tra xem vai trò mới có thuộc các giá trị hợp lệ không
      //   return res.json({ errCode: 401, errMsg: "Invalid role!" }); // Nếu không, trả về lỗi
      // }

      let checkAdminROOT = await Users.findOne({ where: { ID }, raw: true }); // Tìm kiếm người dùng theo ID

      if (checkAdminROOT.email === "ROOT" || checkAdminROOT.role === "admin")
        return res.json({ errCode: 401, errMsg: "Forbidden!" }); // Nếu người dùng là 'ROOT' hoặc đã có vai trò là 'admin', trả về lỗi

      let updated = await Users.update({ subjectId }, { where: { ID } }); // Cập nhật vai trò mới của người dùng

      if (updated[0]) {
        return res.json({
          errCode: 200,
          errMsg:
            `Update success, now user: ${checkAdminROOT.name} is: ` + subjectId, // Trả về thông báo thành công với tên và vai trò mới của người dùng
        });
      } else {
        return res.json({ errCode: 401, errMsg: "Update failed!" }); // Nếu cập nhật thất bại, trả về lỗi
      }
    } catch (err) {
      return res.json({ errCode: 500, errMsg: "System Error!" }); // Nếu có lỗi xảy ra trong quá trình xử lý, trả về lỗi hệ thống
    }
  },
//   updateUserSubject: async (req, res) => {
//     try {
//         let { ID, role, subjectId } = req.body;
//         console.log("req.body", req.body);
//         if (!ID) return res.json({ errCode: 401, errMsg: "User not found!" });
//         if (!ID || (!subjectId && !role)) {
//             return res.json({ errCode: 500, errMsg: "Invalid params!" });
//         }

//         let checkAdminRole = await Users.findOne({ where: { ID }, raw: true });

//         if ( checkAdminRole.role === "admin")
//             return res.json({ errCode: 401, errMsg: "Forbidden!" });

//         let updated;

//         // Kiểm tra nếu subjectId là một id
//         if (!isNaN(parseInt(subjectId))) {
//             updated = await Users.update({ subjectId }, { where: { ID } });
//         } else { // Nếu subjectId là name của môn học
//             let subject = await Subject.findOne({ where: { name: subjectId } });
//             if (!subject) {
//                 return res.json({ errCode: 401, errMsg: "Subject not found!" });
//             }
//             updated = await Users.update({ subjectId: subject.id }, { where: { ID } });
//         }

//         if (updated[0]) {
//             return res.json({
//                 errCode: 200,
//                 errMsg: `Update success, now user: ${checkAdminRole.subjectId} is: ` + subjectId,
//             });
//         } else {
//             return res.json({ errCode: 401, errMsg: "Update failed!" });
//         }
//     } catch (err) {
//         return res.json({ errCode: 500, errMsg: "System Error!" });
//     }
// },

  lockOrUnlockUser: async (req, res) => {
    try {
      let { ID } = req.params,
        { isLocked } = req.body;
      if (!ID) return res.json({ errCode: 404, errMsg: "User not found!" });
      if (![true, false].includes(isLocked))
        return res.json({ errCode: 404, errMsg: "System error!" });

      let user = await Users.update({ locked: isLocked }, { where: { ID } });
      if (user[0]) {
        return res.json({
          errCode: 200,
          errMsg: `${isLocked ? "User is locked!" : "User is unlocked"}`,
        });
      } else {
        return res.json({
          errCode: 401,
          errMsg: `${isLocked ? "User locked" : "User unlocked"} failed!`,
        });
      }
    } catch (err) {
      console.log(err);
      return res.json({ errCode: 500, errMsg: "System error!" });
    }
  },
  getAllUsers: async (req, res) => {
    try {
      let { user } = req;
      if (!user) return res.json({ errCode: 401, errMsg: "Forbidden!" });
      let opts = {
        role: ["employee", "manager"],
      };
      if (user.role === "manager") {
        opts.role = { [Op.in]: ["employee", "manager"] };
      }
      if (user.role === "admin") {
        opts.role = { [Op.in]: ["employee", "manager"] };
      }
      const listUsers = await Users.findAll({
        where: opts,
        raw: true,
        attributes: { exclude: ["password"] },
        order: [["createdAt", "DESC"]],
      });

      return res.json({
        errCode: 200,
        errMsg: `Successfully!`,
        data: listUsers,
      });
    } catch (err) {
      console.log(err);
      return res.json({ errCode: 500, errMsg: "System error!" });
    }
  },
  resetPassword: async (req, res) => {
    try {
      let { ID } = req.params;
      if (!ID) return res.json({ errCode: 401, errMsg: "User not found!" });

      const newPWD = Math.random().toString(36).slice(-6);

      const pwdHash = hashPassword(newPWD);

      let user = await Users.findOne({
        where: {
          ID,
        },
        raw: true,
      });

      if (!user) return res.json({ errCode: 401, errMsg: "User not found!" });

      let updated = await Users.update(
        { password: pwdHash },
        {
          where: {
            ID: user.ID,
          },
        }
      );

      let resultSendMail = await sendMail("resetPassword", {
        email: user.email,
        password: newPWD,
      });

      if (resultSendMail.errCode != 0) {
        console.log(resultSendMail);
      }

      if (updated[0]) {
        return res.json({
          errCode: 200,
          errMsg: `Successfully!`,
          data: newPWD,
        });
      } else {
        return res.json({ errCode: 401, errMsg: `Reset password failed!` });
      }
    } catch (err) {
      console.log(err);
      return res.json({ errCode: 500, errMsg: "System error!" });
    }
  },
};

module.exports = UsersController;
