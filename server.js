
const dotenv = require('dotenv');

const mongoose = require('mongoose');

dotenv.config({ path:'./config.env' });

/////// printing all environment variables
// console.log(process.env)

////////  Catching uncaughtException errors like Database connection errors
process.on('uncaughtException',err =>{
    console.log(err.name,err.message);
        console.log('uncaughtException! 💥 shouting down...');
        process.exit(1);
});

const app = require('./app');
// console.log(process.env.DATABASE
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose
// .connect(process.env.DATABASE_LOCAL,{  //localhost connection
.connect(DB, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(con =>{
    // console.log(con.connection);
    console.log('DB connection successfully!');
})

// console.log(process.env.NODE_ENV)

const  port = process.env.PORT || 3000;
const server = app.listen(port,() =>{
    console.log(`Server listening on port ${port}`);
});


//  Catching uncaughtException errors like Database connection errors
process.on('unhandledRejection',err =>{
    console.log(err.name,err.message);
    console.log('unhandledRejection! 💥 shouting down...');
    server.close(()=>{
        process.exit(1);
    })
});


