const appError = require('./../utils/appError.js');

// cast Error function 
const handleCastErrorDB = err =>{
    const message = `Invalid ${err.path}: ${err.value}.`
    return new appError(message,400);
    
}

// JWT ERR function
const handleJWTErrorDB = () => new appError('Invalid Token , Please Login again ', 401)
// Token Expires err function
const handleTokenExpireErrorDB =() => new appError('Your Token has Expired,please login again', 401)

// Dubblicate Error function
const handleDublicateErrorDB = err =>{
    const message = `this : "${err.keyValue.name}" Already exit.`
    return new appError(message,500);
}

//  Validation Error function
const handleValidatorErrorDB = err =>{
    const errors = Object.values(err.errors).map(el => el.message)
    const message = `Invalid Input data. ${errors.join('. ')}`;
    return new appError(message,500);
}
const sendErrorDev = (err,res) =>{
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack : err.stack
    });
}

const sendErrorPro = (err,res) =>{
   if(err.isOperational){
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
    });
   }else{
    console.error('Error 💥',err);
    res.status(500).json({
        status: 'error',
        message: 'Something went very wrong!',
    })
   }
}


module.exports=(err,req,res,next) => {
    let error ='';
    // console.log(err.stack);
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error'
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    }else if (process.env.NODE_ENV === 'production') {
        // let error = {...err};
        // console.log(err.name);
        if(err.name ==='CastError') {
            error = handleCastErrorDB(err);
            return sendErrorPro(error, res);
        }
        if(err.code === 11000){
            error = handleDublicateErrorDB(err);
            return sendErrorPro(error, res);
        }
        if(err.name === 'ValidationError') {
            error = handleValidatorErrorDB(err);
            return next(sendErrorPro(error, res))
        }
        if (err.name == 'JsonWebTokenError'){
            error = handleJWTErrorDB(err);
            return sendErrorPro(error, res);
        } 
        if (err.name == 'TokenExpiredError'){
            error = handleTokenExpireErrorDB(err);
            return sendErrorPro(error, res);
        }

        sendErrorPro(err, res);
    }
   
}