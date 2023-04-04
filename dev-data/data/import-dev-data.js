const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');

const Tour = require('./../../models/tourModel');

dotenv.config({path: './config.env'});

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose.connect(DB, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(con =>{
    // console.log(con.connection);
    console.log('DB connection successfully!');
});

//  Importing JSON DATA in to the database
// to import Data in the Database: type in the terminal=  node ./dev-data/data/import-dev-data.js --import
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`,'utf-8'));
const importData = async() =>{
   try{
    await Tour.create(tours);
    console.log('Data loaded Successfully!');
   }catch(err){
    console.log(err);
    }
    process.exit();
}

// DELETE ALL TOURS IN DATABASE
// // to DELETE Data from the Database : type in the terminal= node ./dev-data/data/import-dev-data.js --deletedata
const DeleteData = async() =>{
    try{
        console.log(Tour);
     await Tour.deleteMany();
     console.log('All Data deleted Successfully!');
     
    }catch(err){
     console.log(err);
     }
     process.exit();
 }
 
 if(process.argv[2] === '--import'){
    importData();
 }
 else if(process.argv[2] === '--deletedata'){
    DeleteData();
 }
 console.log(process.argv);