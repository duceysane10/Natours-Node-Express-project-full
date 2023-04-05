const express = require('express');
const authControllers = require('./../controllers/authControllers');
const reviewsController = require('./../controllers/reviewControllers')

const router = express.Router();

router.route('/')
.get(authControllers.protectedRoute,reviewsController.getAllReviews)
.post(authControllers.protectedRoute,reviewsController.createReview);


module.exports = router