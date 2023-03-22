const express = require('express');
const userControllers = require('./../controllers/userControllers');
const authControllers = require('./../controllers/authControllers');

const router = express.Router();

router.post('/singup',authControllers.Signgup);

router.route('/').get(userControllers.allusers).post(userControllers.cretaeuser);
router.route('/:id').get(userControllers.singleuser);

module.exports = router;