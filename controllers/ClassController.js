const Classes = require("../models/classes");
const ListPupils = require("../models/listpupils");
const Pupils = require("../models/pupils");
const Users = require("../models/users");
const { Op } = require("sequelize");
const Lesson = require("../models/lessons");
const ClassController = {

  createClass: async (req, res) => {
    try {
      let { name, status, userId, subjectId, listPupil } = req.body;
      console.log("MMMMMMMM", req.body);

      // Kiểm tra thông tin không được bỏ trống
      if (!userId || !name) {
        return res.json({
          errCode: 401,
          errMsg: "❌ Information must not be empty!",
        });
      }

      // Kiểm tra người dùng tồn tại
      const userClass = await Users.findOne({
        where: { ID: userId },
        raw: true,
      });
      if (!userClass) {
        return res.json({
          errCode: 401,
          errMsg: "❌ User not found or deleted!",
        });
      }

      // Tạo tên lớp nếu không được chỉ định
      if (!name) {
        let countClass = await Classes.count({
          where: {
            userId: userClass.ID,
          },
        });
        name = userClass.name + " - " + (countClass + 1);
      }

      // Tạo lớp mới
      let newClass = await Classes.create(
        {
          name,
          status: status || "started",
          userId,
          subjectId,
        },
        { returning: true }
      );
      newClass = newClass.dataValues;

      // Nếu có danh sách học sinh, thêm vào lớp
      if (listPupil?.length > 0) {
        let pupilsCreated = [];
        for (let p of listPupil) {
          let detail = await ListPupils.create(
            {
              classId: newClass.ID,
              pupilId: p.id,
              userId: newClass.userId,
              subjectId: newClass.subjectId,
              lessonId: newClass.lessonId,
              status: p.status || "attended",
            },
            { returning: true }
          );
          pupilsCreated.push(detail);
        }
        newClass.pupils = pupilsCreated;
      }

      return res.json({
        errCode: 200,
        errMsg: "✅ Create Success!",
        data: newClass,
      });
    } catch (err) {
      console.log(err);
      return res.json({
        errCode: 500,
        errMsg: "❎ System error❗️",
      });
    }
  },

  getAll: async (req, res) => {
    try {
      let listClasses = await Classes.findAll({
        order: [["createdAt", "DESC"]],
      });
      return res.json({
        errCode: 200,
        errMsg: "✅ Success",
        data: listClasses,
      });
    } catch (err) {
      console.log(err);
      return res.json({
        errCode: 500,
        errMsg: "❎ System error❗️",
      });
    }
  },
  getAllClassesActive: async (req, res) => {
    try {
      let listClasses = await Classes.findAll({
        where: {
          status: "started",
        },
        order: [["createdAt", "DESC"]],
      });
      return res.json({
        errCode: 200,
        errMsg: "✅ Success",
        data: listClasses,
      });
    } catch (err) {
      console.log(err);
      return res.json({
        errCode: 500,
        errMsg: "❎ System error❗️",
      });
    }
  },

  getClassByUser: async (req, res) => {
    try {
      let { ID, role } = req.body;

      if (!ID) return res.json({ errCode: 401, errMsg: "❌ User not found!" });

      let classQueryOptions = {
        order: [["createdAt", "DESC"]],
      };

      let listClasses = [];

      if (role == "admin" || role == "manager") {
        // Nếu là admin hoặc manager, lấy danh sách tất cả các lớp
        listClasses = await Classes.findAll({
          raw: true,
          order: [["createdAt", "DESC"]],
        });
        for (const cls of listClasses) {
          const pupils = await ListPupils.findAll({
            where: {
              classId: cls.ID,
              lessonId: "",
            },
          });
          // Kiểm tra cls.dataValues có tồn tại không
          if (!cls.pupils) {
            cls.pupils = {};
          }
          cls.pupils = pupils;

          // Lấy tên học viên dựa trên pupilId từ bảng Pupils và thêm vào trường 'pupilName'
          for (const pupil of pupils) {
            const pupilInfo = await Pupils.findOne({
              attributes: ["name"],
              where: {
                ID: pupil.pupilId,
              },
            });
            pupil.dataValues.pupilName = pupilInfo.name;
          }
        }
      } else {
        // Nếu không phải admin hoặc manager, lấy danh sách lớp mà user tham gia
        listClasses = await Classes.findAll({
          where: {
            userId: ID,
          },
          raw: true,
          order: [["createdAt", "DESC"]],
        });
      }

      // Lấy danh sách học viên cho mỗi lớp và thêm vào trường 'pupils'
      for (const cls of listClasses) {
        const pupils = await ListPupils.findAll({
          where: {
            classId: cls.ID,
            lessonId: "",
          },
        });
        // Kiểm tra cls.dataValues có tồn tại không
        if (!cls.pupils) {
          cls.pupils = {};
        }
        cls.pupils = pupils;

        // Lấy tên học viên dựa trên pupilId từ bảng Pupils và thêm vào trường 'pupilName'
        for (const pupil of pupils) {
          const pupilInfo = await Pupils.findOne({
            attributes: ["name"],
            where: {
              ID: pupil.pupilId,
            },
          });
          pupil.dataValues.pupilName = pupilInfo.name;
        }
      }

      return res.json({
        errCode: 200,
        errMsg: "✅ Success",
        data: listClasses,
      });
    } catch (err) {
      console.log(err);
      return res.json({ errCode: 500, errMsg: "❎ System error❗️" });
    }
  },
  getPupilByClass: async (req, res) => {
    try {
      let { ID } = req.body;

      if (!ID) return res.json({ errCode: 401, errMsg: "❌ Class not found!" });

      {
        let detailClss = await ListPupils.findAll({
          where: {
            classId: ID,
            lessonId: "",
          },
          raw: true,
          order: [["createdAt", "DESC"]],
        });
        return res.json({
          errCode: 200,
          errMsg: "✅ Success!",
          data: detailClss,
        });
      }
    } catch (err) {
      console.log(err);
      return res.json({ errCode: 500, errMsg: "❎ System error❗️" });
    }
  },

  getAllPupilByClass: async (req, res) => {
    try {
      let { ID } = req.body;

      if (!ID) return res.json({ errCode: 401, errMsg: "❌ Class not found!" });

      let detailClass = await ListPupils.findAll({
        where: {
          classId: ID,
          lessonId: {
            [Op.ne]: "", // Lọc các giá trị không bằng chuỗi trống
          },
        },
        raw: true,
        order: [["createdAt", "DESC"]],
      });

      // Lặp qua từng phần tử trong detailClass để thêm thông tin lessonName
      for (const pupil of detailClass) {
        // Tìm thông tin của bài học từ bảng Lessons
        const lessonInfo = await Lesson.findOne({
          attributes: ["name"],
          where: {
            ID: pupil.lessonId,
          },
        });

        // Thêm lessonName vào dữ liệu của từng học viên
        pupil.lessonName = lessonInfo.name;
      }

      for (const pupil of detailClass) {
        const classInfo = await Classes.findOne({
          attributes: ["name"],
          where: {
            ID: pupil.classId,
          },
        });

        pupil.className = classInfo.name;
      }
      for (const pupil of detailClass) {
        const userInfo = await Users.findOne({
          attributes: ["name"],
          where: {
            ID: pupil.userId,
          },
        });

        pupil.userName = userInfo.name;
      }
      for (const pupil of detailClass) {
        const pupilInfo = await Pupils.findOne({
          attributes: ["name"],
          where: {
            ID: pupil.pupilId,
          },
        });

        pupil.pupilName = pupilInfo.name;
      }
      return res.json({
        errCode: 200,
        errMsg: "✅ Success!",
        data: detailClass,
      });
    } catch (err) {
      console.log(err);
      return res.json({ errCode: 500, errMsg: "❎ System error❗️" });
    }
  },
  getDetailClass: async (req, res) => {
    try {
      let { ID } = req.body;
      console.log("mmmmmmmmmmmmmmmmmmmmm", req.body);
      if (!ID) return res.json({ errCode: 401, errMsg: "❌ Class not found!" });

      const detailClss = await Classes.findAll({
        where: {
          ID: ID,
          // lessonId: "",
        },
        raw: true,
        order: [["createdAt", "DESC"]],
      });

      const pupils = await ListPupils.findAll({
        where: {
          classId: ID,
        },
      });

      // Thêm thông tin về học sinh vào mỗi đối tượng trong mảng detailClss
      detailClss.forEach((clss) => {
        clss.pupils = pupils;
      });

      return res.json({
        errCode: 200,
        errMsg: "✅ Success!",
        data: detailClss,
      });
    } catch (err) {
      console.log(err);
      return res.json({ errCode: 500, errMsg: "System error!" });
    }
  },

  updateClass: async (req, res) => {
    try {
      let { ID, name, status, userId, listPupil } = req.body;

      if (!ID)
        return res.json({
          errCode: 401,
          errMsg: "❌ Information must not be empty!",
        });

      let opts = {};
      if (name) opts.name = name;
      if (status) opts.status = status;

      if (Object.keys(opts).length > 0) {
        await Classes.update(opts, {
          where: { ID },
        });
      }

      // Kiểm tra xem lớp đã có học sinh nào hay chưa
      let existingPupils = await ListPupils.findAll({
        where: { classId: ID },
      });

      // Nếu lớp chưa có học sinh nào
      if (existingPupils.length === 0) {
        // Tạo mới các bản ghi học sinh trong danh sách
        for (let pupil of listPupil) {
          await ListPupils.create({
            classId: ID,
            pupilId: pupil.id,
            status: pupil.status,
            userId: userId,
          });
        }
      } else {
        // Nếu lớp đã có học sinh, kiểm tra và thêm học sinh mới vào lớp
        for (let pupil of listPupil) {
          // Kiểm tra xem học sinh đã tồn tại trong lớp chưa
          let existingPupil = existingPupils.find(
            (p) => p.pupilId === pupil.id
          );

          if (!existingPupil) {
            // Nếu học sinh chưa tồn tại trong lớp, tạo mới bản ghi học sinh
            await ListPupils.create({
              classId: ID,
              pupilId: pupil.id,
              status: pupil.status,
              userId: userId,
            });
          }
        }
      }

      // Lấy danh sách học sinh mới sau khi cập nhật
      let newPupils = await ListPupils.findAll({ where: { classId: ID } });

      return res.json({
        errCode: 200,
        errMsg: "✅ Update Success!",
        data: {
          ID,
          ...opts,
          pupils: newPupils,
        },
      });
    } catch (err) {
      console.log(err);
      return res.json({
        errCode: 500,
        errMsg: "❎ System error❗️",
      });
    }
  },

  removePupilInClass: async (req, res) => {
    try {
      let { classId, pupilId } = req.body;
      console.log("Request Body1:", req.body);
      if (!classId || !pupilId)
        return res.json({ errCode: 401, errMsg: "Invalid params!" });

      let pupil = await ListPupils.findAll({
        where: {
          classId: classId,
          pupilId: pupilId,
          lessonId: "",
        },
        raw: true,
      });

      if (pupil) {
        await ListPupils.update(
          { status: "not attend" },
          {
            where: {
              classId: classId,
              lessonId: "",
              pupilId: pupilId,
            },
          }
        );

        let newPupils = await ListPupils.findOne({
          where: { classId: classId, lessonId: "", pupilId: pupilId },
        });

        return res.json({
          errCode: 200,
          errMsg: "Update success!",
          data: {
            pupil: pupil,
            pupils: newPupils,
          },
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

  addPupilInClass: async (req, res) => {
    try {
      let { classId, pupilId } = req.body;
      console.log("Request Body2:", req.body);
      if (!classId || !pupilId)
        return res.json({ errCode: 401, errMsg: "Invalid params!" });

      let pupil = await ListPupils.findAll({
        where: {
          classId: classId,
          pupilId: pupilId,
          lessonId: "",
        },
        raw: true,
      });

      if (pupil) {
        await ListPupils.update(
          { status: "attended" },
          {
            where: {
              classId: classId,
              lessonId: "",
              pupilId: pupilId,
            },
          }
        );

        let newPupils = await ListPupils.finAll({
          where: { classId: classId, lessonId: "", pupilId: pupilId },
        });

        return res.json({
          errCode: 200,
          errMsg: "Update success!",
          data: {
            pupil: pupil,
            pupils: newPupils,
          },
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

module.exports = ClassController;
