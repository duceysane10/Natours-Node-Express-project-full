
const Tour = require('./../models/tourModel');
const apiFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError.js');

// geting Top five chepest Tour
exports.alias =  (req, res, next) => {
    req.query.limit= '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,duration,difficulty,price,ratingsAverage,summary';
    next();
}


// geting All tours Function
exports.allTours = catchAsync(async (req, res,next) => {
    ///////////////////////////////////////////
    ////////// EXCUIT QUERY
    const features = new apiFeatures(Tour.find(),req.query)
    .filter()
    .Sort()
    .limit()
    .paginate();
    const tours = await features.query
    
   //  filtering using Mongoes
    // const tours = await Tour.find().where('duartion').equals(5).where('sort').equals(1).where('difficulty').equals('easy');
    
    ///////////////////////////////////////////
    ////////// SEND RESPONSE
    res.status(200).json(
        {
         status: '200',
         result : tours.length,
         data:{
            tours
         }
        
        });
})

// Seraching Single Tour function
exports.singleTour = catchAsync(async (req, res,next) => {

    const tour = await Tour.findById(req.params.id);
    if(!tour) {
        return next(new appError('No Tour found with that iD', 404));
    }
   res.status(200).json(
       {
        status: 'Success',
        tour
       });
   
       
})

// Creating New Tour function

exports.cretaeTour = catchAsync(async (req,res,next) => {
   
        const newTour = await Tour.create(req.body);
        res.status(201).json({
            status: 'success',
            data :{
                tour : newTour
            }
        });
 
    
})

exports.updateTour = catchAsync(async (req,res,next) => {

        const tour = await Tour.findByIdAndUpdate(req.params.id,req.body,{
            new : true,
            runValidators : true
        })
        
        if(!tour) {
            return next(new appError('No Tour found with that iD', 404));
        }
        
        res.status(201).json({
            status: 'success',
            data :{
                Tour : tour
            }
        })

})

exports.deleteTour = catchAsync(async (req,res,next) => {

        const tour = await Tour.findByIdAndDelete(req.params.id);
         if(!tour) {
            return next(new appError('No Tour found with that iD', 404));
        }
        res.status(201).json({
            status: 'success',
            messgae: "deleted successfully"
        })

})

exports.getTourStats = catchAsync(async (req,res,next)=>{
    const stats = await Tour.aggregate([
        {
            $match : { ratingsAverage : { $gte: 4.5 } }
        },
        {
            $group :{
                _id: { $toUpper: '$difficulty' },
                numTours: {$sum: 1},
                numRatings: {$sum: '$ratingsAverage'},
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice : { $avg: '$price' },
                minPrice : { $min: '$price' },
                maxPrice : { $max: '$price' }
            }
        },
        {
            $sort: { avgPrice: 1 }
        },
        // {
        //     $match: { _id: {$ne: "EASY" } }
        // }
    ]);
    res.status(200).json({
        status: 'success',
        data :{
            stats
        }
    })

})

exports.getMonthlyPlane = catchAsync(async (req,res,next)=>{

        const year = req.params.year * 1;
        const plan = await Tour.aggregate([
            {
                $unwind: '$startDates'
            },
            {
                $match:{ 
                    startDates: { 
                        $gte: new Date(`${year}-01-01`), 
                        $lte: new Date(`${year}-12-31`) 
                    } 
                }
            },
            {
                $group: {
                    _id: { $month: '$startDates' },
                    numToursStart: { $sum: 1 },
                    Tours: { $push: '$name' }
                }
            },
            {
                $addFields: { month: '$_id' }
            },{
                $sort: { numToursStart: -1}
            },
            {
                $limit: 12
            }
        ]);
        res.status(200).json({
            status: 'success',
            result : plan.length,
            data :{
                plan
            }
        })
 
})