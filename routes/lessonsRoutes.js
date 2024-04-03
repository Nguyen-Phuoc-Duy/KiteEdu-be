const express = require("express");
const LessonController = require("../controllers/LessonController");
const router = express.Router();

// router.post("/createClass", ClassController.createClass);

// router.post("/updateClass", ClassController.updateClass);

// router.post("/getClassByUser", ClassController.getClassByUser);
router.post("/getLessonByClass", LessonController.getLessonByClass);

router.post("/getPupilByLesson", LessonController.getPupilByLesson);

router.post("/createLesson", LessonController.createLesson);

router.post("/presentPupilInClass", LessonController.presentPupilInClass);

router.post("/absentPupilInClass", LessonController.absentPupilInClass);

module.exports = router;
