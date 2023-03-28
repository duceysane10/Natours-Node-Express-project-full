// Using promisifying in side utility functions
const crypto = require('crypto')
const { promisify } = require('util');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const appError = require('./../utils/appError');
const SendEmail = require('./../utils/email');

// Generate Token function
const SignToken = id =>{
   return jwt.sign({ id },process.env.JWT_SECRET,{
      expiresIn: process.env.JWT_EXPIRES_IN})
}
// Function creates and sends Token
const cretaeSendToken =(user,statusCode,res) =>{
   const token = SignToken(user._id)
     res.status(statusCode).json({
        status : 'success',
        Token: token,
        data:{
         user
        }
     });
}
exports.Signgup = catchAsync(async(req,res,next) =>{
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
      passwordChangedAt:req.body.passwordChangedAt,
      role: req.body.role,
      passwordResetToken: req.body.passwordResetToken,
      passwordResetTokenExpires: req.body.passwordResetTokenExpires
      // photo: req.body.photo
    });
   
    cretaeSendToken(newUser,201,res)
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
    cretaeSendToken(user,200,res)
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

// Autorizing the user To do Same Actions 
exports.restrictTo = (...roles) => {
   return (req, res, next) => {
      if(!roles.includes(req.user.role)){
         return next(new appError('You are not authorized to do this action',403));
      }
      next();
   }
}

// Forgot Password Authentication
exports.forgotPassword = catchAsync(async(req, res, next) => {
   // 1) check if the user email address is valid
   const user = await User.findOne({email: req.body.email})
   if(!user){
      return next(new appError('The Email address does not exist',403));
   }
   
   // 2) generate Reset Tken 
   const resetToken =  user.createResetPasswordToken()
   await user.save({validateBeforeSave: false});
   
   // 3) Send the Token  to the Users Email
   
   const Url = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`
   const message = `Forgot your password? Please Submit a PATCH request with your new password and passwordConfirm to:\n ${Url}.\n If you didn't forgot your password, please ignore this email!`
   
   try{
      await SendEmail({
         email:user.email,
         subject: 'Your password reset token (valid for 10 minutes):',
         message
      })
      res.status(200).json({
         satatus: 'success',
         message: 'Token Sent to Email'
      })
   }catch(err){
      user.passwordResetToken=undefined
      user.passwordResetTokenExpires = undefined
      await user.save({validateBeforeSave: false});
      console.log(err)
      return next(new appError('There was an error Sending  email,please try again later',500));
   }
})

exports.resetPassword = async (req, res, next) => {
   // 1) Get a User Based on the Token
   const HashedToken= crypto.createHash('sha256').update(req.params.Token).digest('hex');
   console.log(HashedToken)
   const user = await User.findOne({passwordResetToken: HashedToken,passwordResetTokenExpires: {$gt: Date.now()}})
 
   // 2) if the token not Expire and the User is Exist then Set New Password
   if(!user){
      return next(new appError('Token is invalid or Expired',400))
   }
   user.password = req.body.password
   user.confirmPassword = req.body.confirmPassword
   user.passwordResetToken = undefined
   user.passwordResetTokenExpires = undefined
   await user.save();
   // 3) Update changedPasswordAt property for the User
   
   // 4) Log the User in, Send JWT Token
   cretaeSendToken(user,200,res)
}

// User updating his/her password
exports.updatePassword = catchAsync(async (req, res,next)=>{
   // 1) Get a User from Collection
   const user = await User.findById(req.params.id).select('+password')
   console.log(user)
   // if(!user){
   //    return next(new appError('User not found!',404))
   // }
   // 2) check if the Current Password posted is the same as the Passwordold 

   if(!(await user.correctPassword(req.body.currentpassword,user.password))){
      return next(new appError('invalid current password!',401));
   }
   
   // 3) if So update the password
   user.password =req.body.password
   user.confirmPassword = req.body.confirmPassword
   await user.save();
   
   // 4) login the User and send JWT Token
   cretaeSendToken(user,200,res)
});