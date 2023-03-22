const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');

exports.Signgup = catchAsync(async(req,res,next) =>{
    const newUser = await User.create(req.body);
     res.status(200).json({
        status : 'success',
        User : newUser,
     });
});