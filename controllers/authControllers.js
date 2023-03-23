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
    const token = SignToken(user._id)
   res.status(201).json({
      status : 'success',
      token
   })
})