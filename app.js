const express = require('express');
const morgan = require('morgan');
const appError = require('./utils/appError.js');
const GolobalErrorHandlers = require('./controllers/errorControllers');

const app = express();
// import the routes 
const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');


// middle ware
app.use(express.json());
app.use((req,res,next)=>{
    console.log('Hello from the Middleware 👋');
    // console.log(req.headers)
    next();
})
if(process.env.NODE_ENV === 'development'){
    // third party midleware
app.use(morgan('dev'));
}


// Mounting Route
app.use('/api/v1/tours',tourRouter);
app.use('/api/v1/users',userRouter);


app.all('*', (req, res,next) => {
 
    next(new appError(`oops Can't Find ${req.originalUrl} in this Server!`,404));
});

// Express Golobal Error Handling Middleware
app.use(GolobalErrorHandlers)
module.exports = app;