const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
    review:{
        type: String,
        require: [true,'Tour must have Review']
    },
    rating:{
        type:Number,
        default:0,
        min: [1,'Rating must be above 0'],
        max: [5,'Rating must be below 6']
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    Tours:
    {
        type:mongoose.Schema.ObjectId,
        ref:'Tour',
        require: [true,'Review must belongs to a Tour ']
    }
    ,
    Users:
    {
        type:mongoose.Schema.ObjectId,
        ref:'User',
        require: [true,'Review must belongs to a User ']
    }
    
    
},
// in order to display virtual property type lines bellow
{
    toJSON :{virtuals:true},
    toObject :{virtuals:true},
})

// Populating Tour and user in the Review

reviewSchema.pre(/^find/,function(next){
    this.populate({
        path: 'Users',
        select: 'name photo'
    }).populate({
        path: 'Tours',
        select: 'name'
    })
    next()
})

const Review = new mongoose.model('Review', reviewSchema)

module.exports = Review;