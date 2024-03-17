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
    console.log("hkhkhkhkhkh", req.body);
    if (
      !name ||
      !email ||
      !phone ||
      !parent_name ||
      !parent_email ||
      !parent_phone ||
      !gender ||
      !birth ||
      !address ||
      !status
    )
      return res.json({ errCode: 401, errMsg: "Invalid params!" });

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
        status,
      },
      { returning: true }
    );

    return res.json({
      errCode: 200,
      data: newPupil,
    });
  },
  getAll: async (req, res) => {
    try {
      let lisPupils = await Pupils.findAll({
        order: [["createdAt", "DESC"]],
      });
      return res.json({
        errCode: 200,
        errMsg: "Success",
        data: lisPupils,
      });
    } catch (err) {
      console.log(err);
      return res.json({
        errCode: 500,
        errMsg: "System error!",
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
            return res.json({ errCode: 401, errMsg: "Invalid params!1" });
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
                    errMsg: "Update success!",
                });
            } else {
                return res.json({ errCode: 401, errMsg: "Pupil not found!" });
            }
        } else {
            // If no fields are provided to update, return success
            return res.json({ errCode: 200, errMsg: "No fields to update!" });
        }
    } catch (err) {
        console.log(err);
        return res.json({
            errCode: 500,
            errMsg: "System error!",
        });
    }
},

};


module.exports = PupilController;
