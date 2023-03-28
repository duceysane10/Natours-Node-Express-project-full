const nodemailer = require('nodemailer');

const sendEmail = async options =>{
    // 1) Create TransPorter 
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port:process.env.EMAIL_PORT,
        auth:{
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    })
    // 2)Defining Email Options
    const mailOptions ={
        from: 'Eng Duceysane <engduceysane10@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html:
    }
    // 3) Actualy Sending Email
    await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;