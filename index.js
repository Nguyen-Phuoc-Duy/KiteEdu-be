const express = require("express");
require("dotenv").config();
const cors = require("cors");
const sequelize = require("./utils/database.js");

const routes = require("./routes");
const Users = require("./models/users.js");
const hashPassword = require("./helpers/hashPassword.js");

const app = express();

app.use(cors());

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use((_, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

let checkAdminROOT = async () => {
  let adminROOT = await Users.findOne({
    where: {
      email: "ROOT",
    },
    raw: true,
  });

  if (adminROOT) return;

  let password = hashPassword(process.env.ADMIN_PASSWORD);

  await Users.create({
    name: "admin ROOT",
    username: "admin ROOT",
    email: "ROOT",
    password,
    role: "admin",
  });
};

routes(app);

sequelize.sync();

checkAdminROOT();

app.listen(process.env.PORT, () => {
  let password = hashPassword("Admin@123");
  console.log(
    `App listening at http://localhost:${process.env.PORT}/`,
    password
  );
});
