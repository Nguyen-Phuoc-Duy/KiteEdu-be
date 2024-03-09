const express = require('express');
const OrdersController = require('../controllers/OrdersController');
const ProductsController = require('../controllers/ProductsController');
const UsersController = require('../controllers/UsersController');
const TalbeController = require('../controllers/TableController');
const SubjectController = require('../controllers/SubjectController');
const router = express.Router();


router.post('/lockOrUnlockUser/:ID', UsersController.lockOrUnlockUser);

router.post('/createTable', TalbeController.createTable);

router.post('/createSubject', SubjectController.createSubject);

router.post('/updateTable', TalbeController.updateTable);

router.post('/updateSubject', SubjectController.updateSubject);

router.delete('/deleteTable/:ID', TalbeController.deleteTable);

router.post('/createProduct', ProductsController.createProduct);

router.post('/updateProduct', ProductsController.updateProduct);

router.post('/getAllOrders', OrdersController.getAllOrders);

// router.post('/createEmployee', UsersController.register);

router.delete('/deleteProduct/:ID', ProductsController.deleteProduct);

router.post('/updateUserRole', UsersController.updateRole);

router.post('/updateUserSubject', UsersController.updateUserSubject);

router.post('/createUser', UsersController.register);

router.get('/resetPassword/:ID', UsersController.resetPassword);






module.exports = router;