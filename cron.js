require('dotenv').config();
var cron =require('node-cron');
var express=require('express')
var nodemailer=require('nodemailer')
let app=express();

let sender= process.env.EMAIL
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS
    },
     tls: {
            rejectUnauthorized: false
        }
  });
  var mailOptions = {
    from: `${sender}`,
    to: 'wezleyg78@gmail.com',
    subject: 'Welcome after Registering! ',
    html: '<h1>That was easy!</h1>'
  };

function cronFunc(){
  cron.schedule('* * * * *', ()=>{
    let t=new Date();
    let f=t.toISOString();
    User.find({}, (err,d)=>{
      mailOptions.html=`Email sent at: ${f.slice(11,19)} & the user in db is ${d} `
      console.log(users)
      console.log('running every minute');
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });

    })

    

})
  
}


cron.schedule('* * * * *', ()=>{
    let t=new Date();
    let f=t.toISOString();
    const users = User.find({})

    mailOptions.html=`Email sent at: ${f.slice(11,19)} & the user in db is ${users} `
    console.log(users)
    console.log('running every minute');
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });

})

//cronFunc();
app.listen(3001);
