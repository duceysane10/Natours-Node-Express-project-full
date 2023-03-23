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
    password: {
        type: String,
        required:[true,'User must have a password'],
        trim: true,
        minlength: [8,'password must be at least 8 characters long'],
        maxlength: [20,'password must be at most 20 characters long'],
        select: false
    },
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
    photo: String    
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
// creating User Model
const User= new mongoose.model('User', userSchema);
// Exporting the User Model 
module.exports = User;