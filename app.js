const express = require('express');
const morgan = require('morgan');
const appError = require('./utils/appError.js');
const GolobalErrorHandlers = require('./controllers/errorControllers');
// Security packages
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanizer = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const app = express();
// import the routes 
const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');


// Golobal middle wares
// Set Security HTTP headers
app.use(helmet());

// Development Login
if(process.env.NODE_ENV === 'development'){
    // third party midleware
app.use(morgan('dev'));
}
//  Limiting many request from the same Api, allow 100 times per 1hour
 const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this Ip ,please try again in a hour'
 });
 app.use('/api',limiter);
 
//  body parser, rating  Data from body into req.body
// if the request.body larger than 10kb then the request will be rejected
app.use(express.json({limit: '10kb'}));

//  Data sanitization against NoSql Query enjection
app.use(mongoSanizer());

//  Data sanitization against XSS ateckers 
app.use(xss());

// prvent prameter pollution
app.use(hpp({
    // white listigaan ww inta sorrt ee aan dublicate u ogalaan karno error la aan
    whitelist: [
        'duration',
        'maxGroupSize',
        'difficulty',
        'price',
        'startDates',
        'createdAt',
        'ratingsAverage',
        'ratingsQuantity'
    ]
}))

// Serving Static files
app.use(express.static(`${__dirname}/public`));

// Tset Middleware
app.use((req,res,next)=>{
    req.requestTime = new Date().toISOString();
    // console.log('Hello from the Middleware 👋');
    // console.log(req.headers)
    next();
})

// Mounting Route
app.use('/api/v1/tours',tourRouter);
app.use('/api/v1/users',userRouter);

app.all('*', (req, res,next) => {
 
    next(new appError(`oops Can't Find ${req.originalUrl} in this Server!`,404));
});

// Express Golobal Error Handling Middleware
app.use(GolobalErrorHandlers)
module.exports = app;