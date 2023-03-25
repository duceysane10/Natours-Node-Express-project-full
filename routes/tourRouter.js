const express = require('express');
const tourController = require('../controllers/tourControllers');
const authControllers = require('../controllers/authControllers');

const router = express.Router();
// router.param('id',tourController.checkId);

// Alias middle ware  Router
router.route('/top-5-cheap/').get(tourController.alias,tourController.allTours);
// Tour Statitcs 
router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlane);
// All basic routes
router.route('/')
.get(authControllers.protectedRoute, tourController.allTours)
.post(tourController.cretaeTour);

router.route('/:id')
.get(tourController.singleTour)
.patch(tourController.updateTour)
.delete(authControllers.protectedRoute,authControllers.restrictTo('admin','lead-guidelead-guide'),tourController.deleteTour);

module.exports = router;