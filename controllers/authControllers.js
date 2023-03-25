// Using promisifying in side utility functions
const { promisify } = require('util');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const appError = require('./../utils/appError.js');

const SignToken = id =>{
   return jwt.sign({ id },process.env.JWT_SECRET,{
      expiresIn: process.env.JWT_EXPIRES_IN})
}
exports.Signgup = catchAsync(async(req,res,next) =>{
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
      passwordChangedAt:req.body.passwordChangedAt,
      role: req.body.role
      // photo: req.body.photo
    });
    const token = SignToken(newUser._id)
     res.status(200).json({
        status : 'success',
        Token: token,
        User : newUser,
     });
});

exports.login = catchAsync(async(req,res,next) =>{
   //  1) check if email and password are provided
   const {email, password} = req.body
   if(!email || !password){
      return next(new appError('Please provide both email and password',400));
   }
   
   // // 2) check if email and password are correct and exists
   const user = await User.findOne({email}).select('+password');
   if(!user || !(await user.correctPassword(password,user.password))){
      return next(new appError('Please provide Correct Email or password',401))
   }
   
    // 3) if its ok Send Token to the User
    const Token = SignToken(user._id)
   res.status(201).json({
      status : 'success',
      Token
   })
})

// Protected Route Miidleware
exports.protectedRoute = catchAsync(async (req,res,next) =>{
   let token;
   // 1) Getting the Token and check if it's correct
   if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
      token = req.headers.authorization.split(' ')[1];
      // console.log(token);
   }
   if(!token){
      return next(new appError('You ara not logged in!, Pleas login to Get Access',401));
   }
   // 2) Verification the Token
   const decoded = await promisify(jwt.verify)(token,process.env.JWT_SECRET)
   // console.log(decoded)
   // 3) check if the user exists
   const currentUser = await User.findById(decoded.id);
   // console.log(currentUser)
   if(!currentUser){
      return next(new appError('the user belongs to this Token does no longer exist',401));
   }
   // 4) check if the user password changed after the Token was issued 
   if(currentUser.changedPasswordAt(decoded.iat)){
      return next(new appError('the user password changed Recently ,Please Login again',401));
   }
   
   // GRANT ACCESS TO  THE PROTECTED ROUTE
   req.user = currentUser;
   next();
   
});

exports.restrictTo = (...roles) => {
   return (req, res, next) => {
      if(!roles.includes(req.user.role)){
         return next(new appError('You are not authorized to do this action',403));
      }
      next();
   }
}