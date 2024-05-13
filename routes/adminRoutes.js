const express = require('express');
// const OrdersController = require('../controllers/OrdersController');
// const ProductsController = require('../controllers/ProductsController');
const UsersController = require('../controllers/UsersController');
// const TalbeController = require('../controllers/TableController');
const SubjectController = require('../controllers/SubjectController');
const RoomController = require('../controllers/RoomController');
const PupilController = require('../controllers/PupilController')
const ClassController =  require('../controllers/ClassController')
const router = express.Router();


router.post('/lockOrUnlockUser/:ID', UsersController.lockOrUnlockUser);


router.post('/createSubject', SubjectController.createSubject);



router.post('/createRoom', RoomController.createRoom);



router.post('/updateSubject', SubjectController.updateSubject);

router.post('/updateRoom', RoomController.updateRoom);

router.post('/updateUserRole', UsersController.updateRole);

router.post('/updateUserSubject', UsersController.updateUserSubject);

router.post('/createUser', UsersController.register);

router.get('/resetPassword/:ID', UsersController.resetPassword);






module.exports = router;