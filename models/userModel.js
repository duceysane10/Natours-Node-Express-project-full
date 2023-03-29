const crypto = require('crypto');
const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const bcrypt = require('bcrypt');

// creating User Schema
const userSchema= new mongoose.Schema({
    name:{
        type: String,
        required: [true,'Please Tell us Your Name'],
        trim:true,
        minlength:[5,'userName must be at least 10 characters long'],
        maxlength:[50,'userName must be at most 50 characters long'],
    },
    email:{
        type: String,
        required:[true,'Please tell us your email address'],
        lowercase:true,
        unique: true,
        validate: [validator.isEmail,'Please enter a valid email address'],
        trim: true,
    },
    role:{
        type: String,
        enum:['user','admin','lead-guide'],
        default: 'user',
    },
    password: {
        type: String,
        required:[true,'User must have a password'],
        trim: true,
        minlength: [8,'password must be at least 8 characters long'],
        maxlength: [20,'password must be at most 20 characters long'],
        select: false
    },
    passwordChangedAt:Date,
    confirmPassword: {
        type: String,
        required:[true,'User must have a confirmPassword'],
        trim: true,
        //  // This only works for save() and create() operations
        validate : {
            validator: function(el){
                return el === this.password;
            },
            message: 'Paswords are not Same'
        }
    },
    active:{
        type: Boolean,
        default: true,
        select: false
    },
    photo: String,
    passwordResetToken: String,
    passwordResetTokenExpires:Date
});

 
// paasword encrypting 
userSchema.pre('save', async function(next){
    // only runs this function once password field is actually modified
    if(!this.isModified('password')) return next();
    // Hash the password with Cost of 12
    this.password = await bcrypt.hash(this.password,12);
    // Delete confirmPassword field
    this.confirmPassword = undefined;
    next();
});

// creating instance method to check if the login password is matched with the password, this method we can acces all the related documents
userSchema.methods.correctPassword = async function(gardianPassword,userpassword){
    return await bcrypt.compare(gardianPassword,userpassword)
}
// instance methood of checking if the passord changed after Token issued
userSchema.methods.changedPasswordAt = function(JWTtimestamp){
    if(this.passwordChangedAt){
        // converting milliseconds
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000,10);
        // console.log(JWTtimestamp < changedTimestamp)
        return JWTtimestamp < changedTimestamp
       
    }
    // false means : after token issued the password not changed
    return false;
}
// Createing method that genereates Roundom ResetPassword token

userSchema.methods.createResetPasswordToken = function(){
    // creating Rondom reset password token
    const resetToken = crypto.randomBytes(32).toString('hex');
    // encrypt reset token and save to database
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    // current DateTime plus 10 miint converting milliseconds saving in database so as to use as expiration Token
    // console.log({resetToken},this.passwordResetToken);
    this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000
    return resetToken;
}

// When password changed update passwordChangedAt property
userSchema.pre('save', function(next){
    if(!this.isModified('password') || this.isNew) return next();
    
    this.passwordChangedAt = Date.now() -1000;
    next();
})

// this middleware only finds active users 
userSchema.pre(/^find/,function(next){
    // this ponts to the Current Query
    this.find({active: {$ne:false}})
    next();
})

// creating User Model
const User= new mongoose.model('User', userSchema);
// Exporting the User Model 
module.exports = User;