const { Op } = require("sequelize");
const OrderDetail = require("../models/orderDetail");
const ListPupils = require("../models/listpupils");
const Orders = require("../models/classes");
const Classes = require("../models/classes");
const Lessons = require("../models/lessons");
const Products = require("../models/products");
const Rooms = require("../models/rooms");
const Subjects = require("../models/subjects");
const Pupils = require("../models/pupils");
const Tables = require("../models/tables");
const Users = require("../models/users");

const OrdersController = {
  createOrder: async (req, res) => {
    try {
      let { name, tableId, listProduct } = req.body,
        { user } = req;

      if (!user || !tableId)
        return res.json({ errCode: 401, errMsg: "Invalid params!" });

      const table = await Tables.findOne({
        where: { ID: tableId, isDeleted: false },
        raw: true,
      });
      if (!table) {
        return res.json({
          errCode: 401,
          errMsg: "Table not found or deleted!",
        });
      }
      if (!name) {
        let countOrder = await Orders.count({
          where: {
            tableId: table.ID,
          },
        });
        name = table.name + " - " + (countOrder + 1);
      }

      let newOrder = await Orders.create(
        {
          name,
          tableId,
          createdBy: user.ID,
        },
        { returning: true }
      );
      newOrder = newOrder.dataValues;
      if (listProduct?.length > 0) {
        let productsCreated = [];
        for (let p of listProduct) {
          let detail = await OrderDetail.create(
            { orderID: newOrder.ID, productId: p.ID, quantity: p.quantity },
            { returning: true }
          );
          productsCreated.push(detail);
        }
        newOrder.products = productsCreated;
      }

      return res.json({
        errCode: 200,
        errMsg: "Create order succes!",
        data: newOrder,
      });
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
  changeStatusOrder: async (req, res) => {
    try {
      let { ID, status } = req.body,
        { user } = req;
      if (!ID) return res.json({ errCode: 401, errMsg: "Order not found!" });
      if (!["started", "finished", "cancelled"].includes(status))
        return res.json({ errCode: 401, errMsg: "Status is not support!" });

      let options = {
        status,
      };

      if (status === "finished") {
        options.checkoutBy = user.ID;
      }

      let orderUpdated = await Orders.update(options, { where: { ID } });
      if (orderUpdated[0]) {
        return res.json({ errCode: 200, errMsg: "Status updated" });
      } else {
        return res.json({ errCode: 401, errMsg: "Status update fail!" });
      }
    } catch (err) {}
  },
  getByTableID: async (req, res) => {
    // Định nghĩa hàm getByTableID với tham số req và res
    try {
      // Bắt đầu khối try để xử lý các lệnh có thể sinh ra ngoại lệ
      let { ID } = req.params; // Lấy giá trị của tham số ID từ yêu cầu HTTP

      if (!ID) return res.json({ errCode: 401, errMsg: "Table not found!" }); // Kiểm tra xem có ID không, nếu không thì trả về thông báo lỗi

      // Lấy danh sách người dùng từ cơ sở dữ liệu, loại bỏ thuộc tính mật khẩu
      const listUsers = await Users.findAll({
        raw: true,
        attributes: { exclude: ["password"] },
      });

      // Lấy danh sách đơn hàng từ cơ sở dữ liệu, dựa trên ID của bàn, sắp xếp theo thời gian tạo giảm dần
      let listOrders = await Orders.findAll({
        where: {
          tableId: ID,
        },
        raw: true,
        order: [["createdAt", "DESC"]],
      });

      // Duyệt qua từng đơn hàng trong danh sách đơn hàng
      for (let order of listOrders) {
        if (order?.ID) {
          // Kiểm tra xem đơn hàng có ID không
          // Lấy chi tiết đơn hàng từ cơ sở dữ liệu, dựa trên ID của đơn hàng hiện tại
          let details = await OrderDetail.findAll({
            where: {
              orderID: order.ID,
            },
            raw: true,
          });
          let listProduct = []; // Khởi tạo mảng để lưu trữ danh sách sản phẩm trong đơn hàng
          // Duyệt qua từng chi tiết đơn hàng
          for (let detail of details) {
            if (detail?.productId) {
              // Kiểm tra xem chi tiết đơn hàng có ID sản phẩm không
              // Lấy thông tin của sản phẩm từ cơ sở dữ liệu dựa trên ID sản phẩm
              let product = await Products.findOne({
                where: {
                  ID: detail.productId,
                },
                raw: true,
              });
              // Thêm thông tin sản phẩm và số lượng vào danh sách sản phẩm trong đơn hàng
              listProduct.push({
                ...product,
                quantity: detail.quantity,
              });
            }
          }
          // Gán danh sách sản phẩm vào đơn hàng
          order.products = listProduct;

          // Nếu có người tạo đơn hàng, gán thông tin người tạo vào đơn hàng
          if (order.createdBy) {
            order.createdBy = listUsers.find((u) => u.ID === order.createdBy);
          }
          // Nếu có người thanh toán đơn hàng, gán thông tin người thanh toán vào đơn hàng
          if (order.checkoutBy) {
            order.checkoutBy = listUsers.find((u) => u.ID === order.checkoutBy);
          }
        }
      }

      // Trả về danh sách đơn hàng đã được xử lý và thông báo thành công
      return res.json({ errCode: 200, errMsg: "Success!", data: listOrders });
    } catch (err) {
      // Bắt các ngoại lệ nếu có
      console.log(err); // In lỗi ra console để ghi nhận và debug
      // Trả về thông báo lỗi nếu có lỗi xảy ra
      return res.json({ errCode: 500, errMsg: "System error!" });
    }
  },

  // getByTableID: async (req, res) => {
  //   try {
  //     let { ID } = req.params;

  //     if (!ID) return res.json({ errCode: 401, errMsg: "Table not found!" });

  //     const listUsers = await Users.findAll({
  //       raw: true,
  //       attributes: { exclude: ["password"] },
  //     });
  //     let listOrders = await Orders.findAll({
  //       where: {
  //         tableId: ID,
  //       },
  //       raw: true,
  //       order: [["createdAt", "DESC"]],
  //     });
  //     for (let order of listOrders) {
  //       if (order?.ID) {
  //         let details = await OrderDetail.findAll({
  //           where: {
  //             orderID: order.ID,
  //           },
  //           raw: true,
  //         });
  //         let listProduct = [];
  //         for (let detail of details) {
  //           if (detail?.productId) {
  //             let product = await Products.findOne({
  //               where: {
  //                 ID: detail.productId,
  //               },
  //               raw: true,
  //             });
  //             listProduct.push({
  //               ...product,
  //               quantity: detail.quantity,
  //             });
  //           }
  //         }
  //         order.products = listProduct;
  //         if (order.createdBy) {
  //           order.createdBy = listUsers.find((u) => u.ID === order.createdBy);
  //         }
  //         if (order.checkoutBy) {
  //           order.checkoutBy = listUsers.find((u) => u.ID === order.checkoutBy);
  //         }
  //       }
  //     }

  //     return res.json({ errCode: 200, errMsg: "Success!", data: listOrders });
  //   } catch (err) {
  //     console.log(err);
  //     return res.json({ errCode: 500, errMsg: "System error!" });
  //   }
  // },

  getAllOrders: async (req, res) => {
    try {
      let { status, orderBy, filterName } = req.body;
      let opts = {};
      if (status) {
        opts.status = status;
      }
      let order = [["createdAt", "DESC"]];

      if (orderBy) {
        order = [["createdAt", orderBy]];
      }

      if (filterName) {
        opts.name = { [Op.like]: "%" + filterName + "%" };
      }

      const listUsers = await Users.findAll({
        raw: true,
        attributes: { include: ["ID", "name", "email"] },
      });
      let listOrders = await Orders.findAll({
        where: opts,
        raw: true,
        order: order,
      });
      let total = 0;
      for (let order of listOrders) {
        if (order?.ID) {
          let totalRevenue = 0;
          let details = await OrderDetail.findAll({
            where: {
              orderID: order.ID,
            },
            raw: true,
          });
          for (let detail of details) {
            if (detail?.productId) {
              let product = await Products.findOne({
                where: {
                  ID: detail.productId,
                },
                raw: true,
              });
              if (product) {
                totalRevenue += product.price * detail.quantity;
              }
            }
          }
          if (order.status == "finished") {
            total += totalRevenue;
          }
          if (order.createdBy) {
            order.createdBy = listUsers.find((u) => u.ID === order.createdBy);
          }
          if (order.checkoutBy) {
            order.checkoutBy = listUsers.find((u) => u.ID === order.checkoutBy);
          }
        }
      }

      return res.json({
        errCode: 200,
        errMsg: "Success!",
        data: listOrders,
        totalRevenue: total,
      });
    } catch (err) {
      console.log(err);
      return res.json({ errCode: 500, errMsg: "System error!" });
    }
  },
  getDetailOrder: async (req, res) => {
    try {
      let { ID } = req.params;

      if (!ID) return res.json({ errCode: 401, errMsg: "Table not found!" });

      let details = await OrderDetail.findAll({
        where: {
          orderID: ID,
        },
        raw: true,
      });
      let listProduct = [];
      for (let detail of details) {
        if (detail?.productId) {
          let product = await Products.findOne({
            where: {
              ID: detail.productId,
            },
            raw: true,
          });
          listProduct.push({
            ...product,
            quantity: detail.quantity,
          });
        }
      }
      return res.json({ errCode: 200, errMsg: "Success!", data: listProduct });
    } catch (err) {
      console.log(err);
      return res.json({ errCode: 500, errMsg: "System error!" });
    }
  },
};

module.exports = OrdersController;
