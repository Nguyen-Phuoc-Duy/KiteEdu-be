const Classes = require("../models/classes");
const ListPupils = require("../models/listpupils");
const Pupils = require("../models/pupils");
const Subjects = require("../models/subjects");
const Users = require("../models/users");
const { Op } = require("sequelize");
const ClassController = {
  createClass1: async (req, res) => {
    let { name, status, userId, subjectId } = req.body;
    console.log("hkhkhkhkhkh", req.body);
    if (!name || !status || !userId || !subjectId)
      return res.json({ errCode: 401, errMsg: "Invalid params!" });

    let newClass = await Classes.create(
      {
        name,
        status,
        userId,
        subjectId,
      },
      { returning: true }
    );

    return res.json({
      errCode: 200,
      data: newClass,
    });
  },

  createClass: async (req, res) => {
    try {
      let { name, status, userId, subjectId, listPupil } = req.body,
        { user } = req;
      if (!user || !userId)
        return res.json({ errCode: 401, errMsg: "Invalid params!" });

      const userClass = await Users.findAll({
        where: { ID: userId },
        raw: true,
      });
      if (!userClass) {
        return res.json({
          errCode: 401,
          errMsg: "User not found or deleted!",
        });
      }
      if (!name) {
        let countClass = await Classes.count({
          where: {
            userId: userClass.ID,
          },
        });
        name = userClass.name + " - " + (countClass + 1);
      }

      let newClass = await Classes.create(
        {
          name,
          status: status ? status : "started",
          userId,
          subjectId,
          // tableId,
          // createdBy: user.ID,
        },
        { returning: true }
      );
      newClass = newClass.dataValues;
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
              status: p.status,
            },
            { returning: true }
          );
          pupilsCreated.push(detail);
        }
        newClass.pupils = pupilsCreated;
      }

      return res.json({
        errCode: 200,
        errMsg: "Create order succes!",
        data: newClass,
      });
    } catch (err) {
      console.log(err);
      return res.json({
        errCode: 500,
        errMsg: "System Error!",
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
        errMsg: "Success",
        data: listClasses,
      });
    } catch (err) {
      console.log(err);
      return res.json({
        errCode: 500,
        errMsg: "System error!",
      });
    }
  },

  getClassByUser1: async (req, res) => {
    try {
      let { ID, role } = req.body;

      if (!ID) return res.json({ errCode: 401, errMsg: "User not found!ccc" });

      if (role == "admin" || role == "manager") {
        let listClasses = await Classes.findAll({
          order: [["createdAt", "DESC"]],
        });
        return res.json({
          errCode: 200,
          errMsg: "Success",
          data: listClasses,
        });
      } else {
        let listClassesUser = await Classes.findAll({
          where: {
            userId: ID,
          },
          raw: true,
          order: [["createdAt", "DESC"]],
        });
        listClassesUser = listClassesUser.dataValues;
        if (listClassesUser?.length > 0) {
          let listPupil = [];
          for (let classUser of listClassesUser) {
            if (classUser?.ID) {
              let details = await ListPupils.findAll({
                where: {
                  classId: classUser.ID,
                },
                raw: true,
              });

              for (let detail of details) {
                if (detail?.pupilId) {
                  let pupil = await Pupils.findOne({
                    where: {
                      ID: detail.pupilId,
                    },
                    raw: true,
                  });
                  listPupil.push({
                    ...pupil,
                    status: detail.status,
                  });
                }
              }
            }
          }
          classUser.pupils = listPupil;
        }

        return res.json({
          errCode: 200,
          errMsg: "Success!",
          data: listClassesUser,
        });
      }
    } catch (err) {
      console.log(err);
      return res.json({ errCode: 500, errMsg: "System error!" });
    }
  },

  getClassByUser: async (req, res) => {
    try {
      let { ID, role } = req.body;
  
      if (!ID) return res.json({ errCode: 401, errMsg: "User not found!" });
  
      if (role == "admin" || role == "manager") {
        let listClasses = await Classes.findAll({
          order: [["createdAt", "DESC"]],
        });
        return res.json({
          errCode: 200,
          errMsg: "Success",
          data: listClasses,
        });
      } else {
        let listClassesUser = await Classes.findAll({
          where: {
            userId: ID,
          },
          raw: true,
          order: [["createdAt", "DESC"]],
        });
        listClassesUser = listClassesUser.dataValues

        if (listClassesUser?.length > 0) {
          for (let classUser of listClassesUser) {
            let listPupil = [];
            let details = await ListPupils.findAll({
              where: {
                classId: classUser.ID,
              },
              raw: true,
            });
  
            for (let detail of details) {
              if (detail?.pupilId) {
                let pupil = await Pupils.findOne({
                  where: {
                    ID: detail.pupilId,
                  },
                  raw: true,
                });
                listPupil.push({
                  ...pupil,
                  status: detail.status,
                });
              }
            }
            classUser.pupils = listPupil;
          }
        }
  
        return res.json({
          errCode: 200,
          errMsg: "Success!",
          data: listClassesUser,
        });
      }
    } catch (err) {
      console.log(err);
      return res.json({ errCode: 500, errMsg: "System error!" });
    }
  },
  
  

  getPupilByClass: async (req, res) => {
    try {
      let { ID } = req.body;

      if (!ID) return res.json({ errCode: 401, errMsg: "Class not found!" });

      {
        let listClassesPupil = await ListPupils.findAll({
          where: {
            classId: ID,
            lessonId:''
          },
          raw: true,
          order: [["createdAt", "DESC"]],
        });
        return res.json({
          errCode: 200,
          errMsg: "Success!",
          data: listClassesPupil,
        });
      }

    } catch (err) {
      console.log(err);
      return res.json({ errCode: 500, errMsg: "System error!" });
    }
  },
  getPupilByClass1: async (req, res) => {
    try {
      let { ID } = req.body;

      if (!ID) return res.json({ errCode: 401, errMsg: "Class not found!" });
      // if (lessonId) {
      //   let listClassesPupil = await ListPupils.findAll({
      //     where: {
      //       classId: ID,
      //       lessonId: lessonId,
      //     },
      //     raw: true,
      //     order: [["createdAt", "DESC"]],
      //   });
      //   return res.json({
      //     errCode: 200,
      //     errMsg: "Success!",
      //     data: listClassesPupil,
      //   });
      // } else
      {
        let listClassesPupil = await ListPupils.findAll({
          where: {
            classId: ID,
          },
          raw: true,
          order: [["createdAt", "DESC"]],
        });
        return res.json({
          errCode: 200,
          errMsg: "Success!",
          data: listClassesPupil,
        });
      }

      // for (let classUser of listClassesPupil) {
      //   if (classUser?.ID) {
      //     let details = await ListPupils.findAll({
      //       where: {
      //         classID: classUser.ID,
      //       },
      //       raw: true,
      //     });
      //     let listPupil = [];
      //     for (let detail of details) {
      //       if (detail?.pupilId) {
      //         let pupil = await Pupils.findOne({
      //           where: {
      //             ID: detail.pupilId,
      //           },
      //           raw: true,
      //         });
      //         listPupil.push({
      //           ...pupil,
      //           status: detail.status,
      //         });
      //       }
      //     }
      //     classUser.pupils = listPupil;
      //   }
      // }
    } catch (err) {
      console.log(err);
      return res.json({ errCode: 500, errMsg: "System error!" });
    }
  },

  updateOrder: async (req, res) => {
    // Khai báo hàm updateOrder với async để có thể sử dụng await
    try {
      // Bắt đầu khối try để xử lý các lỗi có thể xảy ra
      let { user } = req, // Destructuring user từ request
        { ID, name, tableId, listProduct } = req.body; // Destructuring ID, name, tableId, listProduct từ body của request

      if (!ID) return res.json({ errCode: 401, errMsg: "Order not found!" }); // Kiểm tra nếu không có ID, trả về lỗi "Order not found!"

      let opts = {}; // Khởi tạo một đối tượng rỗng để chứa các thuộc tính cần cập nhật

      if (name) opts.name = name; // Nếu có name, gán vào opts
      if (tableId) opts.tableId = tableId; // Nếu có tableId, gán vào opts

      if (Object.keys(opts).length > 0) {
        // Kiểm tra xem opts có thuộc tính không
        await Orders.update(opts, {
          // Cập nhật bảng Orders với các thuộc tính mới trong opts
          where: {
            ID,
          },
        });
      }

      if (listProduct.length > 0) {
        // Kiểm tra xem có sản phẩm trong listProduct không
        let products = await OrderDetail.findAll({
          // Lấy danh sách sản phẩm từ OrderDetail dựa trên orderID
          where: {
            orderID: ID,
          },
          raw: true,
        });

        if (products?.length <= 0) {
          // Nếu không có sản phẩm trong danh sách
          for (let p of listProduct) {
            // Duyệt qua từng sản phẩm trong listProduct
            await OrderDetail.create({
              // Tạo mới một sản phẩm trong OrderDetail
              orderID: ID,
              productId: p.ID,
              quantity: p.quantity,
            });
          }
        } else {
          // Nếu có sản phẩm trong danh sách
          let listExistProduct = products; // Sao chép danh sách sản phẩm

          for (let p of listProduct) {
            // Duyệt qua từng sản phẩm trong listProduct
            let checkExists = listExistProduct.findIndex(
              // Kiểm tra xem sản phẩm đã tồn tại trong danh sách sản phẩm hiện tại không
              (pro) => pro.productId === p.ID
            );
            if (checkExists >= 0) {
              // Nếu sản phẩm đã tồn tại
              if (p.quantity < 1) {
                // Nếu số lượng của sản phẩm là nhỏ hơn 1
                listExistProduct.push(p); // Thêm sản phẩm vào danh sách sản phẩm tồn tại
              } else if (
                p.quantity !== listExistProduct[checkExists]?.quantity
              ) {
                // Nếu số lượng của sản phẩm đã thay đổi
                await OrderDetail.update(
                  // Cập nhật số lượng của sản phẩm
                  { quantity: p.quantity },
                  {
                    where: {
                      orderID: ID,
                      productId: p.ID,
                    },
                  }
                );
              }
              listExistProduct.splice(checkExists, 1); // Xóa sản phẩm đã được xử lý khỏi danh sách sản phẩm tồn tại
            } else {
              // Nếu sản phẩm không tồn tại
              await OrderDetail.create({
                // Tạo mới một sản phẩm trong OrderDetail
                orderID: ID,
                productId: p.ID,
                quantity: p.quantity,
              });
            }
          }

          if (listExistProduct.length > 0) {
            // Kiểm tra nếu còn sản phẩm k tồn tại trong danh sách
            await OrderDetail.destroy({
              // Xóa các sản phẩm không còn tồn tại trong listProduct
              where: {
                orderID: ID,
                productId: {
                  [Op.in]: listExistProduct.map((p) => p.productId), // Sử dụng Op.in để chọn những sản phẩm cần xóa
                },
              },
            });
          }
        }
      }

      let newProducts = await OrderDetail.findAll({ where: { orderID: ID } }); // Lấy danh sách sản phẩm mới

      return res.json({
        // Trả về kết quả
        errCode: 200,
        errMsg: "Update success!",
        data: {
          ID,
          ...opts,
          products: newProducts,
        },
      });
    } catch (err) {
      // Xử lý các lỗi nếu có
      console.log(err); // In lỗi ra console
      return res.json({
        // Trả về thông báo lỗi cho người dùng
        errCode: 500,
        errMsg: "System error!",
      });
    }
  },

  updateClass1: async (req, res) => {
    try {
      let { ID, name, status, userId, listPupil } = req.body;
      // console.log("ddddd", req.body);
      if (!ID) return res.json({ errCode: 401, errMsg: "Invalid params!" });

      let opts = {};
      if (name) opts.name = name;
      if (status) opts.status = status;

      if (Object.keys(opts).length > 0) {
        await Classes.update(opts, {
          where: {
            ID,
          },
        });
      }
      if (listPupil.length > 0) {
        let pupils = await ListPupils.findAll({
          where: {
            classId: ID,
          },
          raw: true,
        });

        if (pupils?.length <= 0) {
          let listExistPupil = pupils;
          for (let p of listPupil) {
            let checkExists = listExistPupil.findIndex(
              (pup) => pup.pupilId === p.ID
            );
            if (checkExists >= 0) {
              if (p.status !== listExistPupil[checkExists]?.status) {
                await ListPupils.update(
                  { status: p.status },
                  {
                    where: {
                      classId: ID,
                      pupilId: p.ID,
                      userId: userId,
                    },
                  }
                );
              }
              listExistPupil.splice(checkExists, 1);
            } else {
              await ListPupils.create({
                classId: ID,
                pupilId: p.id,
                status: p.status,
                userId: userId,
              });
            }
          }
        } else {
          let listExistPupil = pupils;
          for (let p of listPupil) {
            let checkExists = listExistPupil.findIndex(
              (pup) => pup.pupilId === p.ID
            );
            if (checkExists >= 0) {
              if (p.status !== listExistPupil[checkExists]?.status) {
                await ListPupils.update(
                  { status: p.status },
                  {
                    where: {
                      classId: ID,
                      pupilId: p.ID,
                      userId: userId,
                    },
                  }
                );
              }
              listExistPupil.splice(checkExists, 1);
            } else {
              await ListPupils.create({
                classId: ID,
                pupilId: p.id,
                status: p.status,
                userId: userId,
              });
            }
          }
          if (listExistPupil.length <= 0) {
            await ListPupils.destroy({
              where: {
                classId: ID,
                pupilId: {
                  [Op.in]: listExistPupil.map((p) => p.pupilId),
                },
              },
            });
          }
        }
      }

      let newPupils = await ListPupils.findAll({ where: { classId: ID } });

      return res.json({
        errCode: 200,
        errMsg: "Update success!",
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
        errMsg: "System Error1233!",
      });
    }
  },
  updateClass: async (req, res) => {
    try {
      let { ID, name, status, userId, listPupil } = req.body;

      if (!ID) return res.json({ errCode: 401, errMsg: "Invalid params!" });

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
        errMsg: "Update success!",
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
        errMsg: "System Error1233!",
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
