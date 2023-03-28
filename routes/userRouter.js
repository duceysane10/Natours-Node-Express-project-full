const express = require('express');
const userControllers = require('./../controllers/userControllers');
const authControllers = require('./../controllers/authControllers');

const router = express.Router();

router.post('/singup',authControllers.Signgup);
router.post('/login',authControllers.login);
router.post('/forgotPassword',authControllers.forgotPassword);
router.patch('/resetPassword/:Token',authControllers.resetPassword);
router.patch('/updateMyPassword/:id',authControllers.protectedRoute, authControllers.updatePassword);
router.patch('/updateMyProfile/:id',authControllers.protectedRoute, userControllers.updateMe);

router.route('/').get(userControllers.allusers).post(userControllers.cretaeuser);
router.route('/:id').get(userControllers.singleuser);

module.exports = router;