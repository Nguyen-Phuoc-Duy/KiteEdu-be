// const Products = require("../models/products");

// const ProductsController = {
//   createProduct: async (req, res) => {
//     try {
//       let { name, price, unit } = req.body,
//         { user } = req;

//       if (!name || !price)
//         return res.json({ errCode: 500, errMsg: "Invalid parameters!" });

//       if (!unit) unit = "món";

//       let productCreated = await Products.create(
//         {
//           name,
//           price,
//           unit,
//           createdBy: user.ID,
//         },
//         { returning: true }
//       );

//       return res.json({
//         errCode: 200,
//         errMsg: "Create product successfully!",
//         data: productCreated,
//       });
//     } catch (err) {
//       console.log(err.stack);
//       return res.json({
//         errCode: 500,
//         errMsg: "Create product failed!",
//       });
//     }
//   },
//   updateProduct: async (req, res) => {
//     try {
//       let { ID, name, price, unit } = req.body;

//       if (!ID) return res.json({ errCode: 500, errMsg: "Product not found!" });

//       if (!name && !price && !unit)
//         return res.json({ errCode: 500, errMsg: "Invalid parameters!" });

//       let otps = {};

//       if (name) otps.name = name;
//       if (price) otps.price = price;
//       if (unit) otps.unit = unit;

//       let updated = await Products.update(otps, {
//         where: {
//           ID,
//         },
//       });

//       if (updated[0]) {
//         return res.json({
//           errCode: 200,
//           errMsg: "Product update successfully!",
//         });
//       } else {
//         return res.json({
//           errCode: 500,
//           errMsg: "Product update failed!",
//         });
//       }
//     } catch (err) {
//       console.log(err);
//       return res.json({ errCode: 500, errMsg: "Product update failed!" });
//     }
//   },
//   deleteProduct: async (req, res) => {
//     try {
//       let { ID } = req.params;

//       if (!ID) return res.json({ errCode: 500, errMsg: "Product not found!" });

//       await Products.update({ isDeleted: true }, { where: { ID } });

//       return res.json({ errCode: 200, errMsg: "Product deleted!" });
//     } catch (err) {
//       return res.json({ errCode: 500, errMsg: "Delete product failed!" });
//     }
//   },
//   getAllProduct: async (req, res) => {
//     try {
//       let { status, orderBy, filterName } = req.body;
//       let opts = {};
//       if (status) {
//         opts.status = status;
//       }
//       let order = [["createdAt", "DESC"]];

//       if (orderBy) {
//         order = [["createdAt", orderBy]];
//       }

//       if (filterName) {
//         opts.name = { [Op.like]: "%" + filterName + "%" };
//       }
//       let allProduct = await Products.findAll({
//         where: { isDeleted: false },
//         order: order,
//         raw: true,
//       });
//       res.json({ errCode: 200, errMsg: "Success!", data: allProduct });
//     } catch (err) {
//       return res.json({ errCode: 500, errMsg: "System error!" });
//     }
//   },
// };

// module.exports = ProductsController;
