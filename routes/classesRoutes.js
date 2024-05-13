const express = require("express");
const ClassController = require("../controllers/ClassController");
const router = express.Router();


router.post("/createClass", ClassController.createClass);

router.post("/updateClass", ClassController.updateClass);

router.post("/getClassByUser", ClassController.getClassByUser);

router.post("/getPupilByClass", ClassController.getPupilByClass);

router.post("/getAllPupilByClass", ClassController.getAllPupilByClass)

router.post("/removePupilInClass", ClassController.removePupilInClass);

router.post("/addPupilInClass", ClassController.addPupilInClass);


module.exports = router;
