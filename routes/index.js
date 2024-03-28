// const newRouter = require('./news');
// const siteRouter = require('./site');
// const courseRouter = require('./courses');
// const meRouter = require('./me');

const UsersController = require("../controllers/UsersController");
const authorization = require("../polices/authorization");
const authAdmin = require("../polices/authAdmin");

const adminRoutes = require("./adminRoutes");
const ordersRoutes = require("./ordersRoutes");
const classesRoutes = require("./classesRoutes");
const pupilsRoutes = require("./pupilsRoutes");
const lessonsRoutes = require("./lessonsRoutes")
const ProductsController = require("../controllers/ProductsController");
const TalbeController = require("../controllers/TableController");
const SubjectController = require("../controllers/SubjectController");
const RoomController = require("../controllers/RoomController");
const PupilController = require("../controllers/PupilController");
const ClassController = require("../controllers/ClassController");
function routes(app) {
  // app.use('/news', newRouter);

  // app.use('/courses', courseRouter);

  // app.use('/me', meRouter)

  app.get("/testService", authorization, (req, res) => {
    res.status(200).json({ message: "Connect service ok!" });
  });

  app.get("/users/loginWithToken/:token", UsersController.loginWithToken);

  app.post("/users/login", UsersController.login);

  app.post(
    "/users/updateProfile",
    authorization,
    UsersController.updateProfile
  );

  app.get("/users/getAll", authorization, UsersController.getAllUsers);

  // app.get("/products/getAll", ProductsController.getAllProduct);

  // app.get("/tables/getAll", authorization, TalbeController.getAll);

  app.get("/subjects/getAll", authorization, SubjectController.getAll);

  app.get("/rooms/getAll", authorization, RoomController.getAll);

  app.get("/pupils/getAll", authorization, PupilController.getAll);

  app.get("/classes/getAll", authorization, ClassController.getAll);

  app.use("/admin", authAdmin, adminRoutes);

  // app.use("/orders", authorization, ordersRoutes);

  app.use("/class", authorization, classesRoutes);

  app.use("/lesson", authorization, lessonsRoutes);

  app.use("/pupil", authorization, pupilsRoutes);

  app.use("/", (req, res) => {
    res.status(200).json({ message: "Connected to Service!" });
  });
}

module.exports = routes;
