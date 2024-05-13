const Lesson = require("../models/lessons");
const Classes = require("../models/classes");
const ListPupils = require("../models/listpupils");
const Rooms = require("../models/rooms");
const Pupils = require("../models/pupils");
const Users = require("../models/users");
const { Op } = require("sequelize");
const moment = require("moment");
const cron = require("node-cron");
const LessonController = {
  getAll0: async (req, res) => {
    try {
      let listLessons = await Lesson.findAll({
        order: [["createdAt", "DESC"]],
      });

      for (let lesson of listLessons) {
        if (lesson && lesson.ID) {
          let details = await ListPupils.findAll({
            where: {
              lessonId: lesson.ID,
            },
            raw: true,
          });

          let listLesson = [];
          for (let detail of details) {
            if (detail && detail.pupilId) {
              let pupil = await ListPupils.findOne({
                where: {
                  pupilId: detail.pupilId,
                  lessonId: detail.lessonId,
                },
                raw: true,
              });
              listLesson.push(pupil);
            }
          }
          lesson.pupils = listLesson;

          let detailsS = await ListPupils.findAll({
            where: {
              lessonId: "",
            },
            raw: true,
          });

          let listLessonS = [];
          for (let detail of detailsS) {
            if (detail && detail.pupilId) {
              let pupilS = await ListPupils.findOne({
                where: {
                  pupilId: detail.pupilId,
                  lessonId: "",
                },
                raw: true,
              });
              listLessonS.push(pupilS);
            }
          }
          lesson.pupilsSum = listLessonS || []; // Nếu không có phần tử, gán mảng rỗng

          // Lưu các thay đổi vào cơ sở dữ liệu
          await lesson.save();
        }
      }

      return res.json({
        errCode: 200,
        errMsg: "✅ Success",
        data: listLessons,
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
      let listLessons = await Lesson.findAll({
        // where: {
        //   status: {
        //     [Op.ne]: "canceled" // Sử dụng toán tử không bằng trong Sequelize
        //   }
        // },
        raw: true,
        order: [["createdAt", "DESC"]],
      });
      for (let lesson of listLessons) {
        if (lesson?.ID) {
          let details = await ListPupils.findAll({
            where: {
              lessonId: lesson?.ID,
            },
            raw: true,
          });
          let listLesson = [];
          for (let detail of details) {
            if (detail?.pupilId) {
              let pupil = await ListPupils.findOne({
                where: {
                  pupilId: detail.pupilId,
                  lessonId: detail.lessonId,
                },
                raw: true,
              });
              listLesson.push({
                ...pupil,
              });
            }
          }
          lesson.pupils = listLesson;
          let detailsS = await ListPupils.findAll({
            where: {
              lessonId: "",
            },
            raw: true,
          });
          let listLessonS = [];
          for (let detail of detailsS) {
            if (detail?.pupilId) {
              let pupilS = await ListPupils.findOne({
                where: {
                  pupilId: detail.pupilId,
                  lessonId: "",
                },
                raw: true,
              });
              listLessonS.push({
                ...pupilS,
              });
            }
          }
          lesson.pupilsSum = listLessonS;
        }
      }
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

          // Tìm thông tin lớp học dựa trên classId của từng bài học
          let classData = await Classes.findOne({
            where: { ID: lesson.classId },
            attributes: ["status"], // Chỉ lấy trường status
            raw: true,
          });

          // Gán trạng thái vào trường statusClass của bài học
          lesson.statusClass = classData.status;
          // Lấy chi tiết đơn hàng từ cơ sở dữ liệu, dựa trên ID của đơn hàng hiện tại
          let details = await ListPupils.findAll({
            where: {
              lessonId: lesson?.ID,
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
                  lessonId: detail.lessonId,
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

          /////////////////////////////

          let detailsS = await ListPupils.findAll({
            where: {
              lessonId: "",
              classId: ID,
            },
            raw: true,
          });
          let listLessonS = []; // Khởi tạo mảng để lưu trữ danh sách sản phẩm trong đơn hàng
          // Duyệt qua từng chi tiết đơn hàng
          for (let detail of detailsS) {
            if (detail?.pupilId) {
              // Kiểm tra xem chi tiết đơn hàng có ID sản phẩm không
              // Lấy thông tin của sản phẩm từ cơ sở dữ liệu dựa trên ID sản phẩm
              let pupilS = await ListPupils.findOne({
                where: {
                  pupilId: detail.pupilId,
                  lessonId: "",
                },
                raw: true,
              });
              // Thêm thông tin sản phẩm và số lượng vào danh sách sản phẩm trong đơn hàng
              listLessonS.push({
                ...pupilS,
                // quantity: detail.quantity,
              });
            }
          }
          // Gán danh sách sản phẩm vào đơn hàng
          lesson.pupilsSum = listLessonS;
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

  getLessonByUser: async (req, res) => {
    try {
      let { ID } = req.body;

      // Kiểm tra ID không được bỏ trống
      if (!ID) {
        return res.json({
          errCode: 401,
          errMsg: "ID must not be empty!",
        });
      }

      // Tìm các bài học mà người dùng đã tạo
      let listLessons = await Lesson.findAll({
        where: {
          userId: ID,
        },
        raw: true,
        order: [["createdAt", "DESC"]],
      });
      for (let lesson of listLessons) {
        if (lesson?.ID) {
          // Kiểm tra xem đơn hàng có ID không
          // Lấy chi tiết đơn hàng từ cơ sở dữ liệu, dựa trên ID của đơn hàng hiện tại
          let details = await ListPupils.findAll({
            where: {
              lessonId: lesson?.ID,
              userId: ID,
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
                  lessonId: detail.lessonId,
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

          /////////////////////////////

          let detailsS = await ListPupils.findAll({
            where: {
              lessonId: "",
              userId: ID,
            },
            raw: true,
          });
          let listLessonS = []; // Khởi tạo mảng để lưu trữ danh sách sản phẩm trong đơn hàng
          // Duyệt qua từng chi tiết đơn hàng
          for (let detail of detailsS) {
            if (detail?.pupilId) {
              // Kiểm tra xem chi tiết đơn hàng có ID sản phẩm không
              // Lấy thông tin của sản phẩm từ cơ sở dữ liệu dựa trên ID sản phẩm
              let pupilS = await ListPupils.findOne({
                where: {
                  pupilId: detail.pupilId,
                  lessonId: "",
                },
                raw: true,
              });
              // Thêm thông tin sản phẩm và số lượng vào danh sách sản phẩm trong đơn hàng
              listLessonS.push({
                ...pupilS,
                // quantity: detail.quantity,
              });
            }
          }
          // Gán danh sách sản phẩm vào đơn hàng
          lesson.pupilsSum = listLessonS;
        }
      }
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

  getLessonByUser0: async (req, res) => {
    try {
      let { ID } = req.body;
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

  createLesson0: async (req, res) => {
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

        // const findRoom = await Rooms.findOne({
        //   where: { ID: roomId },
        //   raw: true,
        // });
        // if (!findRoom) {
        //   return res.json({
        //     errCode: 401,
        //     errMsg: "Room not found or deleted!",
        //   });
        // } else {
        //   let newLesson = await Rooms.update(
        //     {
        //       status: "full",
        //     },
        //     {
        //       where: {
        //         ID: roomId,
        //       },
        //     }
        //   );
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

  createLessonA: async (req, res) => {
    try {
      let { name, userId, classId, roomId, content, timeStart, timeFinish } =
        req.body;
      console.log("req.bodyreq.body", req.body);
      // Check if userId and classId are provided
      if (!userId || !classId)
        return res.json({ errCode: 401, errMsg: "Invalid params!" });

      const findClass = await Classes.findOne({
        where: { ID: classId, userId: userId },
        raw: true,
      });

      if (!findClass) {
        return res.json({
          errCode: 401,
          errMsg: "Lecturer does not match with the class!",
        });
      }

      // Create a new lesson
      let newLesson = await Lesson.create(
        {
          name,
          status: "started",
          userId,
          classId,
          roomId,
          content,
          timeStart: moment(timeStart),
          timeFinish: moment(timeFinish),
        },
        { returning: true }
      );

      // Check if the room exists and update its status
      const findRoom = await Rooms.findOne({
        where: { ID: roomId },
        raw: true,
      });
      if (!findRoom) {
        return res.json({
          errCode: 401,
          errMsg: "Room not found or deleted!",
        });
      }

      // Update the room status based on current time
      if (moment().isBefore(moment(timeStart))) {
        await Rooms.update(
          {
            status: "empty",
          },
          {
            where: {
              ID: findRoom.ID,
            },
          }
        );
        await Lesson.update(
          {
            status: "prepare",
          },
          {
            where: {
              ID: newLesson.ID,
            },
          }
        );

        const remainingTime1 = moment(timeStart).diff(moment());
        setTimeout(async () => {
          await Rooms.update(
            {
              status: "full",
            },
            {
              where: {
                ID: findRoom.ID,
              },
            }
          );
          await Lesson.update(
            {
              status: "started",
            },
            {
              where: {
                ID: newLesson.ID,
              },
            }
          );
        }, remainingTime1);

        const remainingTime2 = moment(timeFinish).diff(moment());
        setTimeout(async () => {
          await Rooms.update(
            {
              status: "empty",
            },
            {
              where: {
                ID: findRoom.ID,
              },
            }
          );
          await Lesson.update(
            {
              status: "finished",
            },
            {
              where: {
                ID: newLesson.ID,
              },
            }
          );
        }, remainingTime2);
      } else if (
        moment().isAfter(moment(timeStart)) &&
        moment().isBefore(moment(timeFinish))
      ) {
        await Rooms.update(
          {
            status: "full",
          },
          {
            where: {
              ID: findRoom.ID,
            },
          }
        );
        await Lesson.update(
          {
            status: "started",
          },
          {
            where: {
              ID: newLesson.ID,
            },
          }
        );

        const remainingTime = moment(timeFinish).diff(moment());
        setTimeout(async () => {
          await Rooms.update(
            {
              status: "empty",
            },
            {
              where: {
                ID: findRoom.ID,
              },
            }
          );
          // Update the lesson status to "finished"
          await Lesson.update(
            {
              status: "finished",
            },
            {
              where: {
                ID: newLesson.ID,
              },
            }
          );
        }, remainingTime);
      } else if (moment().isAfter(moment(timeFinish))) {
        await Rooms.update(
          {
            status: "empty",
          },
          {
            where: {
              ID: findRoom.ID,
            },
          }
        );
        await Lesson.update(
          {
            status: "finished",
          },
          {
            where: {
              ID: newLesson.ID,
            },
          }
        );
      }

      return res.json({
        errCode: 200,
        errMsg: "Create lesson success!",
        data: newLesson,
      });
    } catch (err) {
      console.log(err);
      return res.json({
        errCode: 500,
        errMsg: "System Error!",
      });
    }
  },

  createLessonFInal0: async (req, res) => {
    try {
      let { name, classId, roomId, content, timeStart, timeFinish, role } =
        req.body;
      console.log("req.bodyreq.body", req.body);

      if (
        !classId ||
        !name ||
        !roomId ||
        !content ||
        !timeFinish ||
        !timeStart ||
        !role
      ) {
        return res.json({
          errCode: 401,
          errMsg: "❌ Information must not be empty!",
        });
      }

      if (role !== "manager") {
        return res.json({
          errCode: 401,
          errMsg: "❌ You are not a manager!",
        });
      }

      // if (moment(timeStart).isBefore(moment())) {
      //   return res.json({
      //     errCode: 401,
      //     errMsg: "❌ TimeStart must be after moment!",
      //   });
      // }

      if (moment(timeFinish).isBefore(moment(timeStart))) {
        return res.json({
          errCode: 401,
          errMsg: "❌ TimeFinish must be after TimeStart!",
        });
      }

      const findClass = await Classes.findOne({
        where: { ID: classId },
        raw: true,
      });

      if (!findClass) {
        return res.json({
          errCode: 401,
          errMsg: "❌ Class is not found!",
        });
      }

      const findRoom = await Rooms.findOne({
        where: { ID: roomId },
        raw: true,
      });

      if (!findRoom) {
        return res.json({
          errCode: 401,
          errMsg: "❌ Room is not found!",
        });
      }

      const conflictingLessons = await Lesson.findAll({
        where: {
          // timeStart: timeStart,
          // timeFinish: {
          //   [Op.gt]: timeStart,
          // },
          status: {
            [Op.ne]: "canceled",
          },
          roomId: roomId,
        },
        raw: true,
      });
      const isConflicting = conflictingLessons.some((lesson) => {
        return timeStart >= lesson.timeStart && timeStart <= lesson.timeFinish;
      });

      if (isConflicting) {
        return res.json({
          errCode: 401,
          errMsg: "❌ There are lessons with conflicting room assignments!",
        });
      }
      // if (conflictingLessons.length > 0) {
      //   return res.json({
      //     errCode: 401,
      //     errMsg: "❌ There are lessons with conflicting room assignments!",
      //   });
      // }

      const conflictingLessons1 = await Lesson.findAll({
        where: {
          // timeFinish: {
          //   [Op.gt]: timeStart,
          // },
          // timeStart: timeStart,
          status: {
            [Op.ne]: "canceled",
          },
          classId: classId,
        },
        raw: true,
      });
      const isConflicting1 = conflictingLessons1.some((lesson) => {
        return timeStart >= lesson.timeStart && timeStart <= lesson.timeFinish;
      });

      if (isConflicting1) {
        return res.json({
          errCode: 401,
          errMsg: "❌ There are lessons with conflicting class assignments!",
        });
      }
      // if (conflictingLessons1.length > 0) {
      //   return res.json({
      //     errCode: 401,
      //     errMsg: "❌ There are lessons with conflicting class assignments!",
      //   });
      // }

      let newLesson = await Lesson.create(
        {
          name,
          status: "started",
          userId: findClass.userId,
          classId,
          roomId,
          content,
          timeStart: moment(timeStart),
          timeFinish: moment(timeFinish),
        },
        { returning: true }
      );

      if (moment().isBefore(moment(timeStart))) {
        await Rooms.update({ status: "empty" }, { where: { ID: findRoom.ID } });
        await Lesson.update(
          { status: "prepare" },
          { where: { ID: newLesson.ID } }
        );

        const remainingTime1 = moment(timeStart).diff(moment());
        setTimeout(async () => {
          await Rooms.update(
            { status: "full" },
            { where: { ID: findRoom.ID } }
          );
          await Lesson.update(
            { status: "started" },
            { where: { ID: newLesson.ID } }
          );
        }, remainingTime1);

        const remainingTime2 = moment(timeFinish).diff(moment());
        setTimeout(async () => {
          await Rooms.update(
            { status: "empty" },
            { where: { ID: findRoom.ID } }
          );
          await Lesson.update(
            { status: "finished" },
            { where: { ID: newLesson.ID } }
          );
        }, remainingTime2);
      } else if (
        moment().isAfter(moment(timeStart)) &&
        moment().isBefore(moment(timeFinish))
      ) {
        await Rooms.update({ status: "full" }, { where: { ID: findRoom.ID } });
        await Lesson.update(
          { status: "started" },
          { where: { ID: newLesson.ID } }
        );

        const remainingTime = moment(timeFinish).diff(moment());
        setTimeout(async () => {
          await Rooms.update(
            { status: "empty" },
            { where: { ID: findRoom.ID } }
          );
          await Lesson.update(
            { status: "finished" },
            { where: { ID: newLesson.ID } }
          );
        }, remainingTime);
      } else if (
        moment().isAfter(moment(timeFinish)) &&
        moment().isAfter(moment(timeStart))
      ) {
        await Rooms.update({ status: "empty" }, { where: { ID: findRoom.ID } });
        await Lesson.update(
          { status: "finished" },
          { where: { ID: newLesson.ID } }
        );
      }
      const lessonCount = await Lesson.count({
        where: { classId: classId },
      });

      if (lessonCount === 90) {
        await Classes.update(
          { status: "finished" },
          { where: { ID: classId } }
        );
      }
      return res.json({
        errCode: 200,
        errMsg: "✅ Create success!",
        data: newLesson,
      });
    } catch (err) {
      console.log(err);
      return res.json({
        errCode: 500,
        errMsg: "❎ System error❗️",
      });
    }
  },

  createLesson: async (req, res) => {
    try {
      let { name, classId, roomId, content, timeStart, timeFinish, role } =
        req.body;
      console.log("req.bodyreq.body", req.body);

      if (
        !classId ||
        !name ||
        !roomId ||
        !content ||
        !timeFinish ||
        !timeStart ||
        !role
      ) {
        return res.json({
          errCode: 401,
          errMsg: "❌ Information must not be empty!",
        });
      }

      if (role !== "manager") {
        return res.json({
          errCode: 401,
          errMsg: "❌ You are not a manager!",
        });
      }

      if (moment(timeFinish).isBefore(moment(timeStart))) {
        return res.json({
          errCode: 401,
          errMsg: "❌ TimeFinish must be after TimeStart!",
        });
      }

      const findClass = await Classes.findOne({
        where: { ID: classId },
        raw: true,
      });

      if (!findClass) {
        return res.json({
          errCode: 401,
          errMsg: "❌ Class is not found!",
        });
      }

      const findRoom = await Rooms.findOne({
        where: { ID: roomId },
        raw: true,
      });

      if (!findRoom) {
        return res.json({
          errCode: 401,
          errMsg: "❌ Room is not found!",
        });
      }

      const currentTime = moment.utc();

      const conflictingLessonsRoom = await Lesson.findAll({
        where: {
          status: { [Op.ne]: "canceled" },
          roomId: roomId,
        },
        raw: true,
      });

      const conflictingLessonsClass = await Lesson.findAll({
        where: {
          status: { [Op.ne]: "canceled" },
          classId: classId,
        },
        raw: true,
      });
      const teacherIds = conflictingLessonsClass.map(lesson => lesson.userId);
      const conflictingTeachers = await Lesson.findAll({
        where: {
          userId: teacherIds,
        },
        raw: true,
      });
      const isConflictingRoom = conflictingLessonsRoom.some((lesson) => {
        return (
          (moment(timeStart).isSameOrAfter(lesson.timeStart) &&
            moment(timeStart).isSameOrBefore(lesson.timeFinish)) ||
          (moment(timeFinish).isSameOrAfter(lesson.timeStart) &&
            moment(timeFinish).isSameOrBefore(lesson.timeFinish)) ||
          (moment(timeStart).isBefore(lesson.timeStart) &&
            moment(timeFinish).isAfter(lesson.timeFinish))
        );
      });

      if (isConflictingRoom) {
        return res.json({
          errCode: 401,
          errMsg: "❌ There are lessons with conflicting room assignments!",
        });
      }

      const isConflictingClass = conflictingTeachers.some((lesson) => {
        return (
          (moment(timeStart).isSameOrAfter(lesson.timeStart) &&
            moment(timeStart).isSameOrBefore(lesson.timeFinish)) ||
          (moment(timeFinish).isSameOrAfter(lesson.timeStart) &&
            moment(timeFinish).isSameOrBefore(lesson.timeFinish)) ||
          (moment(timeStart).isBefore(lesson.timeStart) &&
            moment(timeFinish).isAfter(lesson.timeFinish))
        );
      });

      if (isConflictingClass) {
        return res.json({
          errCode: 401,
          errMsg: "❌ There are lessons with conflicting lecturer assignments!",
        });
      }

      let newLesson = await Lesson.create({
        name,
        status: "started",
        userId: findClass.userId,
        classId,
        roomId,
        content,
        timeStart: moment.utc(timeStart),
        timeFinish: moment.utc(timeFinish),
      });

      const lessonCount = await Lesson.count({ where: { classId: classId } });

      if (moment().isBefore(moment(timeStart))) {
        await Rooms.update({ status: "empty" }, { where: { ID: findRoom.ID } });
        await Lesson.update(
          { status: "prepare" },
          { where: { ID: newLesson.ID } }
        );

        const remainingTime1 = moment(timeStart).diff(currentTime);
        setTimeout(async () => {
          await Rooms.update(
            { status: "full" },
            { where: { ID: findRoom.ID } }
          );
          await Lesson.update(
            { status: "started" },
            { where: { ID: newLesson.ID } }
          );
        }, remainingTime1);

        const remainingTime2 = moment(timeFinish).diff(currentTime);
        setTimeout(async () => {
          await Rooms.update(
            { status: "empty" },
            { where: { ID: findRoom.ID } }
          );
          await Lesson.update(
            { status: "finished" },
            { where: { ID: newLesson.ID } }
          );
        }, remainingTime2);
      } else if (
        moment().isAfter(moment(timeStart)) &&
        moment().isBefore(moment(timeFinish))
      ) {
        await Rooms.update({ status: "full" }, { where: { ID: findRoom.ID } });
        await Lesson.update(
          { status: "started" },
          { where: { ID: newLesson.ID } }
        );

        const remainingTime = moment(timeFinish).diff(currentTime);
        setTimeout(async () => {
          await Rooms.update(
            { status: "empty" },
            { where: { ID: findRoom.ID } }
          );
          await Lesson.update(
            { status: "finished" },
            { where: { ID: newLesson.ID } }
          );
        }, remainingTime);
      } else if (
        moment().isAfter(moment(timeFinish)) &&
        moment().isAfter(moment(timeStart))
      ) {
        await Rooms.update({ status: "empty" }, { where: { ID: findRoom.ID } });
        await Lesson.update(
          { status: "finished" },
          { where: { ID: newLesson.ID } }
        );
      }

      if (lessonCount === 90) {
        await Classes.update(
          { status: "finished" },
          { where: { ID: classId } }
        );
      }

      return res.json({
        errCode: 200,
        errMsg: "✅ Create success!",
        data: newLesson,
      });
    } catch (err) {
      console.log(err);
      return res.json({
        errCode: 500,
        errMsg: "❎ System error❗️",
      });
    }
  },

  createLesson00: async (req, res) => {
    try {
      let { name, userId, classId, roomId, content, timeStart, timeFinish } =
        req.body;

      // Check if userId and classId are provided
      if (!userId || !classId)
        return res.json({ errCode: 401, errMsg: "Invalid params!" });

      const findClass = await Classes.findOne({
        where: { ID: classId, userId: userId },
        raw: true,
      });

      if (!findClass) {
        return res.json({
          errCode: 401,
          errMsg: "Lecturer does not match with the class!",
        });
      }

      // Create a new lesson
      let newLesson = await Lesson.create(
        {
          name,
          status: "started",
          userId,
          classId,
          roomId,
          content,
          timeStart: moment(timeStart),
          timeFinish: moment(timeFinish),
        },
        { returning: true }
      );

      // Check if the room exists and update its status
      const findRoom = await Rooms.findOne({
        where: { ID: roomId },
        raw: true,
      });
      if (!findRoom) {
        return res.json({
          errCode: 401,
          errMsg: "Room not found or deleted!",
        });
      }

      // Schedule cronjobs to handle lesson and room statuses
      const currentTime = moment();
      const prepareTime = moment(timeStart).diff(currentTime);
      const lessonStartTime = moment(timeStart);
      const lessonEndTime = moment(timeFinish);

      // Schedule cronjob to update room status and lesson status to "prepare"
      cron.schedule(
        new Date(Date.now() + prepareTime),
        async () => {
          await Rooms.update(
            { status: "empty" },
            { where: { ID: findRoom.ID } }
          );
          await Lesson.update(
            { status: "prepare" },
            { where: { ID: newLesson.ID } }
          );
        },
        {
          timezone: "Asia/Ho_Chi_Minh", // Set your desired timezone here
        }
      );

      // Schedule cronjob to update room status and lesson status to "started"
      cron.schedule(
        lessonStartTime.format(),
        async () => {
          await Rooms.update(
            { status: "full" },
            { where: { ID: findRoom.ID } }
          );
          await Lesson.update(
            { status: "started" },
            { where: { ID: newLesson.ID } }
          );
        },
        {
          timezone: "Asia/Ho_Chi_Minh", // Set your desired timezone here
        }
      );

      // Schedule cronjob to update room status and lesson status to "finished"
      cron.schedule(
        lessonEndTime.format(),
        async () => {
          await Rooms.update(
            { status: "empty" },
            { where: { ID: findRoom.ID } }
          );
          await Lesson.update(
            { status: "finished" },
            { where: { ID: newLesson.ID } }
          );
        },
        {
          timezone: "Asia/Ho_Chi_Minh", // Set your desired timezone here
        }
      );

      return res.json({
        errCode: 200,
        errMsg: "Create lesson success!",
        data: newLesson,
      });
    } catch (err) {
      console.log(err);
      return res.json({
        errCode: 500,
        errMsg: "System Error!",
      });
    }
  },

  addLesson: async (req, res) => {
    try {
      let { name, userId, classId, roomId, content, timeStart, timeFinish } =
        req.body;
      console.log("ADD LESSON", req.body);
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
      }
      const subjectIdOfClass = findClass.subjectId;

      // Kiểm tra xem userId có phù hợp với subjectId của class hay không
      const findUser = await Users.findOne({
        where: { ID: userId, subjectId: subjectIdOfClass },
        raw: true,
      });

      // Nếu không tìm thấy user có subjectId phù hợp, trả về lỗi
      if (!findUser) {
        return res.json({
          errCode: 401,
          errMsg: "User's subjectId does not match with the class's subjectId!",
        });
      }

      let newLesson = await Lesson.create(
        {
          name,
          status: "started",
          userId,
          classId,
          roomId,
          content,
          timeStart: moment(timeStart),
          timeFinish: moment(timeFinish),
        },
        { returning: true }
      );
      // const findRoom = await Rooms.findOne({
      //   where: { ID: roomId },
      //   raw: true,
      // });
      // if (!findRoom) {
      //   return res.json({
      //     errCode: 401,
      //     errMsg: "Room not found or deleted!",
      //   });
      // }
      // if (moment().isBefore(moment(timeFinish))) {
      //   await Rooms.update(
      //     {
      //       status: "full",
      //     },
      //     {
      //       where: {
      //         ID: roomId,
      //       },
      //     }
      //   );
      //   await Lesson.update(
      //     {
      //       status: "started",
      //     },
      //     {
      //       where: {
      //         ID: newLesson.ID,
      //       },
      //     }
      //   );
      //   // Calculate the duration between timeStart and timeFinish in milliseconds
      // const duration = moment(timeFinish).diff(moment());

      // // After the calculated duration, update the room status to "empty" and the lesson status to "finished"
      // setTimeout(async () => {
      //   await Rooms.update(
      //     {
      //       status: "empty",
      //     },
      //     {
      //       where: {
      //         ID: roomId,
      //       },
      //     }
      //   );
      //   // Update the lesson status to "finished"
      //   await Lesson.update(
      //     {
      //       status: "finished",
      //     },
      //     {
      //       where: {
      //         ID: newLesson.ID,
      //       },
      //     }
      //   );
      // }, duration);
      // }
      // else {
      //   await Rooms.update(
      //     {
      //       status: "empty",
      //     },
      //     {
      //       where: {
      //         ID: roomId,
      //       },
      //     }
      //   );
      //   // await Lesson.update(
      //   //   {
      //   //     status: "started",
      //   //   },
      //   //   {
      //   //     where: {
      //   //       ID: newLesson.ID,
      //   //     },
      //   //   }
      //   // );
      // }

      return res.json({
        errCode: 200,
        errMsg: "Create lesson success!",
        data: newLesson,
      });
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

  updateLessonFinal0: async (req, res) => {
    try {
      let {
        lessonId,
        name,
        status,
        content,
        timeFinish,
        timeStart,
        roomId,
        classId,
      } = req.body;
      console.log("KKKKKKKKKKK", req.body);
      // Kiểm tra xem các tham số truyền vào có tồn tại không
      if (
        !lessonId ||
        !name ||
        // !status ||
        !content ||
        !timeFinish ||
        !timeStart ||
        !roomId ||
        !classId
      ) {
        return res.json({
          errCode: 401,
          errMsg: "❌ Information must not be empty!",
        });
      }
      if (moment(timeStart).isBefore(moment())) {
        return res.json({
          errCode: 401,
          errMsg: "❌ TimeStart must be after moment!",
        });
      }
      if (moment(timeFinish).isBefore(moment(timeStart))) {
        return res.json({
          errCode: 401,
          errMsg: "❌ TimeFinish must be after TimeStart!",
        });
      }
      const statusLessons = await Lesson.findAll({
        where: {
          ID: lessonId,
          status: {
            [Op.ne]: "canceled", // Sử dụng toán tử không bằng trong Sequelize
          },
        },
        raw: true,
      });
      if (statusLessons.length === 0) {
        return res.json({
          errCode: 404,
          errMsg: "❌ Lesson not found!",
        });
      }
      const lessonStatus = statusLessons[0].status;
      if (lessonStatus === "finished") {
        return res.json({
          errCode: 401,
          errMsg: "❌ Lesson is finished!",
        });
      }

      const findRoom = await Rooms.findOne({
        where: { ID: roomId },
        raw: true,
      });
      if (!findRoom) {
        return res.json({
          errCode: 401,
          errMsg: "❌ Room is not found!",
        });
      }

      const conflictingLessons = await Lesson.findAll({
        where: {
          timeFinish: {
            [Op.gt]: timeStart, // Chỉ lấy các bản ghi mà timeFinish nhỏ hơn timeStart
          },
          status: {
            [Op.ne]: "canceled", // Sử dụng toán tử không bằng trong Sequelize
          },
          roomId: roomId,
        },
        raw: true,
      });

      if (conflictingLessons.length > 0) {
        return res.json({
          errCode: 401,
          errMsg: "❌ There are lessons with conflicting room assignments!",
        });
      }
      const conflictingLessons1 = await Lesson.findAll({
        where: {
          timeFinish: {
            [Op.gt]: timeStart, // Chỉ lấy các bản ghi mà timeFinish nhỏ hơn timeStart
          },
          status: {
            [Op.ne]: "canceled", // Sử dụng toán tử không bằng trong Sequelize
          },
          classId: classId,
        },
        raw: true,
      });

      if (conflictingLessons1.length > 0) {
        return res.json({
          errCode: 401,
          errMsg: "❌ There are lessons with conflicting class assignments!",
        });
      }

      let opts = { name, status, content, timeFinish, timeStart, roomId };

      let findLesson = await Lesson.update(opts, { where: { ID: lessonId } });
      if (status !== "canceled" && moment().isBefore(moment(timeStart))) {
        await Rooms.update(
          {
            status: "empty",
          },
          {
            where: {
              ID: findRoom.ID,
            },
          }
        );
        await Lesson.update(
          {
            status: "prepare",
          },
          {
            where: {
              ID: lessonId,
            },
          }
        );

        const remainingTime1 = moment(timeStart).diff(moment());
        setTimeout(async () => {
          await Rooms.update(
            {
              status: "full",
            },
            {
              where: {
                ID: findRoom.ID,
              },
            }
          );
          await Lesson.update(
            {
              status: "started",
            },
            {
              where: {
                ID: lessonId,
              },
            }
          );
        }, remainingTime1);

        const remainingTime2 = moment(timeFinish).diff(moment());
        setTimeout(async () => {
          await Rooms.update(
            {
              status: "empty",
            },
            {
              where: {
                ID: findRoom.ID,
              },
            }
          );
          await Lesson.update(
            {
              status: "finished",
            },
            {
              where: {
                ID: lessonId,
              },
            }
          );
        }, remainingTime2);
      } else if (
        status !== "canceled" &&
        moment().isAfter(moment(timeStart)) &&
        moment().isBefore(moment(timeFinish))
      ) {
        await Rooms.update(
          {
            status: "full",
          },
          {
            where: {
              ID: findRoom.ID,
            },
          }
        );
        await Lesson.update(
          {
            status: "started",
          },
          {
            where: {
              ID: lessonId,
            },
          }
        );

        const remainingTime = moment(timeFinish).diff(moment());
        setTimeout(async () => {
          await Rooms.update(
            {
              status: "empty",
            },
            {
              where: {
                ID: findRoom.ID,
              },
            }
          );
          // Update the lesson status to "finished"
          await Lesson.update(
            {
              status: "finished",
            },
            {
              where: {
                ID: lessonId,
              },
            }
          );
        }, remainingTime);
      } else if (
        status !== "canceled" &&
        moment().isAfter(moment(timeFinish))
      ) {
        await Rooms.update(
          {
            status: "empty",
          },
          {
            where: {
              ID: findRoom.ID,
            },
          }
        );
        await Lesson.update(
          {
            status: "finished",
          },
          {
            where: {
              ID: lessonId,
            },
          }
        );
      }

      // Kiểm tra xem bài học có được cập nhật thành công không
      if (findLesson[0]) {
        return res.json({ errCode: 200, errMsg: "✅ Update success!" });
      } else {
        return res.json({ errCode: 401, errMsg: "❌ Lesson not found!" });
      }
    } catch (err) {
      console.log(err);
      return res.json({ errCode: 500, errMsg: "❎ System error❗️" });
    }
  },
  updateLesson: async (req, res) => {
    try {
      let {
        lessonId,
        name,
        status,
        content,
        timeFinish,
        timeStart,
        roomId,
        classId,
      } = req.body;
      console.log("KKKKKKKKKKK", req.body);
      // Kiểm tra xem các tham số truyền vào có tồn tại không
      if (
        !lessonId ||
        !name ||
        // !status ||
        !content ||
        !timeFinish ||
        !timeStart ||
        !roomId ||
        !classId
      ) {
        return res.json({
          errCode: 401,
          errMsg: "❌ Information must not be empty!",
        });
      }

      // if (moment(timeStart).isBefore(moment())) {
      //   return res.json({
      //     errCode: 401,
      //     errMsg: "❌ TimeStart must be after moment!",
      //   });
      // }
      if (moment(timeFinish).isBefore(moment(timeStart))) {
        return res.json({
          errCode: 401,
          errMsg: "❌ TimeFinish must be after TimeStart!",
        });
      }
      const statusLessons = await Lesson.findAll({
        where: {
          ID: lessonId,
          status: {
            [Op.ne]: "canceled", // Sử dụng toán tử không bằng trong Sequelize
          },
        },
        raw: true,
      });
      if (statusLessons.length === 0) {
        return res.json({
          errCode: 404,
          errMsg: "❌ Lesson not found!",
        });
      }
      const lessonStatus = statusLessons[0].status;
      if (lessonStatus === "finished") {
        return res.json({
          errCode: 401,
          errMsg: "❌ Lesson is finished!",
        });
      }
      const findClass = await Classes.findOne({
        where: { ID: classId },
        raw: true,
      });

      if (!findClass) {
        return res.json({
          errCode: 401,
          errMsg: "❌ Class is not found!",
        });
      }
      const findRoom = await Rooms.findOne({
        where: { ID: roomId },
        raw: true,
      });
      if (!findRoom) {
        return res.json({
          errCode: 401,
          errMsg: "❌ Room is not found!",
        });
      }
      const currentTime = moment.utc();
      const conflictingLessonsRoom = await Lesson.findAll({
        where: {
          status: { [Op.ne]: "canceled" },
          roomId: roomId,
        },
        raw: true,
      });
      

      const isConflictingRoom = conflictingLessonsRoom.some((lesson) => {
        return (
          (moment(timeStart).isSameOrAfter(lesson.timeStart) &&
            moment(timeStart).isSameOrBefore(lesson.timeFinish)) ||
          (moment(timeFinish).isSameOrAfter(lesson.timeStart) &&
            moment(timeFinish).isSameOrBefore(lesson.timeFinish)) ||
          (moment(timeStart).isBefore(lesson.timeStart) &&
            moment(timeFinish).isAfter(lesson.timeFinish))
        );
      });

      if (isConflictingRoom) {
        return res.json({
          errCode: 401,
          errMsg: "❌ There are lessons with conflicting room assignments!",
        });
      }

      const conflictingLessonsClass = await Lesson.findAll({
        where: {
          status: { [Op.ne]: "canceled" },
          classId: classId,
        },
        raw: true,
      });
      const teacherIds = conflictingLessonsClass.map(lesson => lesson.userId);
      const conflictingTeachers = await Lesson.findAll({
        where: {
          userId: teacherIds,
        },
        raw: true,
      });
      const isConflictingClass = conflictingTeachers.some((lesson) => {
        return (
          (moment(timeStart).isSameOrAfter(lesson.timeStart) &&
            moment(timeStart).isSameOrBefore(lesson.timeFinish)) ||
          (moment(timeFinish).isSameOrAfter(lesson.timeStart) &&
            moment(timeFinish).isSameOrBefore(lesson.timeFinish)) ||
          (moment(timeStart).isBefore(lesson.timeStart) &&
            moment(timeFinish).isAfter(lesson.timeFinish))
        );
      });

      if (isConflictingClass) {
        return res.json({
          errCode: 401,
          errMsg: "❌ There are lessons with conflicting lecturer assignments!",
        });
      }

      let opts = { name, status, content, timeFinish, timeStart, roomId };

      let findLesson = await Lesson.update(opts, { where: { ID: lessonId } });
      if (status !== "canceled" && moment().isBefore(moment(timeStart))) {
        await Rooms.update(
          {
            status: "empty",
          },
          {
            where: {
              ID: findRoom.ID,
            },
          }
        );
        await Lesson.update(
          {
            status: "prepare",
          },
          {
            where: {
              ID: lessonId,
            },
          }
        );

        const remainingTime1 = moment(timeStart).diff(moment());
        setTimeout(async () => {
          await Rooms.update(
            {
              status: "full",
            },
            {
              where: {
                ID: findRoom.ID,
              },
            }
          );
          await Lesson.update(
            {
              status: "started",
            },
            {
              where: {
                ID: lessonId,
              },
            }
          );
        }, remainingTime1);

        const remainingTime2 = moment(timeFinish).diff(moment());
        setTimeout(async () => {
          await Rooms.update(
            {
              status: "empty",
            },
            {
              where: {
                ID: findRoom.ID,
              },
            }
          );
          await Lesson.update(
            {
              status: "finished",
            },
            {
              where: {
                ID: lessonId,
              },
            }
          );
        }, remainingTime2);
      } else if (
        status !== "canceled" &&
        moment().isAfter(moment(timeStart)) &&
        moment().isBefore(moment(timeFinish))
      ) {
        await Rooms.update(
          {
            status: "full",
          },
          {
            where: {
              ID: findRoom.ID,
            },
          }
        );
        await Lesson.update(
          {
            status: "started",
          },
          {
            where: {
              ID: lessonId,
            },
          }
        );

        const remainingTime = moment(timeFinish).diff(moment());
        setTimeout(async () => {
          await Rooms.update(
            {
              status: "empty",
            },
            {
              where: {
                ID: findRoom.ID,
              },
            }
          );
          // Update the lesson status to "finished"
          await Lesson.update(
            {
              status: "finished",
            },
            {
              where: {
                ID: lessonId,
              },
            }
          );
        }, remainingTime);
      } else if (
        status !== "canceled" &&
        moment().isAfter(moment(timeFinish))
      ) {
        await Rooms.update(
          {
            status: "empty",
          },
          {
            where: {
              ID: findRoom.ID,
            },
          }
        );
        await Lesson.update(
          {
            status: "finished",
          },
          {
            where: {
              ID: lessonId,
            },
          }
        );
      }

      // Kiểm tra xem bài học có được cập nhật thành công không
      if (findLesson[0]) {
        return res.json({ errCode: 200, errMsg: "✅ Update success!" });
      } else {
        return res.json({ errCode: 401, errMsg: "❌ Lesson not found!" });
      }
    } catch (err) {
      console.log(err);
      return res.json({ errCode: 500, errMsg: "❎ System error❗️" });
    }
  },
  updateLessonInLesson: async (req, res) => {
    try {
      let { lessonId, name, status, content } = req.body;
      if (!lessonId || !name || !status || !content) {
        return res.json({
          errCode: 401,
          errMsg: "❌ Information must not be empty!",
        });
      }

      // Tạo một đối tượng opts chứa các trường cần cập nhật
      let opts = { name, status, content };

      let findLesson = await Lesson.update(opts, { where: { ID: lessonId } });

      // Kiểm tra xem bài học có được cập nhật thành công không
      if (findLesson[0]) {
        return res.json({ errCode: 200, errMsg: "✅ Update success!" });
      } else {
        return res.json({ errCode: 401, errMsg: "❌ Lesson not found!" });
      }
    } catch (err) {
      console.log(err);
      return res.json({ errCode: 500, errMsg: "❎ System error❗️" });
    }
  },
  getDetailLesson: async (req, res) => {
    try {
      let { ID } = req.body;
      console.log("mmmmmmmmmmmmmmmmmmmmm", req.body);
      if (!ID)
        return res.json({ errCode: 401, errMsg: "❌ Lesson not found!" });

      const detailClss = await Lesson.findAll({
        where: {
          ID: ID,
        },
        raw: true,
        order: [["createdAt", "DESC"]],
      });

      const pupils = await ListPupils.findAll({
        where: {
          lessonId: ID,
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
};

module.exports = LessonController;
