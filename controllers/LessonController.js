const Classes = require("../models/classes");
const ListPupils = require("../models/listpupils");
const Pupils = require("../models/pupils");
const Subjects = require("../models/subjects");
const Users = require("../models/users");
const Lesson = require("../models/lessons")
const LessonController = {
  getLessonByClass: async (req, res) => { // Định nghĩa hàm getByTableID với tham số req và res
    try { // Bắt đầu khối try để xử lý các lệnh có thể sinh ra ngoại lệ
      let { ID } = req.body; // Lấy giá trị của tham số ID từ yêu cầu HTTP
console.log('gggggggggggggg', req.body)
      if (!ID) return res.json({ errCode: 401, errMsg: "Class not found!" }); // Kiểm tra xem có ID không, nếu không thì trả về thông báo lỗi


      // Lấy danh sách đơn hàng từ cơ sở dữ liệu, dựa trên ID của bàn, sắp xếp theo thời gian tạo giảm dần
      let listLessons= await Lesson.findAll({
        where: {
          classId: ID,
        },
        raw: true,
        order: [["createdAt", "DESC"]],
      });

      // Duyệt qua từng đơn hàng trong danh sách đơn hàng
      for (let lesson of listLessons) {
        if (lesson?.ID) { // Kiểm tra xem đơn hàng có ID không
          // Lấy chi tiết đơn hàng từ cơ sở dữ liệu, dựa trên ID của đơn hàng hiện tại
          let details = await ListPupils.findAll({
            where: {
              lessonId: lesson.ID,
            },
            raw: true,
          });
          let listLesson = []; // Khởi tạo mảng để lưu trữ danh sách sản phẩm trong đơn hàng
          // Duyệt qua từng chi tiết đơn hàng
          for (let detail of details) {
            if (detail?.pupilId) { // Kiểm tra xem chi tiết đơn hàng có ID sản phẩm không
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
    } catch (err) { // Bắt các ngoại lệ nếu có
      console.log(err); // In lỗi ra console để ghi nhận và debug
      // Trả về thông báo lỗi nếu có lỗi xảy ra
      return res.json({ errCode: 500, errMsg: "System error!" });
    }
  },
};

module.exports = LessonController;
