const Lesson = require("../models/lessons");
const Classes = require("../models/classes");
const ListPupils = require("../models/listpupils");
const Pupils = require("../models/pupils");
const Subjects = require("../models/subjects");
const Users = require("../models/users");
const { Op } = require("sequelize");
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
              let pupil = await Pupils.findOne({
                where: {
                  ID: detail.pupilId,
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

  createLesson: async (req, res) => {
    try {
      let { name, status, userId, listPupil, classId, roomId, content } =
        req.body;

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

      let newLesson = await Lesson.create(
        {
          name,
          status: "started",
          userId,
          classId,
          roomId,
          content,
        },
        { returning: true }
      );
      newLesson = newLesson.dataValues;
      if (listPupil?.length > 0) {
        let pupilsCreated = [];
        for (let p of listPupil) {
          let detail = await ListPupils.create(
            {
              classId: newLesson.classId,
              pupilId: p.id,
              userId: newLesson.userId,
              lessonId: newLesson.ID,
              status: p.status,
            },
            { returning: true }
          );
          pupilsCreated.push(detail);
        }
        newLesson.pupils = pupilsCreated;
      }

      return res.json({
        errCode: 200,
        errMsg: "Create lesson succes!",
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
        },
        raw: true,
        order: [["createdAt", "DESC"]],
      });
      // else {
      //   // Nếu không có lessonId, lấy danh sách học sinh của lớp không có lessonId
      //   listClassesPupil = await ListPupils.findAll({
      //     where: {
      //       classId: classId,
      //       lessonId: "",
      //       status: "attended",
      //     },
      //     raw: true,
      //     order: [["createdAt", "DESC"]],
      //   });
      // }

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
      let { classId, pupilId } = req.body;
      console.log("Request Body3:", req.body);
      if (!classId || !pupilId)
        return res.json({ errCode: 401, errMsg: "Invalid params!" });

      let pupil = await ListPupils.findAll({
        where: {
          classId: classId,
          pupilId: pupilId,
          // lessonId: "",
        },
        raw: true,
      });

      if (pupil) {
        await ListPupils.update(
          { status: "present" },
          {
            where: {
              classId: classId,
              // lessonId: "",
              pupilId: pupilId,
            },
          }
        );

        let newPupils = await ListPupils.findOne({
          where: {
            classId: classId,
            // lessonId: "",
            pupilId: pupilId,
          },
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

  absentPupilInClass: async (req, res) => {
    try {
      let { classId, pupilId } = req.body;
      console.log("Request Body4:", req.body);
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
          { status: "absent" },
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

  updateOrder: async (req, res) => {
    try {
      let { user } = req,
        { ID, name, tableId, listProduct } = req.body;

      if (!ID) return res.json({ errCode: 401, errMsg: "Order not found!" });

      let opts = {};

      if (name) opts.name = name;
      if (tableId) opts.tableId = tableId;

      if (Object.keys(opts).length > 0) {
        await Orders.update(opts, {
          where: {
            ID,
          },
        });
      }

      if (listProduct.length > 0) {
        let products = await OrderDetail.findAll({
          where: {
            orderID: ID,
          },
          raw: true,
        });

        if (products?.length <= 0) {
          for (let p of listProduct) {
            await OrderDetail.create({
              orderID: ID,
              productId: p.ID,
              quantity: p.quantity,
            });
          }
        } else {
          let listExistProduct = products;
          for (let p of listProduct) {
            let checkExists = listExistProduct.findIndex(
              (pro) => pro.productId === p.ID
            );
            if (checkExists >= 0) {
              if (p.quantity < 1) {
                listExistProduct.push(p);
              } else if (
                p.quantity !== listExistProduct[checkExists]?.quantity
              ) {
                await OrderDetail.update(
                  { quantity: p.quantity },
                  {
                    where: {
                      orderID: ID,
                      productId: p.ID,
                    },
                  }
                );
              }
              listExistProduct.splice(checkExists, 1);
            } else {
              await OrderDetail.create({
                orderID: ID,
                productId: p.ID,
                quantity: p.quantity,
              });
            }
          }
          if (listExistProduct.length > 0) {
            await OrderDetail.destroy({
              where: {
                orderID: ID,
                productId: {
                  [Op.in]: listExistProduct.map((p) => p.productId),
                },
              },
            });
          }
        }
      }

      let newProducts = await OrderDetail.findAll({ where: { orderID: ID } });

      return res.json({
        errCode: 200,
        errMsg: "Update success!",
        data: {
          ID,
          ...opts,
          products: newProducts,
        },
      });
    } catch (err) {
      console.log(err);
      return res.json({
        errCode: 500,
        errMsg: "System error!",
      });
    }
  },
};

module.exports = LessonController;
