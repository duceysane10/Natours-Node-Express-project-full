
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');

// creating filterObj function to filter filds we allow user to update
const filterObj = (obj,allowedFields)=>{
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)) newObj[el] = obj[el];
    })
    return newObj;
}
// Users functions
exports.allusers =(req,res) =>{
    res.status(500).json({
        status: 'error',
        message: 'not declared this route'
    })
}
exports.cretaeuser =(req,res) =>{
    res.status(500).json({
        status: 'error',
        message: 'not declared this route'
    })
}
exports.singleuser = (req,res) =>{
    res.status(500).json({
        status: 'error',
        message: 'not declared this route'
    })
}
exports.updateMe = catchAsync(async (req,res,next) =>{
    // user Does not allow to update password 
    if(req.body.password || req.body.confirmPassword) next(new appError('this route is not allowed to update password go to /updateMyPassword',400));
    
    // 2) update user with specified fields
    const filterBody = filterObj(req.body,['name', 'email',]);
    console.log(filterBody)
    const updateUser = await User.findByIdAndUpdate(req.user.id,filterBody,{
        new:true,
        runValidators: true
    })
    res.status(200).json({
        status: 'success',
        message: 'profile updated successfully',
        data:{
            updateUser
        }
    })
})