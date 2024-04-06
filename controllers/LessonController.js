const Lesson = require("../models/lessons");
const Classes = require("../models/classes");
const ListPupils = require("../models/listpupils");
const Pupils = require("../models/pupils");
const Subjects = require("../models/subjects");
const Users = require("../models/users");
const { Op } = require("sequelize");
// const moment = require("moment");
const LessonController = {
  getLessonByClass: async (req, res) => {
    // Định nghĩa hàm getByTableID với tham số req và res
    try {
      // Bắt đầu khối try để xử lý các lệnh có thể sinh ra ngoại lệ
      let { ID } = req.body; // Lấy giá trị của tham số ID từ yêu cầu HTTP
      //console.log("--the identity", ID);
      // console.log("gggggggggggggg", req.body);
      if (!ID) return res.json({ errCode: 401, errMsg: "Class not found!" }); // Kiểm tra xem có ID không, nếu không thì trả về thông báo lỗi

      // Lấy danh sách đơn hàng từ cơ sở dữ liệu, dựa trên ID của bàn, sắp xếp theo thời gian tạo giảm dần
      let listLessons = await Lesson.findAll({
        where: {
          classId: ID,
        },
        raw: true,
        order: [["createdAt", "DESC"]],
      });

      // Duyệt qua từng đơn hàng trong danh sách đơn hàng
      for (let lesson of listLessons) {
        if (lesson?.ID) {
          // Kiểm tra xem đơn hàng có ID không
          // Lấy chi tiết đơn hàng từ cơ sở dữ liệu, dựa trên ID của đơn hàng hiện tại
          let details = await ListPupils.findAll({
            where: {
              // lessonId: lesson.ID,
              classId: ID,
            },
            raw: true,
          });
          let listLesson = []; // Khởi tạo mảng để lưu trữ danh sách sản phẩm trong đơn hàng
          // Duyệt qua từng chi tiết đơn hàng
          for (let detail of details) {
            if (detail?.pupilId) {
              // Kiểm tra xem chi tiết đơn hàng có ID sản phẩm không
              // Lấy thông tin của sản phẩm từ cơ sở dữ liệu dựa trên ID sản phẩm
              let pupil = await ListPupils.findOne({
                where: {
                  pupilId: detail.pupilId,
                },
                raw: true,
              });
              // Thêm thông tin sản phẩm và số lượng vào danh sách sản phẩm trong đơn hàng
              listLesson.push({
                ...pupil,
                // quantity: detail.quantity,
              });
            }
          }
          // Gán danh sách sản phẩm vào đơn hàng
          lesson.pupils = listLesson;
        }
      }

      // Trả về danh sách đơn hàng đã được xử lý và thông báo thành công
      return res.json({ errCode: 200, errMsg: "Success!", data: listLessons });
    } catch (err) {
      // Bắt các ngoại lệ nếu có
      console.log(err); // In lỗi ra console để ghi nhận và debug
      // Trả về thông báo lỗi nếu có lỗi xảy ra
      return res.json({ errCode: 500, errMsg: "System error!" });
    }
  },

  getLessonByUser1: async (req, res) => {
    // Định nghĩa hàm getByTableID với tham số req và res
    try {
      // Bắt đầu khối try để xử lý các lệnh có thể sinh ra ngoại lệ
      let { ID } = req.body; // Lấy giá trị của tham số ID từ yêu cầu HTTP
      //console.log("--the identity", ID);
      // console.log("gggggggggggggg", req.body);
      if (!ID) return res.json({ errCode: 401, errMsg: "User not found!" }); // Kiểm tra xem có ID không, nếu không thì trả về thông báo lỗi

      // Lấy danh sách đơn hàng từ cơ sở dữ liệu, dựa trên ID của bàn, sắp xếp theo thời gian tạo giảm dần
      let listLessons = await Lesson.findAll({
        where: {
          userId: ID,
        },
        raw: true,
        order: [["createdAt", "DESC"]],
      });

      // Trả về danh sách đơn hàng đã được xử lý và thông báo thành công
      return res.json({ errCode: 200, errMsg: "Success!", data: listLessons });
    } catch (err) {
      // Bắt các ngoại lệ nếu có
      console.log(err); // In lỗi ra console để ghi nhận và debug
      // Trả về thông báo lỗi nếu có lỗi xảy ra
      return res.json({ errCode: 500, errMsg: "System error!" });
    }
  },
  getLessonByUser: async (req, res) => {
    try {
      let listLessons = await Lesson.findAll({
        order: [["createdAt", "DESC"]],
      });
      return res.json({
        errCode: 200,
        errMsg: "Success",
        data: listLessons,
      });
    } catch (err) {
      console.log(err);
      return res.json({
        errCode: 500,
        errMsg: "System error!",
      });
    }
  },

  createLesson: async (req, res) => {
    try {
      let {
        // status,
        // listPupil,
        name,
        userId,
        classId,
        roomId,
        content,
        timeStart,
        timeFinish,
      } = req.body;
      console.log("ooooooooooooooooooooooo", req.body);
      if (!userId || !classId)
        return res.json({ errCode: 401, errMsg: "Invalid params!" });

      const findClass = await Classes.findOne({
        where: { ID: classId },
        raw: true,
      });
      if (!findClass) {
        return res.json({
          errCode: 401,
          errMsg: "Class not found or deleted!",
        });
      } else {
        let newLesson = await Lesson.create(
          {
            name,
            status: "started",
            userId,
            classId,
            roomId,
            content,
            timeStart,
            timeFinish,
          },
          { returning: true }
        );
        // newLesson = newLesson.dataValues;
        // if (listPupil?.length > 0) {
        //   let pupilsCreated = [];
        //   for (let p of listPupil) {
        //     let detail = await ListPupils.create(
        //       {
        //         classId: newLesson.classId,
        //         pupilId: p.id,
        //         userId: newLesson.userId,
        //         lessonId: newLesson.ID,
        //         status: p.status,
        //       },
        //       { returning: true }
        //     );
        //     pupilsCreated.push(detail);
        //   }
        //   newLesson.pupils = pupilsCreated;
        // }

        return res.json({
          errCode: 200,
          errMsg: "Create lesson succes!",
          data: newLesson,
        });
      }
    } catch (err) {
      console.log(err);
      return res.json({
        errCode: 500,
        errMsg: "System Error!",
      });
    }
  },

  getPupilByLesson1: async (req, res) => {
    try {
      let { classId, lessonId } = req.body;

      if (!classId)
        return res.json({ errCode: 401, errMsg: "Class not found!" });
      if (classId) {
        let listClassesPupil = await ListPupils.findAll({
          where: {
            classId: classId,
            lessonId: "",
            status: ["attended", "present", "absent"],
          },
          raw: true,
          order: [["createdAt", "DESC"]],
        });

        let listLessonPupil = listClassesPupil.map((item) => ({ ...item }));
        listLessonPupil.forEach((item) => {
          item.lessonId = lessonId;
        });

        return res.json({
          errCode: 200,
          errMsg: "Success!",
          data: listLessonPupil,
        });
      }
    } catch (err) {
      console.log(err);
      return res.json({ errCode: 500, errMsg: "System error!" });
    }
  },

  getPupilByLesson: async (req, res) => {
    try {
      let { classId, lessonId } = req.body;
      console.log("classId:", classId, "lessonId:", lessonId);

      if (!classId)
        return res.json({ errCode: 401, errMsg: "Class not found!" });

      let listClassesPupil = [];

      listClassesPupil = await ListPupils.findAll({
        where: {
          classId: classId,
          lessonId: lessonId,
        },
        raw: true,
        order: [["createdAt", "DESC"]],
      });

      return res.json({
        errCode: 200,
        errMsg: "Success!",
        data: listClassesPupil,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ errCode: 500, errMsg: err.message });
    }
  },

  getPupilByLesson3: async (req, res) => {
    try {
      let { classId, pupilId, status, lessonId, userId } = req.body;

      // if (!classId || !pupilId || !status || !lessonId || !userId)
      // return res.json({ errCode: 401, errMsg: "Invalid params!" });

      // Kiểm tra xem classId và pupilId có hợp lệ không
      if (classId && pupilId) {
        let listClassesPupil;
        if (!lessonId) {
          // Nếu không có lessonId, lấy danh sách học sinh của lớp mà không có lessonId
          listClassesPupil = await ListPupils.findAll({
            where: {
              classId: classId,
              lessonId: "",
              status: "attended",
            },
            raw: true,
            order: [["createdAt", "DESC"]],
          });
        } else {
          // Nếu có lessonId, lấy danh sách học sinh của lớp có lessonId
          listClassesPupil = await ListPupils.findAll({
            where: {
              classId: classId,
              lessonId: lessonId,
              status: ["present", "absent"],
            },
            raw: true,
            order: [["createdAt", "DESC"]],
          });
        }

        // Cập nhật trạng thái của học sinh
        await ListPupils.update(
          { status: status, lessonId: lessonId },
          { where: { classId: classId, pupilId: pupilId, userId: userId } }
        );

        // Lấy danh sách học sinh sau khi cập nhật
        let updatedPupils = await ListPupils.findAll({
          where: { classId: classId, pupilId: pupilId, userId: userId },
        });

        return res.json({
          errCode: 200,
          errMsg: "Update success!",
          data: updatedPupils,
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

  presentPupilInClass: async (req, res) => {
    try {
      let { classId, pupilId, lessonId, userId, status } = req.body;
      console.log("xxxxxxxxxxxxxxxxxxxxxx", req.body);
      if (!classId || !pupilId)
        return res.json({ errCode: 401, errMsg: "Invalid params!" });

      let find = await ListPupils.findOne({
        where: {
          classId: classId,
          pupilId: pupilId,
          lessonId: lessonId,
          userId: userId,
        },
        raw: true,
      });

      if (!find) {
        let pupil = await ListPupils.create(
          {
            classId,
            pupilId,
            lessonId,
            userId,
            status,
          },
          { returning: true }
        );
        return res.json({
          errCode: 200,
          errMsg: "present/absent pupil succes!",
          data: pupil,
        });
      } else {
        let pupil = await ListPupils.update(
          { status: status },
          {
            where: {
              classId: classId,
              pupilId: pupilId,
              lessonId: lessonId,
              userId: userId,
            },
          }
        );
        return res.json({
          errCode: 200,
          errMsg: "present/absent pupil succes!",
          data: pupil,
        });
      }
    } catch (err) {
      console.log(err);
      return res.json({
        errCode: 500,
        errMsg: "System Error!",
      });
    }
  },

  absentPupilInClass: async (req, res) => {
    try {
      let { classId, pupilId, lessonId, userId, status } = req.body;
      // console.log("xxxxxxxxxxxxxxxxxxxxxx", req.body);
      if (!classId || !pupilId)
        return res.json({ errCode: 401, errMsg: "Invalid params!" });

      let find = await ListPupils.findOne({
        where: {
          classId: classId,
          pupilId: pupilId,
          lessonId: lessonId,
          userId: userId,
        },
        raw: true,
      });

      if (!find) {
        let pupil = await ListPupils.create(
          {
            classId,
            pupilId,
            lessonId,
            userId,
            status,
          },
          { returning: true }
        );
        return res.json({
          errCode: 200,
          errMsg: "present/absent pupil succes!",
          data: pupil,
        });
      } else {
        let pupil = await ListPupils.update({ status: status });
        return res.json({
          errCode: 200,
          errMsg: "present/absent pupil succes!",
          data: pupil,
        });
      }
    } catch (err) {
      console.log(err);
      return res.json({
        errCode: 500,
        errMsg: "System Error!",
      });
    }
  },

  updateLesson: async (req, res) => {
    try {
      let { lessonId, name, status, content, timeFinish, timeStart } = req.body;
      console.log("hhhhhhhhhhhh", req.body);

      // Kiểm tra xem các tham số truyền vào có tồn tại không
      if (
        !lessonId ||
        !name ||
        !status ||
        !content ||
        !timeFinish ||
        !timeStart
      ) {
        return res.json({ errCode: 401, errMsg: "Invalid params!" });
      }

      // Tạo một đối tượng opts chứa các trường cần cập nhật
      let opts = { name, status, content, timeFinish, timeStart };
      console.log("0000000000000000000000000000000000000", moment(timeFinish));
      // if (moment(timeFinish).isSame(moment(), "minute")) {
      //   opts.status = "finished"; // Thay đổi trạng thái thành "finish"
      //   console.log("1111111111111111111111111111", moment(timeFinish));
      // }
      // console.log("2222222222222222222222222", moment(timeFinis));
      // Cập nhật bài học với các trường được chỉ định
      let findLesson = await Lesson.update(opts, { where: { ID: lessonId } });

      // Kiểm tra xem bài học có được cập nhật thành công không
      if (findLesson[0]) {
        return res.json({ errCode: 200, errMsg: "Update success!" });
      } else {
        return res.json({ errCode: 401, errMsg: "Lesson not found!" });
      }
    } catch (err) {
      console.log(err);
      return res.json({ errCode: 500, errMsg: "System error!" });
    }
  },
};

module.exports = LessonController;
