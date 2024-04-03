const express = require("express");
const ListPupilController = require("../controllers/ListPupilController");
const router = express.Router();


router.post("/updatePupilStatusInClass", ListPupilController.updatePupilStatusInClass);

module.exports = router;
