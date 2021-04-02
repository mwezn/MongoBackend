require('dotenv').config()
const express= require('express')
const app =express()
const mongoose = require('mongoose')
const routes = require('./routes') // includes the routes.js file
const cors = require('cors') // includes cors module
const User = require('./models/Emailschema')
var cron= require('node-cron');
var nodemailer=require('nodemailer')

app.use(cors()) // We're telling express to use CORS
app.use(express.json()) // we need to tell server to use json as well
app.use(routes)
mongoose.connect(process.env.DATABASE_URI, { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection

User.find({}, (err, d)=>{
    if (err) console.log(err)
    if (d) console.log(d)
})

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


cron.schedule('* * * * *', ()=>{
    let t=new Date();
    let f=t.toISOString();
    User.find({}, (err, d)=>{
        if (err) console.log(err)
        if (d) console.log(d)
        mailOptions.html=`Email sent at: ${f.slice(11,19)} & the user in db is ${d} `
        console.log(d)
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
    })
    //mailOptions.html=`Email sent at: ${f.slice(11,19)} & the user in db is ${users} `
    
    console.log('running every minute');
    

})


db.on('error', (error) => console.error(error))
db.once('open', () => console.log('database connected'))

app.listen(process.env.PORT,()=>{
    console.log("The API is running on Port:" + process.env.PORT)
})


