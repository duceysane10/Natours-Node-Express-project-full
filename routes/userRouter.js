const express = require('express');
const userControllers = require('./../controllers/userControllers');
const authControllers = require('./../controllers/authControllers');

const router = express.Router();

router.post('/singup',authControllers.Signgup);
router.post('/login',authControllers.login);
router.post('/forgotPassword',authControllers.forgotPassword);
router.patch('/resetPassword/:Token',authControllers.resetPassword);
router.patch('/updateMyPassword/',authControllers.protectedRoute, authControllers.updatePassword);
router.patch('/updateMyProfile/',authControllers.protectedRoute, userControllers.updateMe);
router.delete('/DeleteMe/',authControllers.protectedRoute, userControllers.DeleteMe);

router.route('/').get(authControllers.protectedRoute,authControllers.restrictTo('admin','lead-guidelead-guide'),userControllers.allusers).post(userControllers.cretaeuser);
router.route('/:id').get(userControllers.singleuser);

module.exports = router;