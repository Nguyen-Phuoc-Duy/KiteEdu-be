const Lesson = require("../models/lessons");
const Classes = require("../models/classes");
const ListPupils = require("../models/listpupils");
const Pupils = require("../models/pupils");
const Subjects = require("../models/subjects");
const Users = require("../models/users");
const { Op } = require("sequelize");

const ListPupilController = {
  updatePupilStatusInClass: async (req, res) => {
    try {
      let { classId, pupilId, status, lessonId, userId } = req.body;

      console.log("Request Body:", req.body);

      if (!classId || !pupilId || !status || !lessonId || !userId)
        return res.json({ errCode: 401, errMsg: "Invalid params!" });

      // let validStatus = ["attended", "not attend", "present", "absent"];
      // if (!validStatus.includes(status))
      //   return res.json({ errCode: 401, errMsg: "Invalid status!" });

      //   let pupil = await ListPupils.findOne({
      //     where: {
      //       classId: classId,
      //       pupilId: pupilId,
      //       lessonId: lessonId,
      //       userId: userId
      //     },
      //     raw: true,
      //   });

      if (classId && pupilId && status && lessonId && userId) {
        await ListPupils.create(
          { classId, lessonId, pupilId, status, userId },
          { returning: true }
        );

        let pupil = await ListPupils.findAll({
          where: {
            classId: classId,
            pupilId: pupilId,
            lessonId: lessonId,
            userId: userId,
          },
          raw: true,
        });
        if (pupil) {
          await ListPupils.update({ status: status }, { returning: true });
        }
        let newPupil = await ListPupils.findAll({
          where: {
            classId: classId,
            lessonId: lessonId,
            pupilId: pupilId,
            userId: userId,
          },
        });
        return res.json({
          errCode: 200,
          errMsg: "Update success!",
          data: newPupil,
        });
      } else {
        return res.json({ errCode: 404, errMsg: "Pupil not found!" });
      }
    } catch (err) {
      console.log(err);
      return res.json({
        errCode: 500,
        errMsg: "System Error!",
      });
    }
  },
};

module.exports = ListPupilController;
