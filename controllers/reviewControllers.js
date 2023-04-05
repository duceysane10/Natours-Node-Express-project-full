const reviewss = require('./../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');

// Getting All reviews
exports.getAllReviews = catchAsync(async(req, res) => {
    const allReviews = await reviewss.find();
    
    res.status(200).json({
        status: 'success',
        data:{
            Allreviews:allReviews
        }
    })
})
// creating new review
exports.createReview = catchAsync(async(req,res) =>{
    const Newreview = await reviewss.create(req.body);
    
    res.status(200).json({
        status: 'success',
        data: {
            reviews: Newreview
        }
    })
})