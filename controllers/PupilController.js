const Pupils = require("../models/pupils");

const PupilController = {
  createPupil: async (req, res) => {
    let {
      name,
      email,
      phone,
      parent_name,
      parent_email,
      parent_phone,
      gender,
      birth,
      address,
      status,
    } = req.body;
    if (
      !name ||
      !email ||
      !phone ||
      !parent_name ||
      !parent_email ||
      !parent_phone ||
      !gender ||
      !birth ||
      !address 
      // ||!status
    )
      return res.json({ errCode: 401, errMsg: "❌ Information must not be empty!" });
    // if (!name) return res.json({ errCode: 401, errMsg: "Invalid params1!" });

    // if (!email) return res.json({ errCode: 401, errMsg: "Invalid params2!" });
    // if (!phone) return res.json({ errCode: 401, errMsg: "Invalid params3!" });
    // if (!parent_name)
    //   return res.json({ errCode: 401, errMsg: "Invalid params4!" });
    // if (!parent_email)
    //   return res.json({ errCode: 401, errMsg: "Invalid params5!" });
    // if (!parent_phone)
    //   return res.json({ errCode: 401, errMsg: "Invalid params6!" });
    // if (!gender) return res.json({ errCode: 401, errMsg: "Invalid params7!" });
    // if (!birth) return res.json({ errCode: 401, errMsg: "Invalid params8!" });
    // if (!address) return res.json({ errCode: 401, errMsg: "Invalid params9!" });
    // if (!status) return res.json({ errCode: 401, errMsg: "Invalid params10!" });

    let newPupil = await Pupils.create(
      {
        name,
        email,
        phone,
        parent_name,
        parent_email,
        parent_phone,
        gender,
        birth,
        address,
        status: status ? status : "active",
      },
      { returning: true }
    );

    return res.json({
      errCode: 200,
      data: newPupil,
      errMsg: "✅ Create Success!",
    });
  },
  getAll: async (req, res) => {
    try {
      let listPupils = await Pupils.findAll({
        order: [["createdAt", "DESC"]],
      });
      return res.json({
        errCode: 200,
        errMsg: "✅ Create Success!",
        data: listPupils,
      });
    } catch (err) {
      console.log(err);
      return res.json({
        errCode: 500,
        errMsg: "❎ System error❗️",
      });
    }
  },

  updatePupil: async (req, res) => {
    try {
      let {
        ID,
        name,
        status,
        email,
        phone,
        parent_email,
        parent_name,
        parent_phone,
        gender,
        birth,
        address,
      } = req.body;
      console.log("hhhhhhhhhhhh", req.body);
      if (!ID) {
        return res.json({ errCode: 401, errMsg: "❌ Information must not be empty!" });
      }

      // Initialize an object to store the update options
      let opts = {};

      // Check if each field is provided and update the opts object accordingly
      if (name !== undefined) {
        opts.name = name;
      }
      if (status !== undefined) {
        opts.status = status;
      }
      if (email !== undefined) {
        opts.email = email;
      }
      if (phone !== undefined) {
        opts.phone = phone;
      }
      if (parent_email !== undefined) {
        opts.parent_email = parent_email;
      }
      if (parent_name !== undefined) {
        opts.parent_name = parent_name;
      }
      if (parent_phone !== undefined) {
        opts.parent_phone = parent_phone;
      }
      if (gender !== undefined) {
        opts.gender = gender;
      }
      if (birth !== undefined) {
        opts.birth = birth;
      }
      if (address !== undefined) {
        opts.address = address;
      }

      // Check if there are any fields to update
      if (Object.keys(opts).length > 0) {
        // Update the pupil with the provided options
        let userPupilUpdated = await Pupils.update(opts, { where: { ID } });
        if (userPupilUpdated[0]) {
          return res.json({
            errCode: 200,
            errMsg: "✅ Update Success!",
          });
        } else {
          return res.json({ errCode: 401, errMsg: "❌ Pupil not found!" });
        }
      } else {
        // If no fields are provided to update, return success
        return res.json({ errCode: 200, errMsg: "❌ No fields to update!" });
      }
    } catch (err) {
      console.log(err);
      return res.json({
        errCode: 500,
        errMsg: "❎ System error❗️",
      });
    }
  },
};

module.exports = PupilController;
