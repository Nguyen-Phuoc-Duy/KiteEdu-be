const Rooms = require("../models/rooms");

const RoomController = {
  createRoom: async (req, res) => {
    let { name, status } = req.body;

    if (!name || !status)
      return res.json({ errCode: 401, errMsg: "Invalid params!" });

    let newRoom = await Rooms.create(
      {
        name,
        status,
      },
      { returning: true }
    );

    return res.json({
      errCode: 200,
      data: newRoom,
    });
  },
  getAll: async (req, res) => {
    try {
      let listRooms = await Rooms.findAll({
        order: [["createdAt", "DESC"]],
      });
      return res.json({
        errCode: 200,
        errMsg: "Success",
        data: listRooms,
      });
    } catch (err) {
      console.log(err);
      return res.json({
        errCode: 500,
        errMsg: "System error!",
      });
    }
  },
  updateRoom: async (req, res) => {
    try {
      let { ID, name, status } = req.body;
      console.log("hhhhhhhhhhhh", req.body);
      if (!ID || !name || !status)
        return res.json({ errCode: 401, errMsg: "Invalid params!" });
      let opts = {};
      if (name || status) {
        opts.name = name;
        opts.status = status;
      }
      if (Object.keys(opts).length > 0) {
        let userRoomUpdated = await Rooms.update(opts, { where: { ID } });
        if (userRoomUpdated[0]) {
          return res.json({
            errCode: 200,
            errMsg: "Update success!",
          });
        } else {
          return res.json({ errCode: 401, errMsg: "Subject not found!" });
        }
      }
      const roomUpdated = await Rooms.update(
        { status, name },
        { where: { ID } }
      );
      if (roomUpdated?.[0]) {
        return res.json({ errCode: 200, errMsg: "Updated successfully!" });
      } else {
        return res.json({ errCode: 401, errMsg: "Subject not found!" });
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

module.exports = RoomController;
