const express = require('express');
const PupilController = require('../controllers/PupilController');
const router = express.Router();

router.post('/createPupil', PupilController.createPupil);

router.post('/updatePupil', PupilController.updatePupil);



module.exports = router;