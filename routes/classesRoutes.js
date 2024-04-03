const express = require("express");
const ClassController = require("../controllers/ClassController");
const router = express.Router();

// router.get('/getOrdersByTable/:ID', OrdersController.getByTableID)

router.post("/createClass", ClassController.createClass);

router.post("/updateClass", ClassController.updateClass);

router.post("/getClassByUser", ClassController.getClassByUser);

router.post("/getPupilByClass", ClassController.getPupilByClass);

router.post("/removePupilInClass", ClassController.removePupilInClass);

router.post("/addPupilInClass", ClassController.addPupilInClass);

// router.get('/getDetailOrder/:ID', OrdersController.getDetailOrder)

// router.post('/create', OrdersController.createOrder);

// router.post('/update', OrdersController.updateOrder);

// router.post('/updateStatus', OrdersController.changeStatusOrder);

module.exports = router;
