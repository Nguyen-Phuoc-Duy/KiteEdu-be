const Subjects = require("../models/subjects");
const Users = require("../models/users");

const SubjectController = {
  createSubject: async (req, res) => {
    let { name } = req.body;

    if (!name) return res.json({ errCode: 401, errMsg: "❌ Information must not be empty!" });

    let newSubject = await Subjects.create(
      {
        name,
        status: "active",
      },
      { returning: true }
    );

    return res.json({
      errCode: 200,
      errMsg: "✅ Create Success!",
      data: newSubject,
    });
  },
  getAll: async (req, res) => {
    try {
      let listSubjects = await Subjects.findAll({
        // where: {
        //   isDeleted: false,
        // },
        order: [["createdAt", "DESC"]],
      });
      return res.json({
        errCode: 200,
        errMsg: "✅ Success!",
        data: listSubjects,
      });
    } catch (err) {
      console.log(err);
      return res.json({
        errCode: 500,
        errMsg: "❌ System error!",
      });
    }
  },
  updateSubject: async (req, res) => {
    try {
      let { ID, name, status } = req.body;
      console.log("TUTUTUTUTUY", req.body);
      if (!ID || !name || !status)
        return res.json({ errCode: 401, errMsg: "❌ Information must not be empty!" });
      let opts = {};
      if (name || status) {
        opts.name = name;
        opts.status = status;
      }
      if (Object.keys(opts).length > 0) {
        let userSubjectUpdated = await Subjects.update(opts, { where: { ID } });
        const findUser = await Users.findOne({
          where: { subjectId: ID },
          raw: true,
        });
        if (findUser) {
          await Users.update(
            {
              locked: '1',
            },
            {
              where: {
                subjectId: findUser.ID,
              },
            }
          );
        }
        if (userSubjectUpdated[0]) {
          return res.json({
            errCode: 200,
            errMsg: `✅ Update Success!`,
          });
        } else {
          return res.json({ errCode: 401, errMsg: "❎ Subject not found!" });
        }
      }
      const subjectUpdated = await Subjects.update(
        { status, name },
        { where: { ID } }
      );
      if (subjectUpdated?.[0]) {
        return res.json({ errCode: 200, errMsg: "✅ Update Success!" });
      } else {
        return res.json({ errCode: 401, errMsg: "❌ Subject not found!" });
      }
    } catch (err) {
      console.log(err);
      return res.json({
        errCode: 500,
        errMsg: "❎ System error❗️",
      });
    }
  },

  // deleteTable: async (req, res) => {
  //   try {
  //     let { ID } = req.params;

  //     if (!ID) return res.json({ errCode: 401, errMsg: "Table not found!" });

  //     await Tables.update({ isDeleted: true }, { where: { ID } });
  //     return res.json({ errCode: 200, errMsg: "Table delete successfully!" });
  //   } catch (err) {
  //     console.log(err);
  //     return res.json({
  //       errCode: 500,
  //       errMsg: "System error!",
  //     });
  //   }
  // },
};

module.exports = SubjectController;
