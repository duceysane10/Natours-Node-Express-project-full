
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
exports.allusers =catchAsync(async(req,res) =>{
    const users = await User.find()
    res.status(200).json({
        status: 'success',
        result: users.length,
        Data:{
            users: users
        }
    })
});
exports.cretaeuser =(req,res) =>{
    res.status(500).json({
        status: 'error',
        message: 'not declared this route'
    })
}

  // Single user User functions
    exports.singleuser =catchAsync(async(req,res,next) =>{
        const user = await User.findById(req.params.id)
        // if the user does not exist 
        if(!user){
            return next(new appError('this user Does`t Exist',400));
        }
           // 2) check if the user Active Account
        // console.log(user.active)
        if(!user.active === true){
            return next(new appError('this account is Deleted',400));
        }
        res.status(200).json({
            status: 'success',
            result: user.length,
            Data:{
                users: user
            }
        })
    });

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
// User Delete His Account but we only in active as backub
exports.DeleteMe =  catchAsync(async(req,res,next) =>{
    const user = await User.findByIdAndUpdate(req.user.id)
    user.active = false
    await user.save({validateBeforeSave: false});
    
    res.status(204).json({
        statusbar: 'success',
        message: `You have successfully deleted this user: " ${user.name}"`
    })
    
})

// Admin Delete user
exports.DeleteuserByAdmin =  catchAsync(async(req,res,next) =>{
    const user = await User.findByIdAndUpdate(req.params.id).select('+active');
    // 2) check if the user Active Account
    // console.log(user.active)
    if(!user.active === true){
        return next(new appError(`this account  : " ${user.name} " already Deleted`,400));
    }
    user.active = false
    await user.save({validateBeforeSave: false});
    
    res.status(201).json({
        statusbar: 'success',
        message: `You have successfully deleted this user: " ${user.name} "`
    })
    
})