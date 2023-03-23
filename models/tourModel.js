const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
// creating Schema
const tourSchema = new mongoose.Schema({
    name:{
        type: String,
        required:[true, 'Tour must have a name'],
        unique: true,
        trim : true,
        maxlength: [40, 'a tour must have less or equal 40 characturs'],
        minlength: [10, 'a tour must have more or equal 10 characturs'],
        // using validater liberary to validate
        // validate:[validator.isAlpha,'Tour Must only contain characters']
    },
    slug:String,
    duration:{
        type: Number,
        required:[true, 'A Tour must have Duarations'],
    },
    maxGroupSize: {
        type: Number,
        required:[true, 'A tour must have GroupSize'],
    },
    difficulty: {
        type: String,
        required:[true, 'A tour must have difficulty'],
        enum:{
            values:['easy','medium','difficult'],
            message: 'Defficult is either: easy,medium,difficult'
        }
    },
    price: {
        type: Number,
        required:[true, 'Tour must have a price'],
    },
    priceDiscount : {
        type: Number,
        validate:{
            validator: function(val){
                return val < this.price;
            },
            message: 'Discount price ({VALUE}) should be lower than price'
        }
    },
    ratingsAverage:{
        type: Number,
        default: 4.5,
        min: [1,'Rating must be above 0'],
        max: [5,'Rating must be below 6']
    },
    ratingsQuantity:{
        type: Number,
        default: 0
    },
    summary:{
        type: String,
        trim: true,
        required:[true, 'A tour must have a summary'],
    },
    description:{
        type: String,
        trim: true,
    },
    imageCover:{
        type: String,
        required:[true, 'cover image is required']
    },
    images: [String],
    
    createdAt : {
        type: Date,
        default: Date.now(),
        Select : false,
    },
    startDates : [Date],  
    secretTour: {
        type: Boolean,
        default: false
    }
}, 
// in order to display virtual property type lines bellow
{
    toJSON :{virtuals:true},
    toObject :{virtuals:true},
})

// Creating virtual Property
tourSchema.virtual('durationWeeks').get(function(){
    return this.duration / 7;
})

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre('save', function(next){
    this.slug = slugify(this.name, { lower: true });
    next();
})

tourSchema.pre('save', function(next){
    console.log('will saving.......');
    next();
})

// tourSchema.post('save', function(doc,next){
//     console.log(doc);
//     next();
// })

// QUERY MIDDLEWARE: runs 
// tourSchema.pre('find', function(next){
tourSchema.pre(/^find/, function(next){  // we use regular expression in order to use both find and findOne
    //     /^find/  = means every one starts with find
    this.find({ secretTour : {$ne: true} } );
    this.Start = Date.now();
    next();
});

tourSchema.post(/^find/, function(doc,next){
    console.log(`Query Took : ${Date.now() - this.Start} milliseconds!`)
    console.log(doc);
    next();
})

// Aggregation MIDDLEWARE
tourSchema.pre('aggregate', function(next){
    this.pipeline().unshift({$match: { secretTour: {$ne: true} } });
    console.log(this.pipeline())
    next();
})
const Tour = new mongoose.model('Tour',tourSchema);

module.exports = Tour;