const express = require('express');
const PupilController = require('../controllers/PupilController');
const router = express.Router();

router.post('/createPupil', PupilController.createPupil);

router.post('/updatePupil', PupilController.updatePupil);
// router.get('/getOrdersByTable/:ID', OrdersController.getByTableID)

// router.get('/getDetailOrder/:ID', OrdersController.getDetailOrder)

// router.post('/create', OrdersController.createOrder);

// router.post('/update', OrdersController.updateOrder);

// router.post('/updateStatus', OrdersController.changeStatusOrder);


module.exports = router;